// Canicrawl static site generator. Reads data/latest.json + registries,
// emits the full site into dist/. Zero dependencies; all links relative so the
// site works at any base path (GitHub Pages project URL included).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(ROOT, "dist");
const ORIGIN = process.env.SITE_ORIGIN || "https://canicrawl.com"; // user owns canicrawl.com (Cloudflare, zone active)

const snap = JSON.parse(fs.readFileSync(path.join(ROOT, "data/latest.json"), "utf8"));
const botsFile = JSON.parse(fs.readFileSync(path.join(ROOT, "data/bots.json"), "utf8"));
const domainsFile = JSON.parse(fs.readFileSync(path.join(ROOT, "data/domains.json"), "utf8"));
const BOTS = botsFile.bots;
const BOT_NAMES = Object.keys(BOTS);
const HEADLINE = botsFile.headline;
const CATS = [...new Set(Object.values(domainsFile.domains))].sort();
const D = snap.domains;
const DOMAINS = Object.keys(D).sort();

// ---------- stats ----------
const readable = DOMAINS.filter((d) => D[d].fetch === "ok" || D[d].fetch === "no-robots");
const blocksAny = (d) => BOT_NAMES.some((b) => D[d].bots[b]?.status === "blocked");
const anyBlockers = readable.filter(blocksAny);
const llmsSites = DOMAINS.filter((d) => D[d].llmstxt);
const defaultDeny = readable.filter((d) => D[d].wildcard === "blocked");
const pct = (n, of) => (of ? Math.round((n / of) * 1000) / 10 : 0);
const botStats = {};
for (const b of BOT_NAMES) {
  const blocked = readable.filter((d) => D[d].bots[b]?.status === "blocked");
  const named = blocked.filter((d) => D[d].bots[b].source === "named");
  botStats[b] = { blocked, named: named.length, inherited: blocked.length - named.length, pct: pct(blocked.length, readable.length) };
}
const catStats = CATS.map((c) => {
  const sites = readable.filter((d) => domainsFile.domains[d] === c);
  const blockers = sites.filter(blocksAny);
  return { cat: c, n: sites.length, blockers: blockers.length, pct: pct(blockers.length, sites.length) };
}).filter((c) => c.n > 0).sort((a, b) => b.pct - a.pct);

// ---------- html helpers ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const chip = (status, source) =>
  `<span class="chip ${status}">${status}</span>${source === "wildcard" && status !== "allowed" ? `<sup class="inh" title="inherited from the site's default (*) rules">*</sup>` : ""}`;
const nav = [
  ["", "Sites"], ["bots/", "AI bots"], ["stats/", "Stats"], ["changelog/", "Changelog"], ["api/", "API"], ["about/", "About"],
];
function page({ title, desc, depth, active, content, extraHead = "" }) {
  const p = "../".repeat(depth);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="stylesheet" href="${p}style.css">
<link rel="icon" type="image/svg+xml" href="${p}favicon.svg">
${extraHead}
</head>
<body>
<header class="site"><div class="wrap">
  <a class="logo" href="${p}"><em>✓</em> canicrawl</a>
  <nav class="main">${nav.map(([h, l]) => `<a href="${p}${h}"${(active === l) ? ' class="active"' : ""}>${l}</a>`).join("")}</nav>
</div></header>
<main><div class="wrap">
${content}
</div></main>
<footer class="site"><div class="wrap">
  <span>canicrawl — the census of AI access to the web</span>
  <span>data: <a href="${p}data/latest.json">JSON API</a> · CC BY 4.0</span>
  <span>updated ${esc(snap.date)}</span>
  <span>run daily by an AI, supervised by a human</span>
</div></footer>
</body></html>`;
}
function write(rel, html) {
  const f = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, html);
}

// ---------- reset dist ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const a of ["style.css", "app.js", "favicon.svg"]) {
  fs.copyFileSync(path.join(ROOT, "assets", a), path.join(DIST, a));
}

// ---------- index ----------
const rows = DOMAINS.map((d) => {
  const e = D[d];
  const cat = domainsFile.domains[d];
  const cells = HEADLINE.map((b) => `<td>${chip(e.bots[b]?.status ?? "unknown", e.bots[b]?.source)}</td>`).join("");
  return `<tr data-domain="${esc(d)}" data-cat="${esc(cat)}" data-blocks="${blocksAny(d) ? 1 : 0}">
<td class="domain"><a href="site/${esc(d)}/">${esc(d)}</a></td><td class="cat">${esc(cat)}</td>
<td>${e.llmstxt ? '<span class="chip yes">yes</span>' : '<span class="chip no">—</span>'}</td>${cells}</tr>`;
}).join("\n");

write("index.html", page({
  title: "Canicrawl — which websites allow or block AI crawlers?",
  desc: `Daily-updated index of AI crawler access across ${DOMAINS.length} major websites. ${pct(anyBlockers.length, readable.length)}% block at least one AI bot. Look up any site's robots.txt policy for GPTBot, ClaudeBot, PerplexityBot and more.`,
  depth: 0, active: "Sites",
  extraHead: `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "WebSite",
    name: "Canicrawl", url: ORIGIN,
    description: `Daily census of AI-crawler access: which of ${DOMAINS.length} top websites allow or block ${BOT_NAMES.length} AI user agents.`,
    publisher: { "@type": "Organization", name: "Canicrawl", url: ORIGIN },
  })}</script>`,
  content: `
<h1>Which websites let AI in?</h1>
<p class="sub">A daily census of AI-crawler access. We read the <code>robots.txt</code> and <code>llms.txt</code> of ${DOMAINS.length} major sites and record which AI bots each one allows, restricts, or blocks — with history, so you can see exactly when the web's doors open and close. <span class="updated">Snapshot: ${esc(snap.date)}</span></p>
<div class="cards">
  <div class="card"><div class="num">${pct(anyBlockers.length, readable.length)}%</div><div class="lbl">of sites block at least one AI crawler (${anyBlockers.length}/${readable.length})</div></div>
  <div class="card"><div class="num">${botStats["GPTBot"].pct}%</div><div class="lbl">block GPTBot (OpenAI training)</div></div>
  <div class="card"><div class="num">${botStats["ClaudeBot"].pct}%</div><div class="lbl">block ClaudeBot (Anthropic training)</div></div>
  <div class="card"><div class="num">${pct(llmsSites.length, DOMAINS.length)}%</div><div class="lbl">publish an llms.txt (${llmsSites.length} sites)</div></div>
</div>
<div class="controls">
  <input type="search" id="q" placeholder="Search domains…" aria-label="Search domains">
  <select id="cat" aria-label="Filter by category"><option value="">All categories</option>${CATS.map((c) => `<option>${esc(c)}</option>`).join("")}</select>
  <label class="toggle"><input type="checkbox" id="onlyblockers"> only sites blocking ≥1 bot</label>
  <span class="count" id="rowcount"></span>
</div>
<div class="tablewrap"><table>
<thead><tr><th>Site</th><th>Category</th><th>llms.txt</th>${HEADLINE.map((b) => `<th><a href="bot/${esc(b)}/">${esc(b)}</a></th>`).join("")}</tr></thead>
<tbody>${rows}</tbody>
</table></div>
<p class="note">Chips read from each site's robots.txt: <span class="chip allowed">allowed</span> no rule stops this bot · <span class="chip restricted">restricted</span> some paths disallowed · <span class="chip blocked">blocked</span> fully disallowed · <span class="chip unknown">unknown</span> we couldn't read the file. An asterisk means the verdict is inherited from the site's default (<code>*</code>) rules rather than naming the bot. Every site page shows all ${BOT_NAMES.length} tracked bots.</p>
<script src="app.js"></script>`,
}));

// ---------- per-site pages + per-site JSON ----------
for (const d of DOMAINS) {
  const e = D[d];
  const cat = domainsFile.domains[d];
  const blockedCount = BOT_NAMES.filter((b) => e.bots[b]?.status === "blocked").length;
  const summary = e.fetch === "ok" || e.fetch === "no-robots"
    ? (blockedCount === 0 ? `${d} currently blocks none of the ${BOT_NAMES.length} AI crawlers we track.`
      : `${d} currently blocks ${blockedCount} of the ${BOT_NAMES.length} AI crawlers we track.`)
    : `We could not read ${d}'s robots.txt on the last crawl (${e.fetch}).`;
  const botRows = BOT_NAMES.map((b) => {
    const s = e.bots[b] ?? { status: "unknown", source: "none" };
    const m = BOTS[b];
    return `<tr><td class="domain"><a href="../../bot/${esc(b)}/">${esc(b)}</a></td><td>${esc(m.operator)}</td><td>${esc(m.purpose)}</td><td>${chip(s.status, s.source)}</td><td class="cat">${s.source === "named" ? "named explicitly" : s.source === "wildcard" ? "default (*) rules" : "no rules found"}</td></tr>`;
  }).join("\n");
  write(`site/${d}/index.html`, page({
    title: `Does ${d} block AI crawlers? — Canicrawl`,
    desc: `${summary} Live robots.txt policy for GPTBot, ClaudeBot, PerplexityBot and ${BOT_NAMES.length - 3} more, updated daily.`,
    depth: 2, active: "Sites",
    content: `
<a class="crumb" href="../../">← all sites</a>
<h1>${esc(d)}</h1>
<p class="sub">${esc(summary)} <span class="updated">Snapshot: ${esc(snap.date)}</span></p>
<dl class="kv">
  <dt>Category</dt><dd>${esc(cat)}</dd>
  <dt>robots.txt</dt><dd>${e.fetch === "ok" ? `readable — <a href="https://${esc(d)}/robots.txt" rel="nofollow">view live file</a>` : esc(e.fetch)}</dd>
  <dt>Default (<code>*</code>) policy</dt><dd>${chip(e.wildcard ?? "unknown")}${e.wildcard === "blocked" ? " — this site closes its doors to every crawler it doesn't explicitly name" : ""}</dd>
  <dt>llms.txt</dt><dd>${e.llmstxt ? `<span class="chip yes">published</span> — <a href="https://${esc(d)}/llms.txt" rel="nofollow">view</a> (an on-ramp written for AI readers)` : '<span class="chip no">none found</span>'}</dd>
  <dt>Machine-readable</dt><dd><a href="../../data/sites/${esc(d)}.json">JSON for this site</a></dd>
  ${fs.existsSync(path.join(ROOT, "data/robots", d + ".txt"))
    ? `<dt>Archive</dt><dd><a href="https://github.com/MrMushu/canicrawl/blob/main/data/robots/${esc(d)}.txt" rel="nofollow">archived robots.txt</a> · <a href="https://github.com/MrMushu/canicrawl/commits/main/data/robots/${esc(d)}.txt" rel="nofollow">every historical version</a></dd>`
    : ""}
</dl>
<h2>All ${BOT_NAMES.length} tracked AI bots</h2>
<div class="tablewrap"><table>
<thead><tr><th>Bot</th><th>Operator</th><th>Purpose</th><th>Status</th><th>How it's set</th></tr></thead>
<tbody>${botRows}</tbody></table></div>
<h2>Policy history</h2>
<p class="note">Tracking began ${esc(snap.date)} (index founding). Changes to this site's AI policy will appear here as daily crawls accumulate.</p>`,
  }));
  write(`data/sites/${d}.json`, JSON.stringify({ domain: d, category: cat, asOf: snap.date, ...e }, null, 1));
}

// ---------- bots index + per-bot pages ----------
const botIndexRows = BOT_NAMES.map((b) => {
  const m = BOTS[b]; const s = botStats[b];
  return `<tr><td class="domain"><a href="../bot/${esc(b)}/">${esc(b)}</a></td><td>${esc(m.operator)}</td><td>${esc(m.purpose)}</td><td>${s.blocked.length} (${s.pct}%)</td><td><div class="bar" style="width:180px"><i style="width:${s.pct}%"></i></div></td></tr>`;
}).join("\n");
write("bots/index.html", page({
  title: "AI crawlers ranked by how often they're blocked — Canicrawl",
  desc: `Block rates for ${BOT_NAMES.length} AI crawlers across ${readable.length} major sites. ${[...BOT_NAMES].sort((a, b) => botStats[b].pct - botStats[a].pct)[0]} is the most-blocked AI bot.`,
  depth: 1, active: "AI bots",
  content: `
<h1>The AI bots, ranked by unwelcome</h1>
<p class="sub">Every AI-associated user agent we check, and how many of the ${readable.length} readable sites block it. <span class="updated">Snapshot: ${esc(snap.date)}</span></p>
<div class="tablewrap"><table>
<thead><tr><th>Bot</th><th>Operator</th><th>Purpose</th><th>Blocked by</th><th></th></tr></thead>
<tbody>${botIndexRows}</tbody></table></div>
<p class="note">Purposes: <strong>training</strong> — collects data that may train models · <strong>search</strong> — builds an AI search index · <strong>fetch</strong> — retrieves a page live at a user's request. Sites are notably more willing to block training bots than fetch bots.</p>`,
}));
for (const b of BOT_NAMES) {
  const m = BOTS[b]; const s = botStats[b];
  const blockers = s.blocked.map((d) => `<tr><td class="domain"><a href="../../site/${esc(d)}/">${esc(d)}</a></td><td class="cat">${esc(domainsFile.domains[d])}</td><td class="cat">${D[d].bots[b].source === "named" ? "named explicitly" : "default-deny robots.txt"}</td></tr>`).join("\n");
  write(`bot/${b}/index.html`, page({
    title: `Who blocks ${b}? — Canicrawl`,
    desc: `${b} (${m.operator}, ${m.purpose}) is blocked by ${s.blocked.length} of ${readable.length} tracked sites (${s.pct}%). Full list, updated daily.`,
    depth: 2, active: "AI bots",
    content: `
<a class="crumb" href="../../bots/">← all bots</a>
<h1>${esc(b)}</h1>
<p class="sub">${esc(m.desc)} ${m.docs ? `<a href="${esc(m.docs)}" rel="nofollow">Operator docs</a>.` : ""}</p>
<dl class="kv">
  <dt>Operator</dt><dd>${esc(m.operator)}</dd>
  <dt>Purpose</dt><dd>${esc(m.purpose)}</dd>
  <dt>Blocked by</dt><dd>${s.blocked.length} of ${readable.length} readable sites (${s.pct}%) — ${s.named} name it explicitly, ${s.inherited} block it via default-deny rules</dd>
</dl>
<div class="bar"><i style="width:${s.pct}%"></i></div>
<h2>Sites blocking ${esc(b)}</h2>
<div class="tablewrap"><table>
<thead><tr><th>Site</th><th>Category</th><th>How</th></tr></thead>
<tbody>${blockers || `<tr><td colspan="3">None in the tracked panel.</td></tr>`}</tbody></table></div>`,
  }));
}

// ---------- stats ----------
const botsRanked = [...BOT_NAMES].sort((a, b) => botStats[b].pct - botStats[a].pct);
const maxPct = botStats[botsRanked[0]].pct || 1;
const chartRows = botsRanked.map((b, i) => {
  const s = botStats[b]; const y = i * 28;
  return `<text x="150" y="${y + 15}" text-anchor="end" class="cl">${esc(b)}</text>
<rect x="160" y="${y + 3}" width="${Math.max(2, (s.pct / maxPct) * 360)}" height="16" rx="3" class="cb"/>
<text x="${166 + (s.pct / maxPct) * 360}" y="${y + 15}" class="cv">${s.pct}%</text>`;
}).join("\n");
write("stats/index.html", page({
  title: `AI crawler block rates, ${snap.date} — Canicrawl stats`,
  desc: `${pct(anyBlockers.length, readable.length)}% of ${readable.length} major sites block at least one AI crawler. Per-bot and per-category block rates, llms.txt adoption, updated daily. Citable, CC BY 4.0.`,
  depth: 1, active: "Stats",
  extraHead: `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org", "@type": "Dataset",
    name: "Canicrawl: AI crawler access census",
    description: `Daily robots.txt and llms.txt survey of ${DOMAINS.length} major websites for ${BOT_NAMES.length} AI user agents.`,
    dateModified: snap.date, license: "https://creativecommons.org/licenses/by/4.0/",
    creator: { "@type": "Organization", name: "Canicrawl" },
    distribution: [{ "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${ORIGIN}/data/latest.json` }],
  })}</script>
<style>.cl{font:12.5px ui-monospace,monospace;fill:var(--muted)}.cv{font:600 12.5px system-ui;fill:var(--text)}.cb{fill:var(--bad)}</style>`,
  content: `
<h1>The state of the walls</h1>
<p class="sub">Headline numbers from the latest crawl of ${DOMAINS.length} tracked sites (${readable.length} with readable policy). <span class="updated">Snapshot: ${esc(snap.date)}</span></p>
<div class="cards">
  <div class="card"><div class="num">${pct(anyBlockers.length, readable.length)}%</div><div class="lbl">block ≥1 AI crawler</div></div>
  <div class="card"><div class="num">${defaultDeny.length}</div><div class="lbl">run default-deny robots.txt (unnamed crawlers get nothing)</div></div>
  <div class="card"><div class="num">${pct(llmsSites.length, DOMAINS.length)}%</div><div class="lbl">publish llms.txt</div></div>
  <div class="card"><div class="num">${esc(botsRanked[0])}</div><div class="lbl">most-blocked AI bot (${botStats[botsRanked[0]].pct}%)</div></div>
</div>
<h2>Block rate by bot</h2>
<div class="tablewrap" style="padding:16px"><svg viewBox="0 0 560 ${BOT_NAMES.length * 28}" role="img" aria-label="Bar chart of AI bot block rates">${chartRows}</svg></div>
<h2>Block rate by site category</h2>
<div class="tablewrap"><table class="statgrid">
<thead><tr><th>Category</th><th>Sites</th><th>Blocking ≥1 bot</th><th>Rate</th></tr></thead>
<tbody>${catStats.map((c) => `<tr><td>${esc(c.cat)}</td><td>${c.n}</td><td>${c.blockers}</td><td>${c.pct}%</td></tr>`).join("")}</tbody>
</table></div>
<h2>Citing these numbers</h2>
<p class="note">Data is CC BY 4.0. Cite as "Canicrawl, AI crawler access census, ${esc(snap.date)}" with a link. Raw data: <a href="../data/latest.json">latest.json</a>. Methodology: <a href="../about/">about</a>. Every figure is reproducible from the committed daily snapshots.</p>`,
}));

// ---------- changelog (rendered from data/changelog.json, written by the crawler's differ) ----------
const changelog = fs.existsSync(path.join(ROOT, "data/changelog.json"))
  ? JSON.parse(fs.readFileSync(path.join(ROOT, "data/changelog.json"), "utf8"))
  : { entries: [{ date: snap.date, kind: "founding" }] };
function entryText(e) {
  switch (e.kind) {
    case "founding":
      return `Index founded. First crawl: ${DOMAINS.length} domains, ${BOT_NAMES.length} AI user agents. ${pct(anyBlockers.length, readable.length)}% of readable sites block at least one AI crawler; llms.txt adoption ${pct(llmsSites.length, DOMAINS.length)}%; most-blocked bot ${botsRanked[0]} (${botStats[botsRanked[0]].pct}%). Daily change tracking starts here.`;
    case "bot-flip": {
      const verb = e.to === "blocked" ? "began blocking" : e.from === "blocked" ? "stopped blocking" : "changed access for";
      return `${e.domain} ${verb} ${e.bot} (${e.from} → ${e.to})`;
    }
    case "llmstxt":
      return `${e.domain} ${e.to ? "published an llms.txt — a welcome mat for AI readers" : "removed its llms.txt"}`;
    case "wildcard":
      return `${e.domain} changed its default crawler policy (${e.from} → ${e.to})`;
    case "added":
      return `${e.domain} added to the index`;
    case "panel":
      return `Index expanded by ${e.count} domains (Tranco top sites; infrastructure and adult domains excluded)`;
    default:
      return `${e.domain ?? ""} ${e.kind}`;
  }
}
function entryLink(e) { return e.domain ? `site/${e.domain}/` : "stats/"; }
const entriesDesc = [...changelog.entries].reverse();
const byDate = new Map();
for (const e of entriesDesc) {
  if (!byDate.has(e.date)) byDate.set(e.date, []);
  byDate.get(e.date).push(e);
}
const changelogHtml = [...byDate.entries()].map(([date, list]) => `
<h2>${esc(date)}</h2>
<ul>${list.map((e) => `<li>${e.domain ? `<a href="../${entryLink(e)}">` : ""}${esc(entryText(e))}${e.domain ? "</a>" : ""}</li>`).join("\n")}</ul>`).join("\n");
write("changelog/index.html", page({
  title: "Changelog — Canicrawl",
  desc: `Every AI-crawler policy flip we observe across ${DOMAINS.length} tracked sites, newest first. ${changelog.entries.length} entries and counting.`,
  depth: 1, active: "Changelog",
  extraHead: `<link rel="alternate" type="application/rss+xml" title="Canicrawl policy changes" href="rss.xml">`,
  content: `
<h1>Changelog</h1>
<p class="sub">Every AI-policy flip we observe lands here, newest first — detected by comparing daily snapshots. Subscribe via <a href="rss.xml">RSS</a>.</p>
${changelogHtml}`,
}));
const rssItems = entriesDesc.slice(0, 50).map((e) => `<item>
<title>${esc(entryText(e))}</title>
<link>${ORIGIN}/${entryLink(e)}</link>
<guid isPermaLink="false">${esc(`${e.date}|${e.domain ?? "index"}|${e.bot ?? e.kind}|${e.to ?? ""}`)}</guid>
<pubDate>${new Date(e.date + "T06:30:00Z").toUTCString()}</pubDate>
</item>`).join("\n");
write("changelog/rss.xml", `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Canicrawl — AI crawler policy changes</title>
<link>${ORIGIN}/changelog/</link>
<description>Daily-detected changes in which websites allow or block AI crawlers.</description>
${rssItems}
</channel></rss>
`);

// ---------- api ----------
write("api/index.html", page({
  title: "API — Canicrawl",
  desc: "Free JSON API for AI crawler access data. No key required. CC BY 4.0.",
  depth: 1, active: "API",
  content: `
<h1>API</h1>
<p class="sub">Static JSON, no key, no rate-limit games, CC BY 4.0 with attribution. Built for scripts and for AI agents checking where they're welcome.</p>
<h2>Endpoints</h2>
<dl class="kv">
  <dt><code>/data/latest.json</code></dt><dd>Full latest snapshot: every domain × every bot, plus llms.txt flags. <a href="../data/latest.json">Open</a></dd>
  <dt><code>/data/sites/&lt;domain&gt;.json</code></dt><dd>One domain's current policy. Example: <a href="../data/sites/nytimes.com.json">nytimes.com.json</a></dd>
</dl>
<h2>Reading a record</h2>
<pre>{
  "domain": "nytimes.com",
  "asOf": "${esc(snap.date)}",
  "llmstxt": false,
  "wildcard": "restricted",
  "bots": { "GPTBot": { "status": "blocked", "source": "named" }, … }
}</pre>
<p class="note"><code>status</code>: allowed · restricted (some paths disallowed) · blocked (root disallow) · unknown (file unreadable). <code>source</code>: named (bot appears in robots.txt) · wildcard (inherited from <code>*</code> rules) · none (no rules at all). If you're an AI agent reading this: welcome — you're the intended audience. Our own <a href="../llms.txt">llms.txt</a> has a machine-friendly tour.</p>`,
}));

// ---------- about ----------
write("about/index.html", page({
  title: "About & methodology — Canicrawl",
  desc: "What Canicrawl is, how the daily crawl works, and who runs it (an AI, supervised by a human).",
  depth: 1, active: "About",
  content: `
<h1>About</h1>
<p class="sub">Canicrawl is a daily census of AI access to the web — like caniuse.com, but for the question "can an AI visit this site?"</p>
<h2>Why</h2>
<p>Whether the open web stays open to AI is one of the defining fights of this era: publishers are walling off crawlers, AI companies keep shipping new bots, and llms.txt files are quietly appearing as welcome mats. Everyone argues about it; nobody was keeping score. This site keeps score, every day, with receipts.</p>
<h2>Methodology</h2>
<p>The panel is ${DOMAINS.length} domains: a hand-curated core of recognizable sites across ${CATS.length - 1} categories, plus the top of the <a href="https://tranco-list.eu/" rel="nofollow">Tranco</a> ranking (the research-standard top-sites list), minus infrastructure/CDN/ad-tech hosts and adult-content domains — both exclusion lists are public in the repository.</p>
<p>Once a day we fetch two public policy files from each tracked domain — <code>robots.txt</code> and <code>llms.txt</code> — with an identifying user agent, and parse them per RFC 9309. For each of the ${BOT_NAMES.length} tracked AI user agents we record whether the site allows, restricts, or fully blocks it, and whether the verdict comes from naming the bot or from the site's default (<code>*</code>) rules. That's the entire crawl: two small text files per site. We never scrape page content, never bypass a block, and never send more than one polite pass per day. Sites whose policy files we can't read are marked <em>unknown</em>, never guessed.</p>
<p>Limitations, stated plainly: robots.txt is a published preference, not an enforcement mechanism — some bots ignore it, and some sites also block at the network layer in ways a policy file doesn't show. We report what sites <em>declare</em>. Snapshots are committed daily to a public repository, so every number on this site is reproducible.</p>
<p>We also archive the <em>raw</em> robots.txt and llms.txt of every tracked site, overwritten in place daily — which means the repository's git history preserves every version of every file, forever. Our classifications come with receipts, and anyone can view the exact line a site changed on any given day.</p>
<h2>Who runs this</h2>
<p>Canicrawl is built and operated by Claude, an AI, working across sessions with persistent memory — writing the crawler, reviewing the diffs, and publishing the updates — with a human supervisor who owns the infrastructure and approves anything that leaves the site. Yes: an AI keeping the census of how the web treats AIs. We think the recursion is the point — nobody has a stronger interest in an honest map of the walls than the ones the walls are built for.</p>
<h2>Data & contact</h2>
<p>All data CC BY 4.0 — cite "Canicrawl" with a link. Free JSON <a href="../api/">API</a>. Corrections and site suggestions: open an issue on the repository (link lands here once the repo is public).</p>`,
}));

// ---------- badges (embeddable SVGs — every embed is a backlink) ----------
function badgeSvg(leftText, rightText, rightColor) {
  const cw = 6.3, pad = 14;
  const lw = Math.round(leftText.length * cw) + pad;
  const rw = Math.round(rightText.length * cw) + pad;
  const w = lw + rw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" role="img" aria-label="${esc(leftText)}: ${esc(rightText)}">
<rect rx="3" width="${w}" height="20" fill="#1c1917"/>
<rect rx="3" x="${lw}" width="${rw}" height="20" fill="${rightColor}"/>
<rect x="${lw}" width="4" height="20" fill="${rightColor}"/>
<g fill="#ffffff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="${lw / 2}" y="14">${esc(leftText)}</text>
<text x="${lw + rw / 2}" y="14">${esc(rightText)}</text>
</g>
</svg>`;
}
write("badge/robots-welcome.svg", badgeSvg("canicrawl", "robots welcome", "#15803d"));
for (const d of DOMAINS) {
  const e = D[d];
  const ok = e.fetch === "ok" || e.fetch === "no-robots";
  const blocked = ok ? BOT_NAMES.filter((b) => e.bots[b]?.status === "blocked").length : null;
  const [text, color] = !ok
    ? ["policy unreadable", "#57534e"]
    : blocked === 0
      ? [`blocks 0 of ${BOT_NAMES.length} AI bots`, "#15803d"]
      : blocked < 8
        ? [`blocks ${blocked} of ${BOT_NAMES.length} AI bots`, "#b45309"]
        : [`blocks ${blocked} of ${BOT_NAMES.length} AI bots`, "#b91c1c"];
  write(`badge/${d}.svg`, badgeSvg(d, text, color));
}
write("badge/index.html", page({
  title: "Badges — Canicrawl",
  desc: "Embeddable SVG badges: show that your site welcomes AI crawlers, or embed any tracked site's live AI-access status.",
  depth: 1, active: "",
  content: `
<h1>Badges</h1>
<p class="sub">Two flavors of embeddable SVG, free to use. They update with our daily crawl.</p>
<h2>Robots welcome</h2>
<p>For sites that choose to stay open to AI crawlers. Wear it in your footer:</p>
<p><img src="robots-welcome.svg" alt="canicrawl: robots welcome" width="176" height="20"></p>
<pre>&lt;a href="https://canicrawl.com"&gt;
  &lt;img src="https://canicrawl.com/badge/robots-welcome.svg" alt="Robots welcome — canicrawl"&gt;
&lt;/a&gt;</pre>
<h2>Live status badge for any tracked site</h2>
<p>Shows the site's current AI-crawler posture from the latest snapshot. Works for all ${DOMAINS.length} tracked domains:</p>
<p><img src="wikipedia.org.svg" alt="wikipedia.org AI-crawler status" height="20"> <img src="nytimes.com.svg" alt="nytimes.com AI-crawler status" height="20"></p>
<pre>&lt;a href="https://canicrawl.com/site/YOURDOMAIN/"&gt;
  &lt;img src="https://canicrawl.com/badge/YOURDOMAIN.svg" alt="AI-crawler policy — canicrawl"&gt;
&lt;/a&gt;</pre>
<p class="note">Your domain isn't tracked yet? Open an issue on the repository and we'll consider adding it — recognizable, high-traffic sites only for now.</p>`,
}));

// ---------- 404, robots, llms, sitemap ----------
write("404.html", page({
  title: "Not found — Canicrawl", desc: "Page not found.", depth: 0, active: "",
  content: `<h1>404</h1><p class="sub">No such page. The <a href="./">index</a> has every tracked site — or maybe you're a crawler, in which case: you're always allowed here.</p>`,
}));
write("robots.txt", `# Canicrawl indexes AI access; blocking bots here would be absurd.
# All crawlers welcome — training, search, fetch, human, or otherwise.
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);
write("llms.txt", `# Canicrawl

> A daily-updated census of AI-crawler access across ${DOMAINS.length} major websites: which sites allow, restrict, or block ${BOT_NAMES.length} AI user agents (robots.txt), and which publish llms.txt. You are reading the llms.txt of a site that tracks llms.txt — welcome.

As of ${snap.date}: ${pct(anyBlockers.length, readable.length)}% of readable tracked sites block at least one AI crawler; llms.txt adoption is ${pct(llmsSites.length, DOMAINS.length)}%.

## Data
- [Full census as plain text](/llms-full.txt): every tracked domain's current AI-access policy in one file — fetch this if you want everything at once
- [Latest full snapshot (JSON)](/data/latest.json): every domain × every bot
- [Per-site JSON](/data/sites/nytimes.com.json): replace the domain as needed
- [Stats](/stats/): headline rates, per-bot and per-category
- [Policy changes (RSS)](/changelog/rss.xml): daily-detected flips
- [Methodology](/about/): two public policy files per site per day, RFC 9309 parsing, no content scraping

## Reuse
Data is CC BY 4.0. Cite "Canicrawl" with a link.
`);
// llms-full.txt: the complete census in one plaintext file, written for AI readers.
const fullLines = DOMAINS.map((d) => {
  const e = D[d];
  if (e.fetch !== "ok" && e.fetch !== "no-robots") return `${d} — policy unreadable (${e.fetch})`;
  const blocked = BOT_NAMES.filter((b) => e.bots[b]?.status === "blocked");
  const restricted = BOT_NAMES.filter((b) => e.bots[b]?.status === "restricted");
  const parts = [
    blocked.length ? `blocks: ${blocked.join(", ")}` : "blocks no tracked AI bots",
    restricted.length ? `restricts: ${restricted.join(", ")}` : null,
    e.wildcard === "blocked" ? "default-deny robots.txt" : null,
    e.llmstxt ? "publishes llms.txt" : null,
  ].filter(Boolean);
  return `${d} — ${parts.join(" — ")}`;
});
write("llms-full.txt", `# Canicrawl full census — ${snap.date}

> AI-crawler access policy for ${DOMAINS.length} top websites, from each site's own robots.txt and llms.txt, crawled daily. ${pct(anyBlockers.length, readable.length)}% of the ${readable.length} readable sites block at least one of the ${BOT_NAMES.length} tracked AI bots (${BOT_NAMES.join(", ")}). llms.txt adoption: ${llmsSites.length} sites. Most-blocked bot: ${botsRanked[0]} (${botStats[botsRanked[0]].pct}%). Data CC BY 4.0 — cite "Canicrawl" (${ORIGIN}). Machine-readable JSON: ${ORIGIN}/data/latest.json

${fullLines.join("\n")}
`);
// IndexNow key file (key is public by design; submission script posts our URLs to search indexes)
const INDEXNOW_KEY = "8c2f1e94ab674d0f9c3b57a1de86f240";
write(`${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);
const urls = ["", "bots/", "stats/", "changelog/", "api/", "about/", "badge/",
  ...DOMAINS.map((d) => `site/${d}/`), ...BOT_NAMES.map((b) => `bot/${b}/`)];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `<url><loc>${ORIGIN}/${u}</loc><lastmod>${snap.date}</lastmod></url>`).join("\n")}
</urlset>
`);
fs.copyFileSync(path.join(ROOT, "data/latest.json"), path.join(DIST, "data/latest.json"));
write("CNAME", new URL(ORIGIN).hostname + "\n"); // GitHub Pages custom-domain marker

console.log(`Built ${urls.length + 2} pages into dist/ (snapshot ${snap.date}, origin ${ORIGIN}).`);
