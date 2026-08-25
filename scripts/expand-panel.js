// One-shot panel expansion: pull the Tranco top list (research-standard ranking),
// filter out infrastructure/CDN/ad-tech hosts and adult-content domains, dedupe
// against the current panel, and append the remainder as category "top1k".
// Falls back to the Majestic Million CSV if Tranco is unreachable.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARGET_PANEL_SIZE = 1000;
const FETCH_TOP = 6000; // headroom for filtering

const INFRA_SUFFIXES = [
  "googleapis.com", "gstatic.com", "googletagmanager.com", "doubleclick.net",
  "googlesyndication.com", "google-analytics.com", "googleadservices.com",
  "googleusercontent.com", "ggpht.com", "gvt1.com", "gvt2.com", "googlevideo.com",
  "cloudfront.net", "amazonaws.com", "akamai.net", "akamaized.net", "akamaiedge.net",
  "edgekey.net", "edgesuite.net", "fastly.net", "fastlylb.net", "cloudflare.net",
  "cloudflareinsights.com", "fbcdn.net", "cdninstagram.com", "licdn.com", "twimg.com",
  "ytimg.com", "windowsupdate.com", "azureedge.net", "azurefd.net", "trafficmanager.net",
  "cdn77.org", "jsdelivr.net", "scorecardresearch.com", "casalemedia.com",
  "pubmatic.com", "rubiconproject.com", "openx.net", "adnxs.com", "adsrvr.org",
  "demdex.net", "omtrdc.net", "criteo.com", "criteo.net", "taboola.com", "outbrain.com",
  "onetrust.com", "cookielaw.org", "root-servers.net", "gtld-servers.net",
  "sentry-cdn.com", "wp.com", "wixstatic.com", "squarespace-cdn.com", "shopifycdn.com",
  "githubusercontent.com", "githubassets.com", "gravatar.com", "typekit.net",
  "adobedtm.com", "amazon-adsystem.com", "moatads.com", "doubleverify.com",
  "branch.io", "app-measurement.com", "crashlytics.com", "appsflyersdk.com",
  "akadns.net", "apple-dns.net", "aaplimg.com", "domaincontrol.com", "office.net",
  "whatsapp.net", "msedge.net", "a-msedge.net", "azure-dns.com", "azure-dns.net",
  "azure-dns.org", "azure-dns.info", "ultradns.com", "ultradns.net", "ultradns.org",
  "windows.net", "cloudapp.net", "salesforceliveagent.com", "omtrdc.net",
  "nsatc.net", "gslb.com", "footprintdns.com", "trbcdn.net", "llnwd.net",
  "edgecastcdn.net", "cachefly.net", "b-cdn.net", "bunnyinfra.net", "azurefd.us",
  "one.one", "cloudflare-dns.com", "dns.google", "quad9.net", "opendns.com",
  "charter-dns.com", "comcast-dns.net", "att-dns.net", "vzwdns.com",
];
const ADULT = new Set([
  "pornhub.com", "xvideos.com", "xnxx.com", "xhamster.com", "redtube.com",
  "youporn.com", "onlyfans.com", "chaturbate.com", "stripchat.com", "bongacams.com",
  "livejasmin.com", "spankbang.com", "tnaflix.com", "brazzers.com", "cam4.com",
  "myfreecams.com", "eporner.com", "rule34.xxx", "e621.net", "nhentai.net",
  "hanime.tv", "fapello.com", "erome.com", "motherless.com", "hqporner.com",
  "youjizz.com", "tube8.com", "beeg.com", "porn.com", "sex.com", "xvideos2.com",
]);
const ADULT_TLDS = [".xxx", ".porn", ".sex", ".adult", ".cams"];

function excluded(domain) {
  if (ADULT.has(domain)) return true;
  if (ADULT_TLDS.some((t) => domain.endsWith(t))) return true;
  if (INFRA_SUFFIXES.some((s) => domain === s || domain.endsWith("." + s))) return true;
  if (!domain.includes(".")) return true;
  return false;
}

async function fetchTranco() {
  const api = await fetch("https://tranco-list.eu/api/lists/date/latest", {
    signal: AbortSignal.timeout(20000),
  }).then((r) => r.json());
  if (!api?.list_id) throw new Error("no tranco list id");
  const res = await fetch(`https://tranco-list.eu/download/${api.list_id}/${FETCH_TOP}`, {
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`tranco http ${res.status}`);
  const lines = (await res.text()).trim().split(/\r?\n/);
  console.log(`Tranco returned ${lines.length} rows`);
  return { source: `Tranco list ${api.list_id}`, domains: lines.map((l) => l.split(",")[1]).filter(Boolean) };
}

async function fetchMajestic() {
  const res = await fetch("https://downloads.majestic.com/majestic_million.csv", {
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`majestic http ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (buf.split("\n").length < FETCH_TOP + 10) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  const lines = buf.split(/\r?\n/).slice(1, FETCH_TOP + 1);
  return { source: "Majestic Million", domains: lines.map((l) => l.split(",")[2]).filter(Boolean) };
}

const file = path.join(ROOT, "data/domains.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
// Idempotent hygiene: prune previously-added top1k entries that the current
// exclusion list would now reject (curated categories are never pruned).
let pruned = 0;
for (const [d, cat] of Object.entries(data.domains)) {
  if (cat === "top1k" && excluded(d)) { delete data.domains[d]; pruned++; }
}
if (pruned) console.log(`Pruned ${pruned} previously-added domains now on the exclusion list.`);
const existing = new Set(Object.keys(data.domains));

let list;
try { list = await fetchTranco(); }
catch (e) { console.log(`Tranco failed (${e.message}); falling back to Majestic Million`); list = await fetchMajestic(); }

let added = 0, skippedInfra = 0, skippedDupe = 0;
for (const raw of list.domains) {
  if (existing.size >= TARGET_PANEL_SIZE) break;
  const domain = raw.trim().toLowerCase();
  if (!domain) continue;
  if (existing.has(domain)) { skippedDupe++; continue; }
  if (excluded(domain)) { skippedInfra++; continue; }
  data.domains[domain] = "top1k";
  existing.add(domain);
  added++;
}
data.note = (data.note || "") + ` Expanded ${new Date().toISOString().slice(0, 10)} with ${list.source} top sites (category "top1k"); infrastructure/CDN/ad-tech hosts and adult-content domains excluded by list in scripts/expand-panel.js.`;
fs.writeFileSync(file, JSON.stringify(data, null, 1));
console.log(`Source: ${list.source}`);
console.log(`Added ${added} domains (skipped ${skippedDupe} dupes, ${skippedInfra} excluded). Panel now ${existing.size} domains.`);
