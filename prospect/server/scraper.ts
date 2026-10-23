import * as cheerio from "cheerio";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

/** Domaines qui ne sont jamais le site propre d'une entreprise. */
export const BLOCKED_DOMAINS = [
  "pagesjaunes.fr", "facebook.com", "instagram.com", "linkedin.com", "google.com", "google.fr",
  "yelp.fr", "yelp.com", "tripadvisor.fr", "tripadvisor.com", "societe.com", "pappers.fr",
  "infogreffe.fr", "mappy.com", "justacote.com", "houzz.fr", "habitatpresto.com", "starofservice.com",
  "planity.com", "doctolib.fr", "leboncoin.fr", "youtube.com", "wikipedia.org", "annuaire-mairie.fr",
  "118712.fr", "kompass.com", "manageo.fr", "verif.com", "cylex-france.fr", "hoodspot.fr", "travaux.com",
];

const ECOMMERCE_MARKERS = [
  /cdn\.shopify\.com|Shopify\.theme/i,
  /woocommerce/i,
  /prestashop/i,
  /magento/i,
  /wix-ecommerce|wixstores/i,
  /add[-_]to[-_]cart|ajouter au panier/i,
  /\/(cart|panier|checkout|commande)(\/|"|\?)/i,
];

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JUNK_EMAIL =
  /\.(png|jpe?g|gif|svg|webp|css|js)$|sentry|wixpress|example\.|domain\.|domaine\.|exemple\.|votre-?(e?mail|adresse)|@2x|u003e|noreply|no-reply|@(local|localhost|test|monsite|mon-site|votresite|votre-site|site|email|mail)\.(fr|com)$/i;

export function normalizeDomain(url: string) {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function isBlocked(domain: string) {
  return BLOCKED_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}

async function fetchPage(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("html")) throw new Error(`Pas une page HTML (${type})`);
  const html = (await res.text()).slice(0, 1_500_000);
  return { html, finalUrl: res.url };
}

function extractEmails(html: string, $: cheerio.CheerioAPI) {
  const found = new Set<string>();
  $('a[href^="mailto:"]').each((_, el) => {
    const addr = decodeURIComponent(($(el).attr("href") ?? "").replace(/^mailto:/i, "").split("?")[0]).trim();
    if (addr) found.add(addr.toLowerCase());
  });
  // Adresses en clair, y compris les formes obfusquées "contact [at] domaine.fr"
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&#0*64;|&commat;/gi, "@")
    .replace(/\s*[\[(]\s*(at|arobase)\s*[\])]\s*/gi, "@")
    .replace(/\s*[\[(]\s*(dot|point)\s*[\])]\s*/gi, ".");
  for (const m of text.matchAll(EMAIL_RE)) found.add(m[0].toLowerCase());
  return [...found].filter((e) => !JUNK_EMAIL.test(e) && e.length < 80);
}

function contactLinks($: cheerio.CheerioAPI, base: string) {
  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const label = `${href} ${$(el).text()}`.toLowerCase();
    if (/contact|mentions|legal|nous-joindre|a-propos|qui-sommes/.test(label)) {
      try {
        const u = new URL(href, base);
        if (u.hostname.replace(/^www\./, "") === new URL(base).hostname.replace(/^www\./, "")) links.add(u.href.split("#")[0]);
      } catch {}
    }
  });
  return [...links].slice(0, 4);
}

/** Indices techniques qui trahissent un site daté. */
function technicalSignals($: cheerio.CheerioAPI, html: string, finalUrl: string) {
  const years = [...html.matchAll(/(?:©|&copy;|copyright)\s*(?:\d{4}\s*[-–]\s*)?(\d{4})/gi)].map((m) => Number(m[1]));
  const jquery = html.match(/jquery[.-]?(\d+\.\d+(?:\.\d+)?)(?:\.min)?\.js/i)?.[1];
  const imgs = $("img");
  return {
    https: finalUrl.startsWith("https://"),
    viewport: $('meta[name="viewport"]').length > 0,
    generator: $('meta[name="generator"]').attr("content") ?? null,
    copyrightYear: years.length ? Math.max(...years) : null,
    jquery: jquery ?? null,
    layoutTables: $("table table, table[width], td[bgcolor]").length,
    fontTags: $("font, center, marquee").length,
    flash: /\.swf|shockwave/i.test(html),
    images: imgs.length,
    imagesWithoutAlt: imgs.filter((_, el) => !$(el).attr("alt")).length,
    title: $("title").first().text().trim().slice(0, 150),
    metaDescription: $('meta[name="description"]').attr("content")?.slice(0, 200) ?? null,
    htmlKb: Math.round(html.length / 1024),
  };
}

export type SiteSignals = ReturnType<typeof technicalSignals>;

export interface ScrapeResult {
  finalUrl: string;
  domain: string;
  emails: string[];
  ecommerce: boolean;
  signals: SiteSignals;
  text: string;
}

function pageText($: cheerio.CheerioAPI) {
  $("script, style, noscript, svg").remove();
  const headings = $("h1, h2, h3").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 25);
  const nav = $("nav a, header a").map((_, el) => $(el).text().trim()).get().filter(Boolean).slice(0, 20);
  const body = $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
  return `MENU : ${nav.join(" | ")}\nTITRES : ${headings.join(" | ")}\nCONTENU : ${body}`;
}

/** Récupère la page d'accueil + pages contact/mentions légales pour trouver un email. */
export async function scrapeSite(url: string): Promise<ScrapeResult> {
  const home = await fetchPage(url.startsWith("http") ? url : `https://${url}`);
  const $ = cheerio.load(home.html);
  const ecommerce = ECOMMERCE_MARKERS.filter((re) => re.test(home.html)).length >= 2;
  const signals = technicalSignals($, home.html, home.finalUrl);
  const domain = normalizeDomain(home.finalUrl);
  let emails = extractEmails(home.html, $);

  if (!emails.length) {
    const candidates = new Set(contactLinks($, home.finalUrl));
    for (const p of ["/contact", "/mentions-legales"]) candidates.add(new URL(p, home.finalUrl).href);
    for (const link of [...candidates].slice(0, 5)) {
      try {
        const page = await fetchPage(link);
        emails = extractEmails(page.html, cheerio.load(page.html));
        if (emails.length) break;
      } catch {}
    }
  }

  // Les adresses du domaine du site passent en premier.
  emails.sort((a, b) => Number(b.endsWith(domain)) - Number(a.endsWith(domain)));
  return { finalUrl: home.finalUrl, domain, emails, ecommerce, signals, text: pageText($) };
}
