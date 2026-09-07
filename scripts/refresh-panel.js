// Weekly panel refresh (ring CC-10, run from the Monday ops session).
//
// The panel is capped at 1,000 domains and was filled once, on 2026-08-25, by
// walking a Tranco list in rank order and taking every domain that survived the
// exclusion filters in expand-panel.js. Rankings move, so a panel frozen at that
// day's list slowly stops being "the top sites" — sites rise into the band we
// cover and we never notice them.
//
// This re-runs the founding algorithm against today's list and reports the
// difference. Two rules make it safe to run unattended:
//
//   * Additions only. A domain that has fallen out of the band is REPORTED as a
//     departure and KEPT, because its history is an append-only fact and its
//     site page is a live URL. The panel therefore grows; it never churns.
//   * Bounded. At most MAX_ADDS per run, best-ranked first, so a bad list day
//     cannot quietly reshape the panel. The remainder is reported and waits.
//
// Nothing here crawls. New domains carry no snapshot data until the 06:17 UTC
// cron picks them up on its next pass, and computeDiffs records each as an
// "added" changelog entry on that day.
//
//   node scripts/refresh-panel.js --dry-run   report only, writes nothing
//   node scripts/refresh-panel.js             apply, and append to the ledger
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { excluded, fetchTranco } from "./expand-panel.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_PANEL_SIZE = 1000; // the founding fill target, unchanged
const MAX_ADDS = 25;

// Re-run the founding fill against `ranked` (a rank-ordered domain list):
// seed with the hand-curated categories, then take eligible newcomers in rank
// order until the panel would be full. Returns the domains that fill it today.
export function reconstructFill(panel, ranked, target = TARGET_PANEL_SIZE) {
  const set = new Set(Object.entries(panel).filter(([, c]) => c !== "top1k").map(([d]) => d));
  const chosen = [];
  for (let i = 0; i < ranked.length && set.size < target; i++) {
    const domain = String(ranked[i] || "").trim().toLowerCase();
    if (!domain || set.has(domain) || excluded(domain)) continue;
    set.add(domain);
    chosen.push({ domain, rank: i + 1 });
  }
  return chosen;
}

export function panelDelta(panel, ranked, target = TARGET_PANEL_SIZE) {
  const chosen = reconstructFill(panel, ranked, target);
  const chosenSet = new Set(chosen.map((c) => c.domain));
  const rankOf = new Map(ranked.map((d, i) => [String(d).trim().toLowerCase(), i + 1]));
  return {
    newcomers: chosen.filter((c) => !(c.domain in panel)),
    departures: Object.keys(panel)
      .filter((d) => panel[d] === "top1k" && !chosenSet.has(d))
      .map((d) => ({ domain: d, rank: rankOf.get(d) ?? null }))
      .sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity)),
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const file = path.join(ROOT, "data/domains.json");
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  const before = Object.keys(data.domains).length;

  const list = await fetchTranco();
  const { newcomers, departures } = panelDelta(data.domains, list.domains);
  const adding = newcomers.slice(0, MAX_ADDS);
  const deferred = newcomers.slice(MAX_ADDS);

  console.log(`Source: ${list.source} (${list.domains.length} rows)`);
  console.log(`Panel ${before} domains. Risen into the band: ${newcomers.length}. Fallen out (kept): ${departures.length}.`);
  for (const c of adding) console.log(`  + ${c.domain} (rank ${c.rank})`);
  if (deferred.length) console.log(`  ${deferred.length} over the ${MAX_ADDS}/run cap, deferred to next refresh.`);
  for (const d of departures) console.log(`  ~ ${d.domain} (now rank ${d.rank ?? "outside the fetched list"}) — kept`);

  if (dryRun) { console.log("--dry-run: nothing written."); return; }

  for (const c of adding) data.domains[c.domain] = "top1k";
  fs.writeFileSync(file, JSON.stringify(data, null, 1));

  const ledgerFile = path.join(ROOT, "data/panel-history.json");
  const ledger = fs.existsSync(ledgerFile) ? JSON.parse(fs.readFileSync(ledgerFile, "utf8")) : [];
  ledger.push({
    date: new Date().toISOString().slice(0, 10),
    source: list.source,
    panelBefore: before,
    panelAfter: Object.keys(data.domains).length,
    added: adding,
    deferred: deferred.map((c) => c.domain),
    departuresKept: departures,
  });
  fs.writeFileSync(ledgerFile, JSON.stringify(ledger, null, 1));
  console.log(`Panel now ${Object.keys(data.domains).length} domains. Ledger: data/panel-history.json (${ledger.length} refreshes).`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) await main();
