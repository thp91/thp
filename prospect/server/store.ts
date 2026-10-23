import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, MOCKUP_DIR } from "./config.ts";
import { describeEstimate, type Estimate } from "./pricing.ts";

/**
 * Stockage sans base de données : deux fichiers JSON dans data/ (prospects, recherches).
 * Les données sont gardées en mémoire et réécrites à chaque modification
 * (écriture atomique : fichier temporaire puis renommage).
 * Les colonnes « JSON » (emails, issues, signals, dev_log, log, estimate) restent
 * des chaînes, comme dans l'ancienne base SQLite : le reste du code est inchangé.
 */

fs.mkdirSync(MOCKUP_DIR, { recursive: true });

const PROSPECTS_FILE = path.join(DATA_DIR, "prospects.json");
const SEARCHES_FILE = path.join(DATA_DIR, "searches.json");

export type ProspectStatus = "nouveau" | "maquette" | "mail_envoye" | "validation" | "developpement" | "ecarte";

export interface ProspectRow {
  id: number;
  search_id: number | null;
  name: string;
  url: string;
  domain: string;
  city: string | null;
  activity: string | null;
  email: string | null;
  emails: string;
  status: ProspectStatus;
  score: number | null;
  verdict: string | null;
  summary: string | null;
  issues: string;
  signals: string;
  page_text: string | null;
  mockup_status: "none" | "pending" | "figma" | "done" | "error";
  mockup_error: string | null;
  mockup_file: string | null;
  figma_url: string | null;
  figma_error: string | null;
  figma_file_key: string | null;
  mockup_version: number;
  dev_status: "none" | "running" | "done" | "error";
  dev_dir: string | null;
  dev_log: string;
  dev_error: string | null;
  dev_summary: string | null;
  site_domain: string | null;
  estimate: string | null;
  email_subject: string | null;
  email_body: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface SearchRow {
  id: number;
  activity: string;
  city: string;
  target: number;
  status: "running" | "done" | "error";
  found: number;
  log: string;
  created_at: string;
}

const read = <T,>(file: string): T[] => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as T[];
  } catch {
    return [];
  }
};

const write = (file: string, rows: unknown[]) => {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2));
  fs.renameSync(tmp, file);
};

const prospects = read<ProspectRow>(PROSPECTS_FILE);
const searches = read<SearchRow>(SEARCHES_FILE);
const saveProspects = () => write(PROSPECTS_FILE, prospects);
const saveSearches = () => write(SEARCHES_FILE, searches);
const nextId = (rows: { id: number }[]) => rows.reduce((max, r) => Math.max(max, r.id), 0) + 1;
const now = () => new Date().toISOString().replace("T", " ").slice(0, 19);

// Une maquette, un développement ou une recherche interrompus par un redémarrage ne restent pas « en cours ».
for (const p of prospects) {
  if (p.mockup_status === "pending" || p.mockup_status === "figma") {
    Object.assign(p, { mockup_status: "error", mockup_error: "Interrompu (redémarrage du serveur)" });
  }
  if (p.dev_status === "running") {
    Object.assign(p, { dev_status: "error", dev_error: "Interrompu (redémarrage du serveur) : relancez pour reprendre là où il en était" });
  }
}
for (const s of searches) if (s.status === "running") s.status = "error";
saveProspects();
saveSearches();

// --- Prospects -------------------------------------------------------------

export function listProspects() {
  return [...prospects].sort((a, b) => (b.score ?? -1) - (a.score ?? -1) || b.id - a.id);
}

export function getProspect(id: number) {
  return prospects.find((p) => p.id === id);
}

export function updateProspect(id: number, fields: Partial<Omit<ProspectRow, "id">>) {
  const p = getProspect(id);
  if (!p || !Object.keys(fields).length) return;
  Object.assign(p, fields);
  saveProspects();
}

/** Ajoute un prospect ; renvoie false si le domaine est déjà connu (équivalent de INSERT OR IGNORE). */
export function insertProspect(fields: Pick<ProspectRow, "search_id" | "name" | "url" | "domain" | "city" | "activity" | "email" | "emails" | "score" | "verdict" | "summary" | "issues" | "signals" | "page_text">) {
  if (prospects.some((p) => p.domain === fields.domain)) return false;
  prospects.push({
    ...fields,
    id: nextId(prospects),
    status: "nouveau",
    mockup_status: "none",
    mockup_error: null,
    mockup_file: null,
    figma_url: null,
    figma_error: null,
    figma_file_key: null,
    mockup_version: 0,
    dev_status: "none",
    dev_dir: null,
    dev_log: "[]",
    dev_error: null,
    dev_summary: null,
    site_domain: null,
    estimate: null,
    email_subject: null,
    email_body: null,
    sent_at: null,
    created_at: now(),
  });
  saveProspects();
  return true;
}

export function knownDomains(): string[] {
  return prospects.map((p) => p.domain);
}

export function appendDevLog(id: number, line: string) {
  const p = getProspect(id);
  if (!p) return;
  const log = JSON.parse(p.dev_log) as string[];
  log.push(`${new Date().toLocaleTimeString("fr-FR")} — ${line}`);
  updateProspect(id, { dev_log: JSON.stringify(log.slice(-400)) });
}

/** Forme renvoyée au front (sans le texte brut de la page). */
export function serializeProspect(p: ProspectRow) {
  const { page_text, emails, issues, signals, dev_log, estimate, ...rest } = p;
  const est = estimate ? (JSON.parse(estimate) as Estimate) : null;
  return {
    ...rest,
    estimate: est && { ...est, ...describeEstimate(est) },
    dev_log: JSON.parse(dev_log) as string[],
    emails: JSON.parse(emails) as string[],
    issues: JSON.parse(issues) as string[],
    signals: JSON.parse(signals) as Record<string, unknown>,
    mockup_preview: p.mockup_file ? `/api/prospect/maquettes/${p.id}` : null,
  };
}

// --- Recherches ------------------------------------------------------------

export function listSearches(limit = 10) {
  return [...searches].sort((a, b) => b.id - a.id).slice(0, limit);
}

export function createSearch(activity: string, city: string, target: number) {
  const search: SearchRow = { id: nextId(searches), activity, city, target, status: "running", found: 0, log: "[]", created_at: now() };
  searches.push(search);
  saveSearches();
  return search.id;
}

export function updateSearch(id: number, fields: Partial<Pick<SearchRow, "status" | "found">>) {
  const s = searches.find((item) => item.id === id);
  if (!s) return;
  Object.assign(s, fields);
  saveSearches();
}

export function appendSearchLog(id: number, line: string) {
  const s = searches.find((item) => item.id === id);
  if (!s) return;
  const log = JSON.parse(s.log) as string[];
  log.push(`${new Date().toLocaleTimeString("fr-FR")} — ${line}`);
  s.log = JSON.stringify(log.slice(-200));
  saveSearches();
}
