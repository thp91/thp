import fs from "node:fs";
import path from "node:path";
import { estimateScope, generateMockupHtml } from "./ai.ts";
import { computeEstimate } from "./pricing.ts";
import { ASSET_DIR, config, MOCKUP_DIR } from "./config.ts";
import { getProspect, updateProspect } from "./store.ts";
import { exportToFigma } from "./figma.ts";
import { collectSiteContent, inlineAssets } from "./site-content.ts";

/** Cadres déclarés dans la maquette (`<div class="frame" data-frame="…" data-option="…">`). */
function mockupFrames(html: string) {
  const tags = [...html.matchAll(/<div\b[^>]*\bclass="[^"]*\bframe\b[^"]*"[^>]*>/gi)].map((m) => m[0]);
  const attr = (tag: string, name: string) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1]?.trim();
  return tags
    .filter((tag) => attr(tag, "data-frame"))
    .map((tag) => ({ name: attr(tag, "data-frame")!, option: attr(tag, "data-option") ?? null }));
}

/** Génère la maquette HTML avec Claude, puis l'importe dans Figma. Tourne en tâche de fond. */
export async function createMockup(id: number) {
  const p = getProspect(id);
  if (!p) throw new Error("Prospect introuvable");
  updateProspect(id, { mockup_status: "pending", mockup_error: null, figma_error: null });

  try {
    const assetDir = path.join(ASSET_DIR, String(id));
    const site = await collectSiteContent(p.url, assetDir).catch(() => null);
    const html = await generateMockupHtml({
      name: p.name,
      url: p.url,
      activity: p.activity ?? "",
      city: p.city ?? "",
      summary: p.summary ?? "",
      issues: JSON.parse(p.issues),
      content: site
        ? site.pages.map((pg) => `### ${pg.title} (${pg.url})\n${pg.text}`).join("\n\n")
        : p.page_text ?? "",
      contacts: site
        ? [`- Téléphone : ${site.phones.join(" / ") || "non trouvé"}`, `- Adresse : ${site.addresses.join(" / ") || "non trouvée"}`, `- Email : ${p.email ?? "non trouvé"}`].join("\n")
        : `- Email : ${p.email ?? "non trouvé"}`,
      assets: site?.assets.length
        ? site.assets
            .map((a) => `- asset:${a.file} — ${a.kind === "logo" ? "logo actuel" : `photo${a.alt ? ` (« ${a.alt} »)` : ""}`} — fichier : ${path.join(assetDir, a.file)}`)
            .join("\n")
        : "Aucune image récupérée : utilise un logotype typographique et des blocs graphiques.",
    });
    const version = p.mockup_version + 1;
    const file = `${id}-v${version}-${p.domain.replace(/[^a-z0-9.-]/gi, "_")}.html`;
    fs.writeFileSync(path.join(MOCKUP_DIR, file), inlineAssets(html, assetDir));
    updateProspect(id, {
      mockup_file: file,
      mockup_version: version,
      // Nouveau lien et nouvelle estimation : l'ancien brouillon de mail n'est plus valable.
      email_subject: null,
      email_body: null,
      mockup_status: config.figma.enabled ? "figma" : "done",
      status: p.status === "nouveau" ? "maquette" : p.status,
    });
  } catch (err) {
    updateProspect(id, { mockup_status: "error", mockup_error: (err as Error).message });
    return;
  }

  // L'estimation (prix / délai du mail) se calcule pendant l'import Figma.
  const estimate = ensureEstimate(id, true).catch((err) => console.error("Estimation impossible :", err.message));
  if (config.figma.enabled) await sendToFigma(id);
  await estimate;
}

/** Calcule (ou recalcule) l'estimation de prix et de délai à partir de la maquette. */
export async function ensureEstimate(id: number, force = false) {
  const p = getProspect(id);
  if (!p?.mockup_file || (p.estimate && !force)) return;
  const mockupText = fs
    .readFileSync(path.join(MOCKUP_DIR, p.mockup_file), "utf8")
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/data:[^"')\s]+/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  const scope = await estimateScope({ name: p.name, activity: p.activity ?? "", currentSite: p.page_text ?? "", mockupText });
  // Les options sont celles présentées à côté de la page d'accueil dans la maquette.
  const frames = mockupFrames(fs.readFileSync(path.join(MOCKUP_DIR, p.mockup_file), "utf8"));
  if (frames.length) scope.dynamic_proposed = frames.flatMap((f) => (f.option ? [f.option] : []));
  updateProspect(id, { estimate: JSON.stringify(computeEstimate(scope)) });
}

export async function sendToFigma(id: number) {
  const p = getProspect(id);
  if (!p?.mockup_file) throw new Error("Aucune maquette HTML à importer");
  updateProspect(id, { mockup_status: "figma", figma_error: null });
  try {
    const frames = mockupFrames(fs.readFileSync(path.join(MOCKUP_DIR, p.mockup_file), "utf8"));
    const { fileKey, url } = await exportToFigma({
      fileName: `${p.name} — maquette d'intention`,
      frameNames: frames.length ? frames.map((f) => `V${p.mockup_version} — ${f.name}`) : [`V${p.mockup_version} — ${p.name}`],
      cssSelector: frames.length ? ".frame" : null,
      htmlPath: path.join(MOCKUP_DIR, p.mockup_file),
      fileKey: p.figma_file_key,
    });
    updateProspect(id, { figma_url: url, figma_file_key: fileKey, mockup_status: "done" });
  } catch (err) {
    updateProspect(id, { figma_error: (err as Error).message, mockup_status: "done" });
  }
}

/** Lien envoyé au prospect : Figma en priorité, sinon l'aperçu HTML s'il est public. */
export function mockupLink(id: number) {
  const p = getProspect(id);
  if (p?.figma_url) return p.figma_url;
  if (p?.mockup_file && config.publicBaseUrl) return `${config.publicBaseUrl}/maquettes/${id}`;
  return null;
}
