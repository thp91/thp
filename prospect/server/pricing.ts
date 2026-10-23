/**
 * Grille tarifaire de THP Development, utilisée pour l'estimation envoyée dans le
 * premier mail. Claude ne fait que décrire le futur site (pages, blocs dynamiques) :
 * les prix et délais sont calculés ici.
 */
export const PRICING = {
  onePage: 1000,
  upTo5Pages: 1500,
  perExtraPage: 200, // au-delà de 5 pages
  blog: 400, // blog / conseils avec pages articles
  perDynamicBlock: 300, // autres blocs dynamiques (actualités gérées, prise de rendez-vous...)
  days: {
    onePage: 5,
    upTo5Pages: 10,
    perExtraPage: 2,
    perDynamicBlock: 2,
  },
};

export interface SiteScope {
  /** Pages du futur site (hors mentions légales / confidentialité). */
  pages: string[];
  /** Blocs dynamiques déjà présents sur le site actuel (conservés). */
  dynamic_existing: string[];
  /** Blocs dynamiques proposés dans la maquette pour le référencement (options). */
  dynamic_proposed: string[];
}

export interface Estimate extends SiteScope {
  priceLow: number;
  priceHigh: number;
  daysLow: number;
  daysHigh: number;
}

const isBlog = (block: string) => /blog|conseil|article/i.test(block);
const blocksPrice = (blocks: string[]) => blocks.reduce((sum, b) => sum + (isBlog(b) ? PRICING.blog : PRICING.perDynamicBlock), 0);

export function computeEstimate(scope: SiteScope): Estimate {
  const n = Math.max(1, scope.pages.length);
  const base = n === 1 ? PRICING.onePage : PRICING.upTo5Pages + Math.max(0, n - 5) * PRICING.perExtraPage;
  const baseDays = n === 1 ? PRICING.days.onePage : PRICING.days.upTo5Pages + Math.max(0, n - 5) * PRICING.days.perExtraPage;
  const priceLow = base + blocksPrice(scope.dynamic_existing);
  const daysLow = baseDays + scope.dynamic_existing.length * PRICING.days.perDynamicBlock;
  return {
    ...scope,
    priceLow,
    priceHigh: priceLow + blocksPrice(scope.dynamic_proposed),
    daysLow,
    daysHigh: daysLow + scope.dynamic_proposed.length * PRICING.days.perDynamicBlock,
  };
}

const euros = (n: number) => `${n.toLocaleString("fr-FR")} €`;

/** Jours ouvrés → semaines arrondies à la demi-semaine (12 jours → 2,5). */
const toWeeks = (days: number) => Math.max(0.5, Math.round(days / 2.5) / 2);
const fmt = (w: number) => w.toLocaleString("fr-FR");

/** "environ 2 semaines", "1 semaine", "2 à 2,5 semaines". */
function weeks(low: number, high: number) {
  const a = toWeeks(low);
  const b = toWeeks(high);
  if (a === b) return `environ ${fmt(a)} ${a <= 1 ? "semaine" : "semaines"}`;
  return `${fmt(a)} à ${fmt(b)} semaines`;
}

/** Phrases prêtes à l'emploi pour le mail et l'interface. */
export function describeEstimate(e: Estimate) {
  const price = e.priceLow === e.priceHigh ? `environ ${euros(e.priceLow)}` : `entre ${euros(e.priceLow)} et ${euros(e.priceHigh)}`;
  const delay = weeks(e.daysLow, e.daysHigh);
  const kind = e.pages.length === 1 ? "un site une page" : `un site de ${e.pages.length} pages (${e.pages.join(", ")})`;
  const options = e.dynamic_proposed.length ? ` Le haut de la fourchette inclut les options proposées dans la maquette : ${e.dynamic_proposed.join(", ")}.` : "";
  return { price, delay, summary: `${kind}${e.dynamic_existing.length ? `, avec ${e.dynamic_existing.join(", ")}` : ""}.${options}` };
}
