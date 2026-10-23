import fs from "node:fs";
import path from "node:path";
import { PROMPT_DIR } from "./config.ts";
import { runClaude } from "./claude.ts";
import type { SiteSignals } from "./scraper.ts";
import { PRICING, type SiteScope } from "./pricing.ts";

export function loadPrompt(name: string, vars: Record<string, string>) {
  const raw = fs.readFileSync(path.join(PROMPT_DIR, name), "utf8");
  return raw.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

const str = { type: "string" } as const;

// ---------------------------------------------------------------------------
// 1. Prospection : trouver des sites vitrines via la recherche web
// ---------------------------------------------------------------------------

export interface Candidate {
  name: string;
  url: string;
  city: string;
}

export async function findCandidates(params: { activity: string; city: string; count: number; exclude: string[] }) {
  const nationwide = /^france$/i.test(params.city);
  const zone = nationwide
    ? "partout en France (varie les villes : grandes, moyennes et petites villes de toutes les régions)"
    : `à ${params.city} ou dans ses environs immédiats`;
  const { structured } = await runClaude<{ sites: Candidate[] }>({
    system:
      "Tu es l'assistant de prospection de THP Development, développeur web freelance en France. " +
      "Tu trouves des TPE/PME locales dont le site internet vitrine mériterait une refonte.",
    prompt: `Trouve ${params.count} entreprises « ${params.activity} » ${zone}, qui possèdent leur PROPRE site internet.

Critères :
- Uniquement des sites VITRINE (présentation, services, contact). Exclure les boutiques en ligne / e-commerce.
- Privilégier les sites qui ont l'air anciens ou amateurs (design daté, non responsive, contenu pauvre, vieux CMS, copyright ancien...).
- Renvoyer l'URL du site de l'entreprise elle-même (page d'accueil), jamais un annuaire, un réseau social, Pages Jaunes, Google Maps, une plateforme de réservation ou un site de franchise nationale.
- Utilise la recherche web et varie les requêtes (${nationwide ? "villes, régions" : "quartiers, villes voisines"}, spécialités, "site officiel"...) pour trouver assez de résultats. Inutile d'ouvrir chaque site : l'application les vérifie ensuite.
${params.exclude.length ? `- Ces domaines sont déjà connus, ne les renvoie PAS : ${params.exclude.slice(-300).join(", ")}` : ""}`,
    schema: {
      type: "object",
      properties: {
        sites: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom de l'entreprise" },
              url: { type: "string", description: "URL de la page d'accueil du site" },
              city: { type: "string" },
            },
            required: ["name", "url", "city"],
            additionalProperties: false,
          },
        },
      },
      required: ["sites"],
      additionalProperties: false,
    },
    tools: ["WebSearch"],
    allowedTools: ["WebSearch"],
    effort: "low",
    timeoutMs: 10 * 60_000,
  });
  return structured.sites;
}

// ---------------------------------------------------------------------------
// 2. Analyse d'un site : faut-il le refaire ?
// ---------------------------------------------------------------------------

export interface SiteAnalysis {
  company_name: string;
  score: number;
  verdict: "a_refaire" | "a_verifier" | "correct";
  summary: string;
  issues: string[];
}

export async function analyzeSite(input: { name: string; url: string; activity: string; signals: SiteSignals; text: string }) {
  const { structured } = await runClaude<SiteAnalysis>({
    system:
      "Tu es un expert UX/UI et développeur web. Tu évalues des sites vitrines de TPE françaises pour savoir " +
      "s'ils ont besoin d'une refonte. Sois factuel et concret, en français.",
    prompt: `Site : ${input.url}
Entreprise (supposée) : ${input.name} — activité : ${input.activity}

Indices techniques relevés automatiquement :
${JSON.stringify(input.signals, null, 2)}

Contenu texte de la page d'accueil :
${input.text}

Évalue si ce site mériterait une refonte (design daté, pas responsive, mauvaise lisibilité, contenu pauvre, pas d'appel à l'action, SEO faible, technologie obsolète...).
- score : 0 = site moderne et soigné, 100 = refonte urgente.
- verdict : "a_refaire" (score ≥ 60), "a_verifier" (35–59), "correct" (< 35).
- issues : 3 à 6 problèmes concrets, formulés pour un client non technique.
- company_name : le vrai nom commercial de l'entreprise tel qu'il apparaît sur le site.`,
    schema: {
      type: "object",
      properties: {
        company_name: str,
        score: { type: "integer" },
        verdict: { type: "string", enum: ["a_refaire", "a_verifier", "correct"] },
        summary: { type: "string", description: "Résumé en 1 à 2 phrases" },
        issues: { type: "array", items: str },
      },
      required: ["company_name", "score", "verdict", "summary", "issues"],
      additionalProperties: false,
    },
    effort: "low",
  });
  return structured;
}

// ---------------------------------------------------------------------------
// 3. Maquette d'intention (HTML autonome, prompt fixe dans prompts/maquette.md)
// ---------------------------------------------------------------------------

export async function generateMockupHtml(p: {
  name: string;
  url: string;
  activity: string;
  city: string;
  summary: string;
  issues: string[];
  content: string;
  contacts: string;
  assets: string;
}) {
  const { result } = await runClaude({
    prompt: loadPrompt("maquette.md", {
      name: p.name,
      url: p.url,
      activity: p.activity,
      city: p.city,
      analysis: `${p.summary}\n- ${p.issues.join("\n- ")}`,
      content: p.content,
      contacts: p.contacts,
      assets: p.assets,
      option_price: `+${PRICING.blog.toLocaleString("fr-FR")} €`,
      option_days: `+${PRICING.days.perDynamicBlock} jours`,
    }),
    // Skills ui-ux-pro-max (script Python) et frontend-design, + lecture des images du site.
    tools: ["Skill", "Read", "Bash"],
    allowedTools: ["Skill", "Read", "Bash(python3:*)"],
    effort: "high",
    timeoutMs: 20 * 60_000,
  });
  const html = result.match(/<!doctype html[\s\S]*<\/html>/i)?.[0];
  if (!html) throw new Error("Claude n'a pas renvoyé de document HTML");
  return html;
}

// ---------------------------------------------------------------------------
// 4. Rédaction du mail de prospection (prompts/mail.md)
// ---------------------------------------------------------------------------

export async function draftEmail(p: {
  name: string;
  url: string;
  activity: string;
  city: string;
  summary: string;
  issues: string[];
  mockupLink: string;
  sender: { name: string; company: string; website: string; phone: string };
  estimate: { price: string; delay: string; summary: string } | null;
}) {
  const { structured } = await runClaude<{ subject: string; body: string }>({
    system: "Tu rédiges des emails de prospection courts, chaleureux et professionnels, en français.",
    prompt: loadPrompt("mail.md", {
      name: p.name,
      url: p.url,
      activity: p.activity,
      city: p.city,
      analysis: `${p.summary}\n- ${p.issues.join("\n- ")}`,
      mockup_link: p.mockupLink,
      estimate: p.estimate
        ? `- Périmètre : ${p.estimate.summary}\n- Délai : ${p.estimate.delay} de travail\n- Budget : ${p.estimate.price}`
        : "Pas d'estimation disponible : ne parle ni de prix ni de délai.",
      sender_name: p.sender.name,
      sender_company: p.sender.company,
      sender_website: p.sender.website,
      sender_phone: p.sender.phone,
    }),
    schema: {
      type: "object",
      properties: { subject: str, body: { type: "string", description: "Corps du mail en texte brut" } },
      required: ["subject", "body"],
      additionalProperties: false,
    },
    effort: "medium",
  });
  return structured;
}

// ---------------------------------------------------------------------------
// 5. Périmètre du futur site, pour l'estimation de prix (voir pricing.ts)
// ---------------------------------------------------------------------------

export async function estimateScope(p: { name: string; activity: string; currentSite: string; mockupText: string }) {
  const { structured } = await runClaude<SiteScope>({
    system: "Tu es chef de projet web chez THP Development. Tu définis le périmètre d'un futur site vitrine, de façon réaliste et sobre.",
    prompt: `Entreprise : ${p.name} (${p.activity})

Contenu du site actuel :
${p.currentSite.slice(0, 8000)}

Texte de la maquette d'intention de la page d'accueil du futur site :
${p.mockupText.slice(0, 8000)}

Définis le périmètre du futur site :
- pages : les pages du futur site (ex. « Accueil », « Services », « Réalisations », « Contact »), en reprenant la structure du site actuel et les sections de la maquette qui méritent une page à part. Une seule page (« Accueil ») si le site actuel est un one page et que la maquette n'appelle pas d'autres pages. Ne compte pas les mentions légales, la politique de confidentialité ni la page 404.
- dynamic_existing : les blocs dynamiques DÉJÀ présents sur le site actuel et à conserver (ex. « blog », « actualités », « prise de rendez-vous en ligne »). Liste vide s'il n'y en a pas.
- dynamic_proposed : les blocs dynamiques NOUVEAUX proposés en option à côté de la maquette (typiquement « blog ») qui n'existent pas sur le site actuel.
Les avis clients et la FAQ sont inclus d'office dans le site : ce ne sont pas des blocs dynamiques.`,
    schema: {
      type: "object",
      properties: {
        pages: { type: "array", items: str },
        dynamic_existing: { type: "array", items: str },
        dynamic_proposed: { type: "array", items: str },
      },
      required: ["pages", "dynamic_existing", "dynamic_proposed"],
      additionalProperties: false,
    },
    effort: "low",
  });
  return structured;
}
