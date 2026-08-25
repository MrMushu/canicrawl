// Canicrawl crawler: fetches robots.txt + llms.txt for every tracked domain,
// classifies each AI bot's access, writes a dated snapshot + latest.json.
// Zero dependencies. Honest by design: two tiny requests per domain per day,
// identifying user agent, no page-content scraping, never works around a block.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "Mozilla/5.0 (compatible; CanicrawlBot/0.1; +https://canicrawl.example/about) robots-policy-survey";
const CONCURRENCY = 12;
const TIMEOUT_MS = 15000;

const domainsFile = JSON.parse(fs.readFileSync(path.join(ROOT, "data/domains.json"), "utf8"));
const botsFile = JSON.parse(fs.readFileSync(path.join(ROOT, "data/bots.json"), "utf8"));
const DOMAINS = Object.keys(domainsFile.domains);
const BOTS = Object.keys(botsFile.bots);

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/plain,*/*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const buf = await res.arrayBuffer();
  // robots.txt files are small; cap at 1MB to be safe against misconfigured servers
  const text = new TextDecoder("utf-8", { fatal: false }).decode(buf.slice(0, 1024 * 1024));
  return { status: res.status, text, finalUrl: res.url, contentType: res.headers.get("content-type") || "" };
}

function looksLikeHtml(text) {
  return /<!doctype|<html|<head[\s>]|<body[\s>]/i.test(text.slice(0, 600));
}

// --- robots.txt parsing (RFC 9309 essentials) ---
// Returns groups: [{ agents: [lowercased tokens], rules: [{ type, path }] }]
function parseRobots(text) {
  const groups = [];
  let current = null;
  let collectingAgents = false;
  for (let rawLine of text.split(/\r?\n/)) {
    const hash = rawLine.indexOf("#");
    const line = (hash >= 0 ? rawLine.slice(0, hash) : rawLine).trim();
    if (!line) continue;
    const colon = line.indexOf(":");
    if (colon < 0) continue;
    const field = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    if (field === "user-agent") {
      if (!collectingAgents) {
        current = { agents: [], rules: [] };
        groups.push(current);
        collectingAgents = true;
      }
      current.agents.push(value.toLowerCase());
    } else if (field === "allow" || field === "disallow") {
      if (!current) continue; // rules before any user-agent line: ignore
      collectingAgents = false;
      current.rules.push({ type: field, path: value });
    } else {
      // sitemap, crawl-delay, etc. end the agent-collection run but not the group
      if (current) collectingAgents = false;
    }
  }
  return groups;
}

// Classify one bot's access given parsed groups.
// status: "blocked" (root disallow), "restricted" (some paths disallowed),
//         "allowed" (explicit or empty rules), plus source: "named" | "wildcard" | "none"
function classifyBot(groups, botToken) {
  const token = botToken.toLowerCase();
  const named = groups.filter((g) => g.agents.includes(token));
  if (named.length > 0) return { ...verdict(named.flatMap((g) => g.rules)), source: "named" };
  const wild = groups.filter((g) => g.agents.includes("*"));
  if (wild.length > 0) return { ...verdict(wild.flatMap((g) => g.rules)), source: "wildcard" };
  return { status: "allowed", source: "none" };
}

function verdict(rules) {
  // Empty Disallow value means "allow everything" per the spec — ignore those.
  const disallows = rules.filter((r) => r.type === "disallow" && r.path !== "");
  const allowRoot = rules.some((r) => r.type === "allow" && (r.path === "/" || r.path === "/*"));
  const disallowRoot = disallows.some((r) => r.path === "/" || r.path === "/*");
  if (disallowRoot && !allowRoot) return { status: "blocked" };
  if (disallowRoot && allowRoot) return { status: "allowed" }; // longest-match tie → least restrictive wins
  if (disallows.length > 0) return { status: "restricted" };
  return { status: "allowed" };
}

async function crawlDomain(domain) {
  const result = { fetch: "ok", llmstxt: false, bots: {}, wildcard: null };
  let robotsText = null;
  for (const host of [domain, "www." + domain]) {
    try {
      const r = await fetchText(`https://${host}/robots.txt`);
      if (r.status === 200 && !looksLikeHtml(r.text)) { robotsText = r.text; break; }
      if (r.status === 200 && looksLikeHtml(r.text)) { result.fetch = "html-response"; continue; }
      if (r.status === 404 || r.status === 410) { result.fetch = "no-robots"; break; }
      if (r.status === 401 || r.status === 403) { result.fetch = "fetch-blocked"; continue; }
      result.fetch = `http-${r.status}`;
    } catch (e) {
      result.fetch = "unreachable";
    }
  }
  if (robotsText !== null) {
    result.fetch = "ok";
    // Archive the raw file (overwrite-in-place: git history preserves every
    // version; unchanged files cost nothing). Receipts for every classification.
    result.robotsHash = crypto.createHash("sha256").update(robotsText).digest("hex").slice(0, 16);
    if (robotsText.length < 262144) {
      fs.writeFileSync(path.join(ROOT, "data/robots", domain + ".txt"), robotsText);
    }
    const groups = parseRobots(robotsText);
    for (const bot of BOTS) result.bots[bot] = classifyBot(groups, bot);
    const wild = groups.filter((g) => g.agents.includes("*"));
    result.wildcard = wild.length ? verdict(wild.flatMap((g) => g.rules)).status : "allowed";
  } else if (result.fetch === "no-robots") {
    // No robots.txt at all: everything is allowed by definition.
    for (const bot of BOTS) result.bots[bot] = { status: "allowed", source: "none" };
    result.wildcard = "allowed";
  } else {
    // Couldn't read policy: statuses unknown. Record honestly, never guess.
    for (const bot of BOTS) result.bots[bot] = { status: "unknown", source: "none" };
    result.wildcard = "unknown";
  }
  // llms.txt check (only meaningful if the site is reachable at all)
  if (result.fetch !== "unreachable") {
    for (const host of [domain, "www." + domain]) {
      try {
        const l = await fetchText(`https://${host}/llms.txt`);
        if (l.status === 200 && !looksLikeHtml(l.text) && l.text.trim().length > 0) {
          result.llmstxt = true;
          if (l.text.length < 262144) {
            fs.writeFileSync(path.join(ROOT, "data/llmstxt", domain + ".txt"), l.text);
          }
        }
        break;
      } catch { /* try www */ }
    }
  }
  return result;
}

// Compare two snapshots and return human-meaningful policy changes.
// Only diffs domains whose policy was readable in BOTH snapshots (no flap noise).
export function computeDiffs(prev, next) {
  const entries = [];
  const readable = (e) => e && (e.fetch === "ok" || e.fetch === "no-robots");
  for (const [domain, now] of Object.entries(next.domains)) {
    const was = prev?.domains?.[domain];
    if (!was) {
      entries.push({ date: next.date, domain, kind: "added" });
      continue;
    }
    if (!readable(was) || !readable(now)) continue;
    if (was.llmstxt !== now.llmstxt) {
      entries.push({ date: next.date, domain, kind: "llmstxt", from: was.llmstxt, to: now.llmstxt });
    }
    if ((was.wildcard ?? "allowed") !== (now.wildcard ?? "allowed")) {
      entries.push({ date: next.date, domain, kind: "wildcard", from: was.wildcard, to: now.wildcard });
    }
    for (const bot of Object.keys(now.bots)) {
      const a = was.bots[bot]?.status;
      const b = now.bots[bot]?.status;
      if (a && b && a !== b && a !== "unknown" && b !== "unknown") {
        entries.push({ date: next.date, domain, kind: "bot-flip", bot, from: a, to: b });
      }
    }
  }
  return entries;
}

function appendChangelog(newEntries) {
  const file = path.join(ROOT, "data/changelog.json");
  const log = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { entries: [] };
  const seen = new Set(log.entries.map((e) => JSON.stringify(e)));
  let added = 0;
  for (const e of newEntries) {
    const key = JSON.stringify(e);
    if (!seen.has(key)) { log.entries.push(e); seen.add(key); added++; }
  }
  fs.writeFileSync(file, JSON.stringify(log, null, 1));
  return added;
}

async function run() {
  const started = Date.now();
  const NEW_ONLY = process.argv.includes("--new-only");
  const prev = fs.existsSync(path.join(ROOT, "data/latest.json"))
    ? JSON.parse(fs.readFileSync(path.join(ROOT, "data/latest.json"), "utf8"))
    : null;
  // --new-only: crawl only domains missing from the previous snapshot and merge.
  // Keeps the one-polite-pass-per-day promise for already-crawled domains.
  const targets = NEW_ONLY && prev ? DOMAINS.filter((d) => !prev.domains[d]) : DOMAINS;
  if (NEW_ONLY) console.log(`--new-only: crawling ${targets.length} new domains (merging with ${Object.keys(prev?.domains ?? {}).length} existing)`);
  fs.mkdirSync(path.join(ROOT, "data/robots"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "data/llmstxt"), { recursive: true });
  const out = {};
  let i = 0;
  const queue = [...targets];
  async function worker() {
    while (queue.length) {
      const domain = queue.shift();
      out[domain] = await crawlDomain(domain);
      i++;
      if (i % 25 === 0) console.log(`  ${i}/${targets.length}…`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const date = new Date().toISOString().slice(0, 10);
  const merged = NEW_ONLY && prev ? { ...prev.domains, ...out } : out;
  const snapshot = {
    date,
    generatedAt: new Date().toISOString(),
    domainCount: Object.keys(merged).length,
    botCount: BOTS.length,
    domains: merged,
  };
  fs.mkdirSync(path.join(ROOT, "data/snapshots"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, `data/snapshots/${date}.json`), JSON.stringify(snapshot, null, 1));
  fs.writeFileSync(path.join(ROOT, "data/latest.json"), JSON.stringify(snapshot, null, 1));
  if (NEW_ONLY) {
    if (targets.length) appendChangelog([{ date, kind: "panel", count: targets.length }]);
  } else if (prev && prev.date !== snapshot.date) {
    const diffs = computeDiffs(prev, snapshot);
    const added = appendChangelog(diffs);
    console.log(`Policy changes vs ${prev.date}: ${added} new changelog entries`);
  }

  // Console summary
  const reachable = Object.values(out).filter((d) => d.fetch === "ok" || d.fetch === "no-robots");
  const blockCounts = {};
  for (const bot of BOTS) {
    blockCounts[bot] = reachable.filter((d) => d.bots[bot]?.status === "blocked" && d.bots[bot]?.source === "named").length
      + reachable.filter((d) => d.bots[bot]?.status === "blocked" && d.bots[bot]?.source !== "named").length;
  }
  const anyBlock = reachable.filter((d) => BOTS.some((b) => d.bots[b]?.status === "blocked")).length;
  const llms = Object.values(out).filter((d) => d.llmstxt).length;
  console.log(`\nCrawl finished in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(`Domains: ${DOMAINS.length} | readable policy: ${reachable.length} | fetch problems: ${DOMAINS.length - reachable.length}`);
  console.log(`Sites blocking >=1 tracked AI bot: ${anyBlock}/${reachable.length}`);
  console.log(`llms.txt present: ${llms}`);
  const top = Object.entries(blockCounts).sort((a, b) => b[1] - a[1]);
  for (const [bot, n] of top) console.log(`  ${bot.padEnd(20)} blocked by ${n}`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
