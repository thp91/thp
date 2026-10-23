import { config } from "./config.ts";
import { runClaude } from "./claude.ts";

/**
 * Importe la maquette HTML dans Figma, dans le dossier "prospects".
 * Chaque prospect a un seul fichier : la V1 le crée, les versions suivantes
 * (V2, V3...) sont posées à droite des précédentes sur la même page. Une version
 * peut contenir plusieurs cadres (page d'accueil + options), posés côte à côte.
 *
 * L'API REST de Figma ne permet pas de créer des designs : on passe donc par
 * Claude Code et le serveur MCP officiel de Figma. Prérequis (une seule fois) :
 *   claude mcp add --scope user --transport http figma https://mcp.figma.com/mcp
 *   puis `claude` → /mcp → figma → Authenticate
 */
export async function exportToFigma(params: {
  fileName: string;
  /** Noms des cadres, dans l'ordre du HTML (ex. "V3 — Accueil", "V3 — Option : Blog"). */
  frameNames: string[];
  /** Sélecteur des cadres dans le HTML ; absent pour une maquette d'un seul cadre. */
  cssSelector: string | null;
  htmlPath: string;
  fileKey: string | null;
}): Promise<{ fileKey: string; url: string }> {
  if (!config.figma.planKey) throw new Error("FIGMA_PLAN_KEY manquant dans .env");

  // Les cadres importés sont ceux sans préfixe "Vn —" (selon les cas, html_to_figma
  // les pose sur la page existante ou sur une nouvelle page). On les range sur la
  // première page, à droite des versions précédentes, puis on supprime la page vide.
  const placeFrames = `const names = ${JSON.stringify(params.frameNames)};
const target = figma.root.children[0];
const fresh = [];
for (const p of figma.root.children) {
  await p.loadAsync();
  for (const n of p.children) if (n.type === "FRAME" && !/^V\\d+ —/.test(n.name)) fresh.push({ n, p });
}
if (!fresh.length) throw new Error("Cadres importés introuvables");
// Ordre du HTML : de haut en bas, puis de gauche à droite.
fresh.sort((a, b) => a.n.y - b.n.y || a.n.x - b.n.x);
const others = target.children.filter((n) => !fresh.some((f) => f.n === n));
let x = others.reduce((max, n) => Math.max(max, n.x + n.width), -200) + 200;
fresh.forEach(({ n, p }, i) => {
  if (p !== target) target.appendChild(n);
  n.x = x;
  n.y = 0;
  n.name = names[i] ?? names[0] + " (" + (i + 1) + ")";
  x += n.width + 120;
});
await figma.setCurrentPageAsync(target);
for (const p of new Set(fresh.map((f) => f.p))) if (p !== target && p.children.length === 0) p.remove();
return { nodeId: fresh[0].n.id };`;

  const createStep = params.fileKey
    ? `1. Le fichier Figma existe déjà : fileKey="${params.fileKey}". Ne crée pas de nouveau fichier.`
    : `1. Appelle l'outil figma create_new_file avec fileName=${JSON.stringify(params.fileName)}, planKey="${config.figma.planKey}", editorType="design"${config.figma.projectId ? `, projectId="${config.figma.projectId}"` : ""}.`;

  const { structured } = await runClaude<{ fileKey: string; nodeId: string }>({
    prompt: `Tu importes une maquette HTML dans Figma. Suis exactement ces étapes, sans rien faire d'autre :
${createStep}
2. Appelle l'outil figma html_to_figma avec ce fileKey (sans nodeId)${params.cssSelector ? ` et cssSelector="${params.cssSelector}"` : ""}. Il renvoie une URL d'envoi à usage unique.
3. Envoie le fichier HTML à cette URL avec Bash :
   curl -sS -X POST -H 'Content-Type: text/html' --data-binary @'${params.htmlPath}' '<URL>'
4. Appelle l'outil figma use_figma sur ce fileKey avec exactement ce code (description : "Place la nouvelle version à côté des précédentes") :
\`\`\`js
${placeFrames}
\`\`\`
5. Renvoie le fileKey et le nodeId renvoyé par l'étape 4.`,
    schema: {
      type: "object",
      properties: { fileKey: { type: "string" }, nodeId: { type: "string" } },
      required: ["fileKey", "nodeId"],
      additionalProperties: false,
    },
    tools: ["Bash"],
    allowedTools: ["mcp__figma__create_new_file", "mcp__figma__html_to_figma", "mcp__figma__use_figma", "Bash(curl:*)"],
    useMcp: true,
    effort: "low",
  });

  const { fileKey, nodeId } = structured;
  if (!/^[0-9a-zA-Z]{10,128}$/.test(fileKey)) throw new Error(`fileKey Figma invalide : ${fileKey}`);
  return { fileKey, url: `https://www.figma.com/design/${fileKey}?node-id=${nodeId.replace(":", "-")}` };
}
