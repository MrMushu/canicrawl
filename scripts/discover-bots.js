// Bot discovery: scan the raw robots.txt archive for User-agent tokens we don't
// track. Sites name bots in robots.txt before anyone documents them — this is
// an early-warning radar for new AI crawlers. Output: data/discovery.json +
// console report. Zero dependencies. Read-only over already-archived files.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const botsFile = JSON.parse(fs.readFileSync(path.join(ROOT, "data/bots.json"), "utf8"));
const TRACKED = new Set(Object.keys(botsFile.bots).map((b) => b.toLowerCase()));

// Well-known non-AI crawlers we deliberately don't flag (search, SEO tools, archivers, social preview).
const KNOWN_NON_AI = new Set([
  "*", "googlebot", "googlebot-image", "googlebot-news", "googlebot-video", "storebot-google",
  "adsbot-google", "adsbot-google-mobile", "mediapartners-google", "apis-google", "feedfetcher-google",
  "bingbot", "adidxbot", "bingpreview", "msnbot", "slurp", "duckduckbot", "baiduspider",
  "yandexbot", "yandeximages", "applebot", "facebookexternalhit", "facebookcatalog", "twitterbot",
  "linkedinbot", "pinterestbot", "pinterest", "whatsapp", "telegrambot", "slackbot", "discordbot",
  "ahrefsbot", "semrushbot", "mj12bot", "dotbot", "rogerbot", "screaming frog seo spider",
  "petalbot", "sogou web spider", "seznambot", "ia_archiver", "archive.org_bot", "uptimerobot",
  "pingdom", "gtmetrix", "coccocbot", "qwantify", "exabot", "gigabot", "naverbot", "yeti",
  "teoma", "aolbuild", "mail.ru_bot", "blexbot", "serpstatbot", "dataforseobot", "awariobot",
  "megaindex", "zoominfobot", "linkfluence", "trendictionbot",
]);
const AI_HINT = /(gpt|claude|openai|anthropic|llm|genai|chatgpt|gemini|bard|perplex|cohere|mistral|deepseek|grok|xai|meta-external|imagesift|ai2|youbot|diffbot|omgili|timpi|pangu|kangaroo|firecrawl|scrapy.?ai|crawl.?ai|(^|[^a-z])ai([^a-z]|$)|train|dataset|scrape)/i;

const dir = path.join(ROOT, "data/robots");
const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".txt")) : [];
const tokens = new Map(); // token(lower) -> { display, sites: Set }
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), "utf8");
  const domain = f.replace(/\.txt$/, "");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*user-agent\s*:\s*(.+?)\s*(#.*)?$/i);
    if (!m) continue;
    const display = m[1].trim();
    const key = display.toLowerCase();
    if (!key || key.length > 64) continue;
    if (!tokens.has(key)) tokens.set(key, { display, sites: new Set() });
    tokens.get(key).sites.add(domain);
  }
}

const untracked = [...tokens.entries()]
  .filter(([k]) => !TRACKED.has(k) && !KNOWN_NON_AI.has(k))
  .map(([k, v]) => ({ token: v.display, sites: v.sites.size, sample: [...v.sites].slice(0, 3), aiHint: AI_HINT.test(k) }))
  .sort((a, b) => b.sites - a.sites);

const candidates = untracked.filter((t) => t.aiHint && t.sites >= 3);
const report = {
  date: new Date().toISOString().slice(0, 10),
  filesScanned: files.length,
  distinctTokens: tokens.size,
  aiCandidates: candidates.slice(0, 60),
  topUntrackedAny: untracked.slice(0, 40),
};
fs.writeFileSync(path.join(ROOT, "data/discovery.json"), JSON.stringify(report, null, 1));
console.log(`Scanned ${files.length} robots.txt files → ${tokens.size} distinct User-agent tokens`);
console.log(`AI-pattern candidates not in our registry (named by ≥3 sites): ${candidates.length}`);
for (const c of candidates.slice(0, 25)) console.log(`  ${c.token.padEnd(36)} named by ${String(c.sites).padStart(3)} sites  e.g. ${c.sample.join(", ")}`);
