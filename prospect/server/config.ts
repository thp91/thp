import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(here, "..");
export const DATA_DIR = path.join(ROOT, "data");
export const MOCKUP_DIR = path.join(DATA_DIR, "maquettes");
export const ASSET_DIR = path.join(DATA_DIR, "assets");
// Dossier où sont développés les sites des clients (hors du projet : ~/Documents/sites-clients par défaut).
export const SITES_DIR = path.resolve(process.env.SITES_DIR?.trim() || path.join(ROOT, "..", "..", "sites-clients"));
export const PROMPT_DIR = path.join(here, "prompts");

const env = (key: string, fallback = "") => (process.env[key] ?? fallback).trim();

export const config = {
  port: Number(env("PROSPECT_PORT", "3001")),
  // Vide = modèle par défaut de Claude Code
  model: env("CLAUDE_MODEL"),
  sender: {
    name: env("SENDER_NAME", "Théophile Mazaud"),
    company: env("SENDER_COMPANY", "THP Development"),
    website: env("SENDER_WEBSITE", "https://www.thp-development.fr"),
    phone: env("SENDER_PHONE"),
  },
  // Envoi des mails de prospection via Resend (même clé que le formulaire de contact du site)
  mail: {
    apiKey: env("RESEND_API_KEY"),
    // Adresse d'expédition sur un domaine vérifié dans Resend (ex. contact@thp-development.fr)
    from: env("PROSPECT_FROM") || env("CONTACT_FROM"),
    replyTo: env("PROSPECT_REPLY_TO") || env("CONTACT_TO", "thp.development.pro@gmail.com"),
  },
  figma: {
    enabled: env("FIGMA_ENABLED", "true") === "true",
    planKey: env("FIGMA_PLAN_KEY"),
    projectId: env("FIGMA_PROJECT_ID"),
  },
  publicBaseUrl: env("PUBLIC_BASE_URL").replace(/\/$/, ""),
};

export const mailConfigured = () => Boolean(config.mail.apiKey && config.mail.from);
