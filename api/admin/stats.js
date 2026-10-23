import { requireAdmin } from '../_lib/auth.js';
import { dayKey, key } from '../_lib/analytics.js';
import { pipeline, redisConfigured } from '../_lib/redis.js';
import { SOURCE_GROUPS } from '../_lib/sources.js';

const RANGES = [7, 30, 90];

/** HGETALL renvoie [champ, valeur, champ, valeur…] : on additionne dans `target`. */
const addHash = (target, flat) => {
  for (let i = 0; i < (flat?.length ?? 0); i += 2) target[flat[i]] = (target[flat[i]] || 0) + Number(flat[i + 1]);
};

const sorted = (record, map) =>
  Object.entries(record)
    .map(map)
    .sort((a, b) => b.count - a.count);

/** Statistiques de fréquentation sur 7, 30 ou 90 jours, avec la période précédente pour comparaison. */
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAdmin(req, res)) return;
  if (!redisConfigured()) return res.status(200).json({ configured: false });

  const range = RANGES.includes(Number(req.query?.days)) ? Number(req.query.days) : 30;
  const days = Array.from({ length: range }, (_, i) => dayKey(i - range + 1));
  const previousDays = Array.from({ length: range }, (_, i) => dayKey(i - range * 2 + 1));

  const perDay = days.flatMap((day) => [
    ['GET', key.pageviews(day)],
    ['PFCOUNT', key.visitors(day)],
    ['HGETALL', key.sources(day)],
    ['HGETALL', key.pages(day)],
    ['HGETALL', key.devices(day)],
  ]);
  const results = await pipeline([
    ...perDay,
    ['PFCOUNT', ...days.map(key.visitors)],
    ['PFCOUNT', ...previousDays.map(key.visitors)],
    ...previousDays.map((day) => ['GET', key.pageviews(day)]),
  ]);

  const series = [];
  const sources = {};
  const pages = {};
  const devices = {};
  days.forEach((day, i) => {
    const [pageviews, visitors, src, pg, dev] = results.slice(i * 5, i * 5 + 5);
    series.push({ date: day, pageviews: Number(pageviews) || 0, visitors: Number(visitors) || 0 });
    addHash(sources, src);
    addHash(pages, pg);
    addHash(devices, dev);
  });
  const rest = results.slice(days.length * 5);
  const [visitorsTotal, previousVisitors, ...previousPageviews] = rest;

  const sourceList = sorted(sources, ([field, count]) => {
    const [group, ...label] = field.split('|');
    return { group, label: label.join('|'), count };
  });
  const groups = Object.keys(SOURCE_GROUPS).map((group) => ({
    group,
    label: SOURCE_GROUPS[group],
    count: sourceList.filter((s) => s.group === group).reduce((sum, s) => sum + s.count, 0),
  }));

  return res.status(200).json({
    configured: true,
    range,
    series,
    totals: {
      visitors: Number(visitorsTotal) || 0,
      pageviews: series.reduce((sum, d) => sum + d.pageviews, 0),
      previousVisitors: Number(previousVisitors) || 0,
      previousPageviews: previousPageviews.reduce((sum, v) => sum + (Number(v) || 0), 0),
    },
    groups,
    sources: sourceList,
    pages: sorted(pages, ([path, count]) => ({ path, count })).slice(0, 8),
    devices: sorted(devices, ([label, count]) => ({ label, count })),
  });
}
