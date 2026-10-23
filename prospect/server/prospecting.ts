import { analyzeSite, findCandidates, type Candidate } from "./ai.ts";
import { FatalAiError } from "./claude.ts";
import { appendSearchLog, createSearch, insertProspect, knownDomains, updateSearch } from "./store.ts";
import { isBlocked, normalizeDomain, scrapeSite } from "./scraper.ts";

// Chaque analyse lance un processus Claude Code : on en garde peu en parallèle.
const CONCURRENCY = 3;

async function pool<T>(items: T[], worker: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) await worker(item);
    }),
  );
}

/**
 * Lance une recherche : Claude trouve des sites via la recherche web, puis chaque
 * site est scrappé (email, indices techniques) et analysé. On garde les sites
 * vitrines avec un email et un verdict "à refaire" / "à vérifier".
 */
export function startSearch(activity: string, city: string, target: number) {
  const searchId = createSearch(activity, city, target);
  runSearch(searchId, activity, city, target).catch((err) => {
    appendSearchLog(searchId, `Recherche arrêtée : ${err.message}`);
    updateSearch(searchId, { status: "error" });
  });
  return searchId;
}

async function runSearch(searchId: number, activity: string, city: string, target: number) {
  const log = (line: string) => appendSearchLog(searchId, line);
  const seen = new Set(knownDomains());
  let found = 0;
  let stopped: FatalAiError | undefined;
  const maxRounds = Math.ceil(target / 10) + 3;

  for (let round = 1; round <= maxRounds && found < target; round++) {
    const ask = Math.min(25, Math.max(10, (target - found) * 2));
    log(`Recherche web (tour ${round}) : ${ask} sites demandés à Claude…`);
    let candidates: Candidate[];
    try {
      candidates = await findCandidates({ activity, city, count: ask, exclude: [...seen] });
    } catch (err) {
      if (err instanceof FatalAiError) throw err;
      log(`Recherche web en échec : ${(err as Error).message}`);
      continue;
    }

    const fresh = candidates.filter((c) => {
      const domain = normalizeDomain(c.url);
      if (!domain || seen.has(domain) || isBlocked(domain)) return false;
      seen.add(domain);
      return true;
    });
    log(`${fresh.length} nouveaux sites à analyser.`);
    if (!fresh.length) continue;

    await pool(fresh, async (c) => {
      if (found >= target || stopped) return;
      try {
        const site = await scrapeSite(c.url);
        if (site.ecommerce) return log(`✗ ${site.domain} : site e-commerce, ignoré`);
        if (!site.emails.length) return log(`✗ ${site.domain} : aucun email trouvé`);
        if (site.domain !== normalizeDomain(c.url)) seen.add(site.domain);

        const analysis = await analyzeSite({ name: c.name, url: site.finalUrl, activity, signals: site.signals, text: site.text });
        if (analysis.verdict === "correct") return log(`✗ ${site.domain} : site déjà correct (${analysis.score}/100)`);
        if (found >= target) return;

        const inserted = insertProspect({
          search_id: searchId,
          name: analysis.company_name || c.name,
          url: site.finalUrl,
          domain: site.domain,
          city: c.city || city,
          activity,
          email: site.emails[0],
          emails: JSON.stringify(site.emails),
          score: analysis.score,
          verdict: analysis.verdict,
          summary: analysis.summary,
          issues: JSON.stringify(analysis.issues),
          signals: JSON.stringify(site.signals),
          page_text: site.text,
        });
        if (!inserted) return;
        found++;
        updateSearch(searchId, { found });
        log(`✓ ${analysis.company_name || c.name} (${site.domain}) — ${analysis.score}/100`);
      } catch (err) {
        if (err instanceof FatalAiError) {
          stopped ??= err;
          return;
        }
        log(`✗ ${normalizeDomain(c.url)} : inaccessible (${(err as Error).message})`);
      }
    });
    if (stopped) throw stopped;
  }

  log(found >= target ? `Terminé : ${found} prospects trouvés.` : `Terminé : ${found}/${target} prospects trouvés (plus de résultats exploitables).`);
  updateSearch(searchId, { status: "done" });
}
