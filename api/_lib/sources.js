/**
 * Classe la provenance d'une visite : IA, moteur de recherche, réseau social, direct ou autre site.
 * Priorité au paramètre utm_source (ChatGPT ajoute par exemple utm_source=chatgpt.com),
 * puis au référent (document.referrer).
 */
const RULES = [
  // Assistants IA
  { group: 'ia', label: 'ChatGPT', match: /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com)$|^chatgpt/ },
  { group: 'ia', label: 'Perplexity', match: /(^|\.)perplexity\.ai$|^perplexity/ },
  { group: 'ia', label: 'Claude', match: /(^|\.)claude\.ai$|^claude/ },
  { group: 'ia', label: 'Gemini', match: /(^|\.)(gemini|bard)\.google\.com$|^gemini/ },
  { group: 'ia', label: 'Copilot', match: /(^|\.)copilot\.microsoft\.com$|^copilot/ },
  { group: 'ia', label: 'Mistral', match: /(^|\.)chat\.mistral\.ai$|^mistral/ },
  { group: 'ia', label: 'DeepSeek', match: /(^|\.)deepseek\.com$|^deepseek/ },
  // Moteurs de recherche
  { group: 'search', label: 'Google', match: /(^|\.)google\.[a-z.]+$|^google/ },
  { group: 'search', label: 'Bing', match: /(^|\.)bing\.com$|^bing/ },
  { group: 'search', label: 'DuckDuckGo', match: /(^|\.)duckduckgo\.com$|^duckduckgo/ },
  { group: 'search', label: 'Qwant', match: /(^|\.)qwant\.com$|^qwant/ },
  { group: 'search', label: 'Ecosia', match: /(^|\.)ecosia\.org$|^ecosia/ },
  { group: 'search', label: 'Yahoo', match: /(^|\.)yahoo\.[a-z.]+$|^yahoo/ },
  // Réseaux sociaux
  { group: 'social', label: 'Instagram', match: /(^|\.)instagram\.com$|^(ig|instagram)$/ },
  { group: 'social', label: 'Facebook', match: /(^|\.)(facebook\.com|fb\.com|fb\.me)$|^(fb|facebook)$/ },
  { group: 'social', label: 'LinkedIn', match: /(^|\.)(linkedin\.com|lnkd\.in)$|^linkedin/ },
  { group: 'social', label: 'X (Twitter)', match: /(^|\.)(x\.com|twitter\.com|t\.co)$|^(x|twitter)$/ },
  { group: 'social', label: 'TikTok', match: /(^|\.)tiktok\.com$|^tiktok/ },
  { group: 'social', label: 'Pinterest', match: /(^|\.)pinterest\.[a-z.]+$|^pinterest/ },
  { group: 'social', label: 'YouTube', match: /(^|\.)(youtube\.com|youtu\.be)$|^youtube/ },
  { group: 'social', label: 'WhatsApp', match: /(^|\.)whatsapp\.com$|^whatsapp/ },
];

export const SOURCE_GROUPS = {
  ia: 'Assistants IA',
  search: 'Moteurs de recherche',
  social: 'Réseaux sociaux',
  direct: 'Accès direct',
  other: 'Autres sites',
};

const hostOf = (value) => {
  try {
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
};

/** Renvoie { group, label } ou null si la visite vient du site lui-même (navigation interne). */
export function classifySource({ referrer, utmSource, ownHost }) {
  const utm = String(utmSource || '').trim().toLowerCase();
  if (utm) {
    const rule = RULES.find((r) => r.match.test(utm));
    if (rule) return { group: rule.group, label: rule.label };
  }

  const host = hostOf(referrer);
  if (!host) return utm ? { group: 'other', label: utm.slice(0, 40) } : { group: 'direct', label: 'Direct' };
  if (ownHost && host === ownHost.replace(/^www\./, '')) return null;

  const rule = RULES.find((r) => r.match.test(host));
  return rule ? { group: rule.group, label: rule.label } : { group: 'other', label: host.slice(0, 60) };
}

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pagespeed|monitor|curl|wget|python|axios|node-fetch|vercel-screenshot/i;
export const isBot = (userAgent) => !userAgent || BOT.test(userAgent);

export const deviceOf = (userAgent) =>
  /ipad|tablet/i.test(userAgent) ? 'Tablette' : /mobi|iphone|android/i.test(userAgent) ? 'Mobile' : 'Ordinateur';
