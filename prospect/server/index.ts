import path from "node:path";
import fs from "node:fs";
import express, { type NextFunction, type Request, type Response } from "express";
import { draftEmail } from "./ai.ts";
import { claudeLoggedIn } from "./claude.ts";
import { config, mailConfigured, MOCKUP_DIR } from "./config.ts";
import { getProspect, listProspects, listSearches, serializeProspect, updateProspect, type ProspectRow } from "./store.ts";
import { sendMail } from "./mailer.ts";
import { createMockup, ensureEstimate, mockupLink, sendToFigma } from "./mockup.ts";
import { describeEstimate, type Estimate } from "./pricing.ts";
import { startSearch } from "./prospecting.ts";
import { parseFigmaUrl, startDevelopment } from "./develop.ts";
import { spawn } from "node:child_process";

/**
 * Serveur local de prospection (utilisé par l'espace admin du site en développement).
 * Il n'écoute que sur 127.0.0.1 : il n'est jamais exposé en ligne.
 * Routes sous /api/prospect, relayées par le serveur de dev Vite (vite.config.js).
 */
const app = express();
app.use(express.json({ limit: "1mb" }));
const router = express.Router();
app.use("/api/prospect", router);

const STATUSES = ["nouveau", "maquette", "mail_envoye", "validation", "developpement", "ecarte"] as const;

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function prospectOr404(req: Request) {
  const p = getProspect(Number(req.params.id));
  if (!p) throw new HttpError(404, "Prospect introuvable");
  return p;
}

// Vérifie (avec un cache d'une minute) que Claude Code est connecté à l'abonnement.
let loginCheck = { ok: false, at: 0 };
function aiReady() {
  if (Date.now() - loginCheck.at > 60_000) loginCheck = { ok: claudeLoggedIn(), at: Date.now() };
  return loginCheck.ok;
}

function requireAi() {
  if (!aiReady()) throw new HttpError(400, "Claude Code n'est pas connecté : lancez `claude` dans un terminal et connectez-vous avec votre abonnement");
}

// --- Configuration ---------------------------------------------------------

router.get("/config", (_req, res) => {
  res.json({
    aiConfigured: aiReady(),
    mailConfigured: mailConfigured(),
    figmaEnabled: config.figma.enabled,
    figmaProjectSet: Boolean(config.figma.projectId),
    model: config.model,
    sender: config.sender,
  });
});

// --- Recherches -------------------------------------------------------------

router.post("/searches", (req, res) => {
  requireAi();
  const activity = String(req.body.activity ?? "").trim();
  const city = String(req.body.city ?? "").trim() || "France";
  const target = Math.min(100, Math.max(1, Number(req.body.count) || 20));
  if (!activity) throw new HttpError(400, "Activité obligatoire");
  res.status(201).json({ id: startSearch(activity, city, target) });
});

router.get("/searches", (_req, res) => {
  res.json(listSearches(10).map((s) => ({ ...s, log: JSON.parse(s.log) })));
});

// --- Prospects --------------------------------------------------------------

router.get("/prospects", (_req, res) => {
  res.json(listProspects().map(serializeProspect));
});

router.patch("/prospects/:id", (req, res) => {
  prospectOr404(req);
  const { email, status, name } = req.body as Partial<ProspectRow>;
  const fields: Partial<ProspectRow> = {};
  if (typeof email === "string") fields.email = email.trim();
  if (typeof name === "string" && name.trim()) fields.name = name.trim();
  if (status) {
    if (!STATUSES.includes(status)) throw new HttpError(400, "Statut invalide");
    fields.status = status;
  }
  updateProspect(Number(req.params.id), fields);
  res.json(serializeProspect(getProspect(Number(req.params.id))!));
});

router.post("/prospects/:id/mockup", (req, res) => {
  requireAi();
  const p = prospectOr404(req);
  if (p.mockup_status === "pending" || p.mockup_status === "figma") throw new HttpError(409, "Maquette déjà en cours");
  void createMockup(p.id);
  res.status(202).json(serializeProspect(getProspect(p.id)!));
});

router.post("/prospects/:id/figma", (req, res) => {
  const p = prospectOr404(req);
  if (!p.mockup_file) throw new HttpError(400, "Générez d'abord la maquette");
  void sendToFigma(p.id);
  res.status(202).json(serializeProspect(getProspect(p.id)!));
});

router.post("/prospects/:id/email/draft", async (req, res) => {
  requireAi();
  await ensureEstimate(Number(req.params.id)).catch((err) => console.error("Estimation impossible :", err.message));
  const p = prospectOr404(req);
  const link = mockupLink(p.id);
  const draft = await draftEmail({
    name: p.name,
    url: p.url,
    activity: p.activity ?? "",
    city: p.city ?? "",
    summary: p.summary ?? "",
    issues: JSON.parse(p.issues),
    mockupLink: link ?? "[LIEN DE LA MAQUETTE]",
    sender: config.sender,
    estimate: p.estimate ? describeEstimate(JSON.parse(p.estimate) as Estimate) : null,
  });
  updateProspect(p.id, { email_subject: draft.subject, email_body: draft.body });
  res.json({ ...draft, mockupLink: link });
});

router.post("/prospects/:id/email/send", async (req, res) => {
  const p = prospectOr404(req);
  const to = String(req.body.to ?? "").trim();
  const subject = String(req.body.subject ?? "").trim();
  const body = String(req.body.body ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw new HttpError(400, "Adresse email invalide");
  if (!subject || !body) throw new HttpError(400, "Objet et message obligatoires");
  if (body.includes("[LIEN DE LA MAQUETTE]")) throw new HttpError(400, "Remplacez [LIEN DE LA MAQUETTE] par le vrai lien avant l'envoi");
  await sendMail(to, subject, body);
  updateProspect(p.id, { email: to, email_subject: subject, email_body: body, status: "mail_envoye", sent_at: new Date().toISOString() });
  res.json(serializeProspect(getProspect(p.id)!));
});

// --- Développement du site -------------------------------------------------

router.post("/prospects/:id/develop", (req, res) => {
  requireAi();
  const p = prospectOr404(req);
  if (p.dev_status === "running") throw new HttpError(409, "Développement déjà en cours");
  const figmaUrl = String(req.body.figmaUrl ?? p.figma_url ?? "").trim();
  const siteDomain = String(req.body.siteDomain ?? p.site_domain ?? p.domain).trim();
  if (!parseFigmaUrl(figmaUrl)) throw new HttpError(400, "Lien Figma invalide");
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(siteDomain.replace(/^https?:\/\//, "").replace(/\/.*$/, ""))) {
    throw new HttpError(400, "Nom de domaine invalide");
  }
  void startDevelopment(p.id, { figmaUrl, siteDomain, notes: String(req.body.notes ?? "") });
  res.status(202).json(serializeProspect(getProspect(p.id)!));
});

router.post("/prospects/:id/open-folder", (req, res) => {
  const p = prospectOr404(req);
  if (!p.dev_dir || !fs.existsSync(p.dev_dir)) throw new HttpError(404, "Dossier du site introuvable");
  spawn("open", [p.dev_dir], { detached: true, stdio: "ignore" }).unref();
  res.json({ ok: true });
});

// --- Aperçu des maquettes ----------------------------------------------------

router.get("/maquettes/:id", (req, res) => {
  const p = prospectOr404(req);
  if (!p.mockup_file) throw new HttpError(404, "Pas encore de maquette");
  res.sendFile(path.join(MOCKUP_DIR, p.mockup_file));
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message });
});

app.listen(config.port, "127.0.0.1", () => {
  console.log(`Prospection THP (local) sur http://127.0.0.1:${config.port}/api/prospect`);
  if (!aiReady()) console.warn("⚠ Claude Code n'est pas connecté : la prospection et l'IA sont désactivées.");
});
