import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { config, DATA_DIR } from "./config.ts";

/**
 * Toute l'IA passe par Claude Code (CLI `claude`), connecté à l'abonnement Claude :
 * aucune clé API n'est utilisée, les appels consomment le quota de l'abonnement.
 */

const WORK_DIR = path.join(DATA_DIR, "claude");
fs.mkdirSync(WORK_DIR, { recursive: true });

/** Erreur qui ne se règlera pas en réessayant (quota atteint, déconnecté...). */
export class FatalAiError extends Error {}

const FATAL = /limit|quota|credit|not logged in|log ?in|authenticat|unauthori[sz]ed|oauth|subscription/i;

// Sans ces variables, Claude Code utilise la connexion claude.ai (l'abonnement).
function subscriptionEnv() {
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;
  return env;
}

export function claudeLoggedIn() {
  const res = spawnSync("claude", ["auth", "status"], { env: subscriptionEnv(), encoding: "utf8", timeout: 15_000 });
  try {
    return Boolean(JSON.parse(res.stdout).loggedIn);
  } catch {
    return false;
  }
}

interface RunOptions {
  prompt: string;
  system?: string;
  /** JSON Schema : la réponse est alors renvoyée dans `structured`. */
  schema?: Record<string, unknown>;
  /** Outils intégrés disponibles (ex. WebSearch, Bash). Aucun par défaut. */
  tools?: string[];
  /** Outils autorisés sans confirmation (y compris les outils MCP). */
  allowedTools?: string[];
  /** Charge les serveurs MCP de l'utilisateur (Figma). */
  useMcp?: boolean;
  effort?: "low" | "medium" | "high" | "xhigh";
  timeoutMs?: number;
  /** Dossier de travail (par défaut un dossier interne à l'app). */
  cwd?: string;
  /** Ex. "acceptEdits" pour laisser Claude écrire des fichiers dans `cwd`. */
  permissionMode?: string;
  /** Suivi en direct : reçoit une ligne lisible à chaque action de Claude. */
  onProgress?: (line: string) => void;
}

/** Résume un message du flux stream-json en une ligne de journal. */
function describeEvent(event: any): string[] {
  if (event.type !== "assistant") return [];
  return (event.message?.content ?? []).flatMap((block: any) => {
    if (block.type === "text" && block.text.trim()) return [block.text.trim().replace(/\s+/g, " ").slice(0, 300)];
    if (block.type !== "tool_use") return [];
    const input = block.input ?? {};
    const detail = input.description || input.command || input.file_path || input.pattern || input.url || input.skill || input.nodeId || "";
    return [`[${block.name.replace(/^mcp__figma__/, "figma ")}] ${String(detail).replace(/\s+/g, " ").slice(0, 200)}`];
  });
}

export async function runClaude<T = unknown>(opts: RunOptions): Promise<{ result: string; structured: T }> {
  const stream = Boolean(opts.onProgress);
  const args = ["-p", "--output-format", stream ? "stream-json" : "json", "--no-session-persistence", "--tools", (opts.tools ?? []).join(",")];
  if (stream) args.push("--verbose");
  if (opts.permissionMode) args.push("--permission-mode", opts.permissionMode);
  if (opts.allowedTools?.length) args.push("--allowedTools", ...opts.allowedTools);
  if (!opts.useMcp) args.push("--strict-mcp-config");
  if (opts.schema) args.push("--json-schema", JSON.stringify(opts.schema));
  if (opts.system) args.push("--append-system-prompt", opts.system);
  if (opts.effort) args.push("--effort", opts.effort);
  if (config.model) args.push("--model", config.model);

  const stdout = await new Promise<string>((resolve, reject) => {
    const child = spawn("claude", args, { cwd: opts.cwd ?? WORK_DIR, env: subscriptionEnv(), stdio: ["pipe", "pipe", "pipe"] });
    let out = "";
    let err = "";
    let pending = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), opts.timeoutMs ?? 5 * 60_000);
    child.stdout.on("data", (d) => {
      if (!stream) return void (out += d);
      // Une ligne JSON par événement ; on garde la dernière ligne "result".
      pending += d;
      const lines = pending.split("\n");
      pending = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line);
          if (event.type === "result") out = line;
          else describeEvent(event).forEach((l) => opts.onProgress!(l));
        } catch {}
      }
    });
    child.stderr.on("data", (d) => (err += d));
    child.on("error", (e) =>
      reject(new FatalAiError(e.message.includes("ENOENT") ? "CLI `claude` introuvable : installez Claude Code" : e.message)),
    );
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      if (stream && pending.trim().startsWith('{"type":"result"')) out = pending;
      if (signal) return reject(new Error("Claude Code a mis trop de temps à répondre"));
      // En cas d'erreur, la sortie JSON contient souvent le message utile.
      if (out.trim().startsWith("{") || code === 0) return resolve(out);
      const msg = (err || out).trim().slice(0, 400) || `code ${code}`;
      reject(FATAL.test(msg) ? new FatalAiError(msg) : new Error(`Claude Code a échoué : ${msg}`));
    });
    child.stdin.end(opts.prompt);
  });

  const data = JSON.parse(stdout) as { is_error?: boolean; subtype?: string; result?: string; structured_output?: T };
  if (data.is_error || data.subtype !== "success") {
    const msg = data.result || data.subtype || "erreur inconnue";
    throw FATAL.test(msg) ? new FatalAiError(msg) : new Error(`Claude Code : ${msg}`);
  }
  if (opts.schema && data.structured_output === undefined) throw new Error("Claude Code n'a pas renvoyé de résultat structuré");
  return { result: data.result ?? "", structured: data.structured_output as T };
}
