import fs from "node:fs";
import path from "node:path";
import { loadPrompt } from "./ai.ts";
import { runClaude } from "./claude.ts";
import { ASSET_DIR, SITES_DIR } from "./config.ts";
import { appendDevLog, getProspect, updateProspect } from "./store.ts";

// Outils dont Claude Code a besoin pour développer un site seul, sans confirmation.
const BASH = ["npm", "npx", "node", "git", "curl", "mkdir", "ls", "cp", "mv", "cat", "find", "grep", "head", "tail", "wc", "python3"];
const FIGMA_READ = ["get_metadata", "get_design_context", "get_screenshot", "get_variable_defs"].map((t) => `mcp__figma__${t}`);
const TOOLS = ["Bash", "Read", "Write", "Edit", "Glob", "Grep", "Skill", "WebFetch"];

export function parseFigmaUrl(url: string) {
  const fileKey = url.match(/figma\.com\/(?:design|file)\/([0-9a-zA-Z]+)/)?.[1];
  const nodeId = url.match(/node-id=(\d+)[-:](\d+)/);
  return fileKey ? { fileKey, nodeId: nodeId ? `${nodeId[1]}:${nodeId[2]}` : null } : null;
}

/**
 * Lance Claude Code pour développer le site du client à partir de la maquette Figma
 * validée. Tourne en tâche de fond (souvent 30 min à plus d'une heure) ; chaque
 * action de Claude est ajoutée au journal du prospect.
 */
export async function startDevelopment(id: number, opts: { figmaUrl: string; siteDomain: string; notes: string }) {
  const p = getProspect(id);
  if (!p) throw new Error("Prospect introuvable");
  const figma = parseFigmaUrl(opts.figmaUrl);
  if (!figma) throw new Error("Lien Figma invalide");

  const siteDomain = opts.siteDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  const siteDir = path.join(SITES_DIR, siteDomain.replace(/^www\./, "").replace(/[^a-z0-9.-]/g, "_"));
  const resuming = fs.existsSync(path.join(siteDir, "package.json"));

  // Les images d'origine du client, récupérées lors de la maquette.
  const sourceDir = path.join(siteDir, "src", "assets", "source");
  fs.mkdirSync(sourceDir, { recursive: true });
  const assets = path.join(ASSET_DIR, String(id));
  if (fs.existsSync(assets)) fs.cpSync(assets, sourceDir, { recursive: true });

  updateProspect(id, {
    status: "developpement",
    dev_status: "running",
    dev_dir: siteDir,
    dev_error: null,
    dev_summary: null,
    site_domain: siteDomain,
  });
  appendDevLog(id, resuming ? `Reprise du développement dans ${siteDir}` : `Démarrage du développement dans ${siteDir}`);

  const notes = [
    opts.notes.trim() && `## Consignes particulières de THP Development\n${opts.notes.trim()}`,
    resuming &&
      "## Reprise\nLe dossier contient déjà un travail commencé. Inspecte-le d'abord, reprends là où il s'est arrêté et ne recommence pas de zéro.",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const { result } = await runClaude({
      prompt: loadPrompt("developpement.md", {
        site_dir: siteDir,
        name: p.name,
        activity: p.activity ?? "",
        city: p.city ?? "",
        email: p.email ?? "voir la maquette",
        old_url: p.url,
        site_domain: siteDomain,
        figma_url: opts.figmaUrl,
        figma_file_key: figma.fileKey,
        home_node: figma.nodeId ?? "le dernier cadre « V<n> — … » du fichier",
        notes,
      }),
      cwd: siteDir,
      tools: TOOLS,
      allowedTools: [...TOOLS.filter((t) => t !== "Bash"), ...BASH.map((c) => `Bash(${c}:*)`), ...FIGMA_READ],
      permissionMode: "acceptEdits",
      useMcp: true,
      effort: "high",
      timeoutMs: 4 * 60 * 60_000,
      onProgress: (line) => appendDevLog(id, line),
    });
    appendDevLog(id, "Développement terminé.");
    updateProspect(id, { dev_status: "done", dev_summary: result });
  } catch (err) {
    appendDevLog(id, `Échec : ${(err as Error).message}`);
    updateProspect(id, { dev_status: "error", dev_error: (err as Error).message });
  }
}
