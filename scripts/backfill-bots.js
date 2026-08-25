// One-shot backfill: classify newly-registered bots against the ARCHIVED
// robots.txt files (no crawling — re-parses data already fetched by the cron).
// Sites with fetch "no-robots" get allowed/none; sites without an archived
// file stay unknown until the next cron pass.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseRobots, classifyBot } from "./crawl.js";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const latestPath = path.join(ROOT, "data/latest.json");
const snap = JSON.parse(fs.readFileSync(latestPath, "utf8"));
const bots = Object.keys(JSON.parse(fs.readFileSync(path.join(ROOT, "data/bots.json"), "utf8")).bots);

let parsed = 0, defaulted = 0, unknown = 0;
for (const [domain, entry] of Object.entries(snap.domains)) {
  const missing = bots.filter((b) => !entry.bots[b]);
  if (!missing.length) continue;
  const file = path.join(ROOT, "data/robots", domain + ".txt");
  if (fs.existsSync(file)) {
    const groups = parseRobots(fs.readFileSync(file, "utf8"));
    for (const b of missing) entry.bots[b] = classifyBot(groups, b);
    parsed++;
  } else if (entry.fetch === "no-robots") {
    for (const b of missing) entry.bots[b] = { status: "allowed", source: "none" };
    defaulted++;
  } else {
    for (const b of missing) entry.bots[b] = { status: "unknown", source: "none" };
    unknown++;
  }
}
snap.botCount = bots.length;
fs.writeFileSync(latestPath, JSON.stringify(snap, null, 1));
fs.writeFileSync(path.join(ROOT, `data/snapshots/${snap.date}.json`), JSON.stringify(snap, null, 1));
console.log(`Backfilled ${bots.length}-bot registry: ${parsed} sites from archived files, ${defaulted} allowed-by-default (no robots.txt), ${unknown} unknown (no archive yet).`);
