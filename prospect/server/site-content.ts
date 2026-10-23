import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

/**
 * Contenu réel du site actuel, pour que la maquette parle vraiment de l'entreprise :
 * textes de plusieurs pages, coordonnées, logo et photos (téléchargés en local).
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";

const USEFUL_PAGE = /servic|prestation|activit|savoir|m[ée]tier|r[ée]alisation|qui-sommes|qui sommes|a-propos|à propos|presentation|présentation|entreprise|tarif|contact|equipe|équipe|histoire|horaire/i;
const NOT_A_PHOTO = /logo|icon|picto|sprite|avatar|flag|drapeau|pixel|spinner|loader|placeholder|badge|facebook|instagram|linkedin|google|tripadvisor|captcha|arrow|fleche/i;
const MAX_PHOTOS = 6;

export interface SiteAsset {
  file: string;
  kind: "logo" | "photo";
  alt: string;
}

export interface SiteContent {
  pages: { url: string; title: string; text: string }[];
  phones: string[];
  addresses: string[];
  assets: SiteAsset[];
}

async function get(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9" },
    redirect: "follow",
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function readable($: cheerio.CheerioAPI) {
  const $c = cheerio.load($.html());
  $c("script, style, noscript, svg, iframe").remove();
  const headings = $c("h1, h2, h3").map((_, el) => $c(el).text().trim()).get().filter(Boolean).slice(0, 30);
  const body = $c("main").text() || $c("body").text();
  return `Titres : ${headings.join(" | ")}\n${body.replace(/\s+/g, " ").trim().slice(0, 3500)}`;
}

function imageUrl($: cheerio.CheerioAPI, el: any, base: string) {
  const $el = $(el);
  // Le plus grand candidat du srcset, sinon les attributs de lazy-loading.
  const srcset = $el.attr("srcset") || $el.attr("data-srcset");
  const fromSet = srcset
    ?.split(",")
    .map((s) => s.trim().split(/\s+/))
    .sort((a, b) => parseInt(b[1] ?? "0") - parseInt(a[1] ?? "0"))[0]?.[0];
  const src = fromSet || $el.attr("data-src") || $el.attr("data-lazy-src") || $el.attr("src");
  if (!src || src.startsWith("data:")) return null;
  try {
    return new URL(src, base).href;
  } catch {
    return null;
  }
}

function findLogo($: cheerio.CheerioAPI, base: string) {
  const imgs = $("img").toArray();
  const score = (el: any) => {
    const $el = $(el);
    const hay = `${$el.attr("src")} ${$el.attr("alt")} ${$el.attr("class")} ${$el.attr("id")} ${$el.parent().attr("class")}`;
    return (/logo/i.test(hay) ? 2 : 0) + ($el.closest("header, .header, #header, nav").length ? 1 : 0);
  };
  const best = imgs.map((el) => ({ el, s: score(el) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s)[0];
  return best ? imageUrl($, best.el, base) : null;
}

async function download(url: string, dir: string, name: string, minBytes: number) {
  const res = await get(url);
  const type = res.headers.get("content-type") ?? "";
  const ext = type.includes("svg") ? "svg" : type.includes("png") ? "png" : type.includes("webp") ? "webp" : type.includes("jpeg") || type.includes("jpg") ? "jpg" : null;
  if (!ext) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < minBytes || buf.length > 4_000_000) return null;
  const file = `${name}.${ext}`;
  fs.writeFileSync(path.join(dir, file), buf);
  return file;
}

export async function collectSiteContent(url: string, assetDir: string): Promise<SiteContent> {
  fs.rmSync(assetDir, { recursive: true, force: true });
  fs.mkdirSync(assetDir, { recursive: true });

  const home = await get(url);
  const homeUrl = home.url;
  const $home = cheerio.load(await home.text());
  const host = new URL(homeUrl).hostname.replace(/^www\./, "");

  // Pages internes utiles (services, à propos, contact...)
  const links = new Map<string, string>();
  $home("a[href]").each((_, el) => {
    try {
      const u = new URL($home(el).attr("href")!, homeUrl);
      u.hash = "";
      const label = `${u.pathname} ${$home(el).text()}`;
      if (u.hostname.replace(/^www\./, "") === host && u.href !== homeUrl && !/\.(pdf|jpe?g|png|zip)$/i.test(u.pathname) && USEFUL_PAGE.test(label)) {
        links.set(u.href, $home(el).text().trim());
      }
    } catch {}
  });

  const pages = [{ url: homeUrl, title: "Accueil", $: $home }];
  for (const [link, title] of [...links].slice(0, 5)) {
    try {
      pages.push({ url: link, title: title || link, $: cheerio.load(await (await get(link)).text()) });
    } catch {}
  }

  const allText = pages.map((p) => p.$("body").text()).join(" ").replace(/\s+/g, " ");
  const phones = new Set<string>();
  for (const p of pages) p.$('a[href^="tel:"]').each((_, el) => void phones.add(p.$(el).attr("href")!.slice(4).trim()));
  for (const m of allText.matchAll(/(?:\+33\s?|\b0)[1-9](?:[\s.-]?\d{2}){4}\b/g)) phones.add(m[0]);
  const addresses = new Set(
    [...allText.matchAll(/\d{1,4}(?:\s?bis)?[,\s]+(?:rue|avenue|av\.|boulevard|bd|chemin|route|place|impasse|all[ée]e|quai|zone|za|zi|lieu-dit)\b[^|]{3,70}?\b\d{5}\s+[A-ZÉÈ][\wÀ-ÿ' -]{1,40}/gi)].map((m) => m[0].trim()),
  );

  // Logo + photos réelles
  const assets: SiteAsset[] = [];
  const logoUrl = findLogo($home, homeUrl);
  if (logoUrl) {
    const file = await download(logoUrl, assetDir, "logo", 500).catch(() => null);
    if (file) assets.push({ file, kind: "logo", alt: "Logo actuel" });
  }
  const seen = new Set([logoUrl]);
  for (const p of pages) {
    for (const el of p.$("img").toArray()) {
      if (assets.filter((a) => a.kind === "photo").length >= MAX_PHOTOS) break;
      const src = imageUrl(p.$, el, p.url);
      const hay = `${src} ${p.$(el).attr("class")} ${p.$(el).attr("alt")}`;
      if (!src || seen.has(src) || NOT_A_PHOTO.test(hay) || /\.(svg|gif)(\?|$)/i.test(src)) continue;
      seen.add(src);
      const n = assets.filter((a) => a.kind === "photo").length + 1;
      const file = await download(src, assetDir, `photo-${n}`, 25_000).catch(() => null);
      if (file) assets.push({ file, kind: "photo", alt: p.$(el).attr("alt")?.trim() || "" });
    }
  }

  return {
    pages: pages.map((p) => ({ url: p.url, title: p.title, text: readable(p.$) })),
    phones: [...phones].slice(0, 3),
    addresses: [...addresses].slice(0, 3),
    assets,
  };
}

const MIME: Record<string, string> = { svg: "image/svg+xml", png: "image/png", webp: "image/webp", jpg: "image/jpeg" };

/** Remplace les `asset:fichier` de la maquette par les images encodées (Figma n'ouvre pas les URLs externes). */
export function inlineAssets(html: string, assetDir: string) {
  return html.replace(/asset:([\w.-]+)/g, (match, file: string) => {
    const full = path.join(assetDir, file);
    if (!fs.existsSync(full)) return match;
    const mime = MIME[file.split(".").pop()!] ?? "application/octet-stream";
    return `data:${mime};base64,${fs.readFileSync(full).toString("base64")}`;
  });
}
