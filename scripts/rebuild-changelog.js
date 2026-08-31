// Rebuild data/changelog.json from the append-only snapshots.
//
// The changelog is a *derived* file: every entry is a diff between two
// snapshots, and snapshots are the append-only facts. So when the diff rule is
// corrected, the honest move is to regenerate the changelog from the untouched
// snapshots rather than hand-edit published entries. Snapshots are never
// written here — this script only reads them.
//
// Run: node scripts/rebuild-changelog.js [--write]
// Without --write it prints what would change and exits (dry run).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { computeDiffs, looksLikeHtml } from "./crawl.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WRITE = process.argv.includes("--write");
const file = path.join(ROOT, "data/changelog.json");

const snapDir = path.join(ROOT, "data/snapshots");
const dates = fs.readdirSync(snapDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5)).sort();
const snaps = dates.map((d) => JSON.parse(fs.readFileSync(path.join(snapDir, d + ".json"), "utf8")));

// Repair llms.txt readings that the snapshot series itself contradicts.
//
// The two readings are not equally trustworthy, so the repair is deliberately
// one-directional. A `true` has a receipt: we only record it after fetching a
// non-empty body, which we archive under data/llmstxt/. A `false` is an
// inference from a non-answer, and that is precisely the failure we are fixing.
// So an isolated `false` between two `true`s — with the archived file still on
// disk to prove the file existed — is our probe failing, not a site publishing
// and unpublishing overnight. An isolated `true` is never demoted: that would
// erase a real first sighting the way it erased shein.com's on 2026-08-27.
// (Going forward crawl.js records `llmsFetch: "unknown"` and this never fires.)
let repaired = 0;
for (let i = 1; i < snaps.length - 1; i++) {
  for (const [domain, cur] of Object.entries(snaps[i].domains)) {
    const before = snaps[i - 1].domains[domain];
    const after = snaps[i + 1].domains[domain];
    if (!before || !after) continue;
    const archived = fs.existsSync(path.join(ROOT, "data/llmstxt", domain + ".txt"));
    if (cur.llmstxt === false && before.llmstxt === true && after.llmstxt === true && archived) {
      cur.llmstxt = true; // in-memory only; the snapshot file is untouched
      cur.llmsFetch = "unknown";
      repaired++;
      console.log(`  llms.txt flap repaired: ${domain} read false on ${snaps[i].date}, archived file present`);
    }
  }
}

// Demote llms.txt readings whose archived body is not an llms.txt.
//
// A "true" is only as good as its receipt, and one receipt turned out to be an
// anti-bot interstitial: youku.com's archived body on 2026-08-31 is an Alibaba
// "punish" page (action=deny) that the old looksLikeHtml() waved through
// because it carries no doctype. crawl.js no longer records such bodies, but
// the snapshot is an append-only fact and stays as written — so the reading is
// corrected here, where the changelog is derived. Only domains with an archived
// body can be checked; a "true" whose body exceeded the 256KB archive cap has
// no receipt to test and is left alone (see ring CC-12).
let demoted = 0;
const bodyCache = new Map();
const archivedBody = (domain) => {
  if (!bodyCache.has(domain)) {
    const f = path.join(ROOT, "data/llmstxt", domain + ".txt");
    bodyCache.set(domain, fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);
  }
  return bodyCache.get(domain);
};
for (const snap of snaps) {
  for (const [domain, cur] of Object.entries(snap.domains)) {
    if (cur.llmstxt !== true) continue;
    const body = archivedBody(domain);
    if (body === null || !looksLikeHtml(body)) continue;
    cur.llmstxt = false;       // in-memory only; the snapshot file is untouched
    cur.llmsFetch = "unknown"; // we never got a real answer, so claim nothing
    demoted++;
    console.log("  llms.txt receipt rejected (markup, not Markdown): " + domain + " on " + snap.date);
  }
}

// Entries that are not domain diffs (founding note, panel-growth counts) cannot
// be recomputed from snapshots, so carry them over verbatim.
const old = JSON.parse(fs.readFileSync(file, "utf8")).entries;
const preserved = old.filter((e) => !e.domain);

const rebuilt = [...preserved];
for (let i = 1; i < snaps.length; i++) rebuilt.push(...computeDiffs(snaps[i - 1], snaps[i]));
rebuilt.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

const key = (e) => JSON.stringify(e);
const oldKeys = new Set(old.map(key));
const newKeys = new Set(rebuilt.map(key));
const dropped = old.filter((e) => !newKeys.has(key(e)));
const gained = rebuilt.filter((e) => !oldKeys.has(key(e)));

const byDomain = {};
for (const e of dropped) byDomain[e.domain] = (byDomain[e.domain] || 0) + 1;
console.log(`\nsnapshots: ${dates.length} (${dates[0]} → ${dates.at(-1)})`);
console.log(`llms flaps repaired: ${repaired}; receipts rejected: ${demoted}`);
console.log(`entries: ${old.length} → ${rebuilt.length}`);
console.log(`dropped ${dropped.length}:`, JSON.stringify(byDomain));
console.log(`gained ${gained.length}:`, gained.map(key).slice(0, 10).join("\n  ") || "none");

if (WRITE) {
  fs.writeFileSync(file, JSON.stringify({ entries: rebuilt }, null, 1));
  console.log(`\nwrote ${file}`);
} else {
  console.log("\ndry run — pass --write to apply");
}
