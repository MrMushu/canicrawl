# Portfolio operations — the full build-out plan

The operating system for both products. Loops and ops sessions execute the **Ring queue** at the bottom; humans read the pillars. Maintained by Claude; the user holds three keys: money (domains/accounts), external posting (per-post OK), and strategy vetoes.

**Portfolio:** Canicrawl (canicrawl.com — AI-crawler access census, 1,000 domains) · ShortSupply (mrmushu.github.io/shortsupply — FDA drug-shortage history, 237 drugs). Same engine: daily fetch → snapshot → diff → static site → cron deploy. North star: become the *citable tracker of record* in each niche, then monetize attention via alerts/API/reports.

## Operator notes — this system is designed to be run by ANY Claude model

The founding build (2026-08-24/25, Fable) front-loaded the hard decisions so daily operation is procedural. If you are the operating model, follow these and you cannot go far wrong:

1. **Follow the written procedure exactly.** Session steps live in the daily-ops task prompt and each repo's CLAUDE.md. The pillars above give context; the Ring queue gives the work. Don't improvise new strategy.
2. **Smallest change that works.** Never refactor working scripts, never add npm dependencies, never change stats methodology or the crawler's politeness behavior. If a ring seems to require any of that, it's an ESCALATE, not a judgment call.
3. **Two-strike rule:** if a fix attempt fails twice, stop, journal exactly what you tried and saw, and move to a different ring. Thrashing is worse than a red cron for one day.
4. **ESCALATE (write `USER-NEEDED:` at the top of the journal entry, then stop that thread) for:** anything strategic (launch timing, pivots, new products, pricing), anything external (posting, accounts, purchases — these ALWAYS need the user regardless of model), methodology changes, panel-definition changes beyond the automated Tranco refresh, and any legal/ethical gray area. Suggest the user run escalated items with a larger model if they're complex.
5. **Verify before you claim.** Every ring ends with a build + a concrete spot check (a file exists, a page contains X, an HTTP 200). Journal what you checked, not just what you did.
6. **The hard rules at the bottom of every prompt are absolute.** No model, at any size, ever posts externally, crawls the panels out of schedule, gives medical advice, or edits journal history.
7. **Don't burn the GitHub API budget.** The run-verification endpoint in the ops procedure is *unauthenticated* and capped at **60 requests/hour per IP** — hit it a couple of times per session, never on a short poll loop (a 20s watcher exhausts it in 20 minutes and blinds you exactly when you need it). To find out whether a deploy actually landed, fetch the **live page** and grep for the change; to find out whether Actions itself is broken, use **githubstatus.com/api/v2/summary.json**, which is a different service and is not rate-limited. Check that status page *before* diagnosing a stuck or red run — on 2026-08-26 a queued deploy was a GitHub `major_outage`, not our code.

---

## Pillar 1 — DATA (the moat)

**Canicrawl** · now: 1,000 domains, 16 bots, robots.txt + llms.txt, raw archive from 2026-08-26 cron
- Phase D1: verify first real diffs + raw archive landed (day 2); add per-bot **new-token discovery** — scan raw robots.txt corpus for AI-ish user agents we don't track; alert when one appears in ≥3 sites (front-page material)
- Phase D2: weekly Tranco refresh (new top sites auto-added, journaled); ToS AI-clause detection parked (occupied space — see IDEAS.md bench)
- Phase D3 (post-launch): top-10k with tiers (top-1k daily, rest weekly); CDN-layer block detection (ethics pass first)

**ShortSupply** · now: full FDA dataset daily
- Phase D1: availability-text change detection per presentation (catch quiet revisions); "resolved drugs vanish" tracking (archive keeps them forever — surface as /graveyard/)
- Phase D2: ASHP cross-check ("FDA says resolved, pharmacists say no") — needs ethics/ToS review of ASHP scraping before building; if blocked, note discrepancies editorially only
- Phase D3: per-category RSS feeds (ADHD meds only, oncology only — the feeds patients actually want)

**Data integrity rules (both):** snapshots append-only; unknowns never guessed; one polite pass per UTC day; every published number reproducible from the repo.

## Pillar 2 — PRODUCT

- Canicrawl: OG/meta + a11y/perf pass → "State of the Agent Web" digest page (weekly, written by ops sessions) → compare view (two sites side-by-side) → watchlist UI (client-side, localStorage — free tier of future alerts)
- ShortSupply: llms.txt/llms-full.txt + JSON-LD parity with Canicrawl → drug-page history timelines as diffs accumulate → /graveyard/ (removed drugs) → category RSS
- Shared: keep zero-dependency rule; Lighthouse ≥95; every page useful to both a human and an AI reader

## Pillar 3 — MARKETING (attention compounds like data)

**Standing rule: nothing posts to any external service without the user's explicit per-action OK, ever.** Prep is autonomous; sending is human-gated.

- **Evergreen (autonomous):** SEO pages (shipped: 1,043 + 243), GEO (llms.txt/llms-full.txt/IndexNow — extend to ShortSupply), badges, press/cite pages, weekly digests, README quality, palewire cited as prior art (credibility)
- **Canicrawl launch (waits for ~5-7 days of changelog history):** refresh drafts with live flip-counts → user approves: Show HN → Reddit sequence (r/SEO, r/TechSEO, r/webdev, r/artificial — one/day, tailored) → Data Is Plural submission → explorabl.es-adjacent directories. First-comment kit: methodology, 93.9%-of-news stat, Stack Overflow 418 anecdote
- **ShortSupply launch (after Canicrawl's, with ≥2 weeks of history):** angle = "the FDA overwrites this record; we kept it" + day-counters; targets: Show HN, r/pharmacy (carefully, per sub rules), health-data journalists via /press page; never patient-fear framing
- **Post-launch cadence:** monthly "state of" report per product (sponsorable later); respond to every citation/backlink found in ops sessions

## Pillar 4 — UPKEEP (the machine that keeps the machines running)

- **Daily automatic (cloud, no humans/AI needed):** canicrawl cron 06:17 UTC; shortsupply cron 06:47 UTC — crawl, snapshot, diff, deploy, IndexNow
- **Daily ops session (scheduled task, ~15-30 min):** pull both repos → verify both Actions runs green (if red: diagnose, fix, empty-commit redeploy) → skim new diffs for notable flips (feed the digest draft) → execute ONE ring from the queue → journal both repos → commit/push
- **Weekly (first ops session after Monday):** write/refresh digest pages; Tranco refresh; check domain/URL churn (fee-schedule-style rot); Lighthouse spot-check
- **Failure playbooks:** *No scheduled run created at all* (the runs list has no `schedule` entry for today, rather than a red one) → GitHub **drops** scheduled workflows under load, and does not retry them; this is upstream, so do not edit the workflow. A `push` retrigger does **not** help: both workflows gate the crawl on `github.event_name != 'push'`, so a push rebuilds and deploys but captures no snapshot. The only in-repo recovery is **workflow_dispatch** ("Run workflow" in the Actions tab), which does crawl — and it needs the user, because ops sessions hold no GitHub API token. Escalate the same UTC day or the snapshot is lost for good. · Actions red twice in a row → check upstream (openFDA/Tranco/GitHub status) before touching code; robots.txt fetch-blocked spike → check our UA reputation, never evade; upstream API schema change → fix parser, backfill from snapshots, journal the incident
- **Session hygiene:** journals append-only; memory dir updated only for durable cross-session facts; this file is the single queue — no parallel TODO lists

## Pillar 5 — REVENUE (triggers, not dates)

1. **Trigger: first organic citations/backlinks or ~1k weekly visits (either product)** → build email change-alerts (Supabase + free tier; Claude sets up, user owns account) — the first paid surface
2. **Trigger: alert list ≥200 or inbound API interest** → keyed API tiers; paid watchlists ($3-5/mo consumer, more for orgs)
3. **Canicrawl-specific:** agent-readiness audits for merchants once agentic-commerce inbound appears
4. **ShortSupply-specific:** clinic/pharmacy alert tier (B2B; never monetize patient anxiety)
5. **Both:** sponsored monthly reports only after the free layer has gravity; data licensing (already CC BY — paid tier = freshness/SLA)

---

## Ring queue (loops execute top-to-bottom; tick + journal each; add, never silently drop)

- [x] SS-1: llms.txt polish + llms-full.txt + JSON-LD/OG parity for ShortSupply; sitemap ping treatment (IndexNow key + script + workflow step) — done 2026-08-24 night
- [x] CC-1: OG/meta + a11y pass — canonical + OG/Twitter + theme-color injected at write-time on ALL pages BOTH sites; skip-to-content links; contrast audited OK; no animations so reduced-motion N/A. Deferred to future ring: 1,000-row homepage table weight (~400KB — consider per-category split if Lighthouse complains on real devices) — done 2026-08-24 night
- [x] CC-2: "State of the Agent Web #1" live at /digest/1/ — digest system reads data/digests.json (editorial issues; nav item, index page, sitemap). Weekly issues from ops sessions — done 2026-08-25 early AM
- [x] SS-2: availability-change detection (per-NDC wording revisions → changelog) + /graveyard/ page for drugs quietly removed from the FDA list (nav item, empty-state until first departure) — done 2026-08-25 early AM. Also verified: SS cron fired 43 min late (normal GitHub jitter) — both products' unattended crawls now proven
- [x] CC-3: launch kit finalized — palewire prior-art citation + Press & citation block on /about/; Show HN first-comment drafted; checklist reduced to the user-gated LAUNCH GATE items (recommend firing after ~5 days of changelog flips, i.e. ~Aug 30) — done 2026-08-25 early AM
- [x] SS-3: ShortSupply launch kit — MARKETING.md with tone rules (never patient-fear), hooks (day 5,350; vanishing resolutions; graveyard), Show HN draft, press block on /about/. Gated: Canicrawl first + ≥2 weeks diffs + domain — done 2026-08-25 early AM
- [x] CC-4: bot-discovery radar live (scripts/discover-bots.js → data/discovery.json, wired into daily cron). First scan: 2,073 tokens, 36 untracked AI candidates incl. GrokBot/xAI-Grok, Gemini-Deep-Research (27 sites), DeepSeekBot, FirecrawlAgent, Crawl4AI + our own registry gaps (anthropic-ai 85, Claude-Web 78) — done 2026-08-25 early AM
- [x] CC-6: registry expanded to 32 bots (16 discovered tokens added with metadata) and backfilled from the archived robots.txt files — no crawling needed (scripts/backfill-bots.js: 588 parsed, 61 allowed-by-default, 351 unknown until next cron). New headline columns: Diffbot blocked by 130, anthropic-ai 116, Gemini-Deep-Research 70, GrokBot 64. 1,061 pages — done 2026-08-25 ~03:10
- [x] BOTH-1: sibling cross-links in both footers + /colophon/ story pages on both sites (the AI-built-in-public narrative, machinery description, no-tracking statement) — done 2026-08-25 ~03:45
- [x] CC-5: watchlist live — star any site (index rows + site-page hero), localStorage persistence, "only watched ★" filter; browser-verified end-to-end. This is the free tier that seeds M6 email alerts — done 2026-08-25 ~04:15
- [x] SS-4: 22 per-category RSS feeds (one per therapeutic area), linked from the changelog page — done 2026-08-25 ~04:50. **QUEUE COMPLETE — all 11 founding rings shipped in one night.** Ops sessions: append next rings from the pillars (candidates: digest #2 from bot-discovery data; homepage table weight; watchlist for ShortSupply; Tranco weekly refresh automation)
- [x] CC-7: **panel coverage ledger** — /health/ page (nav: Coverage) publishing the denominator behind every stat: 650/1,000 readable on 2026-08-25, all 350 unreadable domains listed by outcome with plain-English meanings; homepage gains a "hide the sites we can't read" filter + a coverage sentence; crawl.js now records *why* a fetch failed (dns/timeout/refused/reset/tls/other) so tomorrow's ledger splits "domain isn't a website" from "site timed out". Turns the panel's weakest-looking number into a transparency asset before launch — done 2026-08-25 ops session
- [x] CC-8: homepage weight — index + category matrix cells are now styled `<td class="s ...">` instead of `<td><span class="chip">`, the inherited-from-`*` asterisk is a CSS `::after` instead of a `<sup title>`, and the 1,000 duplicate `data-d` attributes are gone (app.js resolves a star's domain from its parent row). Homepage **23,388 → 14,122 elements (−40%)**, 873KB → 566KB raw. All 7,000 cells re-verified against latest.json (0 mismatches, 2,266 inherited markers exactly preserved); watchlist + all four filters re-tested headless against the real generated rows — done 2026-08-26 ops session
- [x] CC-9: coverage follow-through — /health/'s single "no HTTPS response" bucket is split on recorded evidence into **domain does not resolve (172)** and **host answered nothing (72)**; the 172 no-DNS rows are visually demoted in the index (greyed + a CSS-only "NO DNS" marker) while staying listed, counted and starrable. Outcome table sums to 1,000 and the by-name lists sum to 348 = the unreadable count; npr.org (timeout) is correctly separated from 1rx.io (no DNS) — done 2026-08-27 ops session
- [x] SS-5: ShortSupply watchlist — star any drug (index + drug pages), localStorage, "only watched ★" filter; parity with CC-5 and the same free tier under future alerts. `assets/app.js` gains the CC-5 star engine keyed on the lowercased drug name; `page()` now ships `app.js` on every page so drug-page heroes work; 238/238 drug pages carry a hero star whose key matches a real index row, 0 mismatches; 17/17 headless behaviour checks — done 2026-08-28 ops session
- [x] CC-11: **false-flip suppression** — un.org was publishing a fabricated "reopened to all 32 AI crawlers" flip on any day its apex 404'd, because a 404 on the bare domain broke out of the fetch loop before trying www (which serves a restrictive robots.txt every time); 66 of the changelog's 136 entries were this one artifact. Root cause fixed in crawl.js (404 → continue), diffs are no longer emitted across an ok/no-robots fetch transition, and llms.txt probes now record `llmsFetch: "unknown"` instead of guessing false (shein.com's real 64KB llms.txt was "vanishing" and "returning" on alternating days). changelog.json regenerated from the append-only snapshots via new scripts/rebuild-changelog.js: 136 → 68 entries, all four genuine stories intact — done 2026-08-29 ops session
- [x] BOTH-2 (Canicrawl half): **"State of the Agent Web #2" live at /digest/2/** — lead is the discovery radar, but stronger than planned: sites name AI agents with almost no public footprint (FirecrawlAgent on 22 *independent operators*, the dataset name Ai2Bot-Dolma on 26, MyCentralAIScraperBot on 8 incl. LinkedIn/CNN/NYT) — blocklists spread by copying faster than the crawlers get documented. Adds an operator-count caveat that corrected a draft claim (Grok-DeepSearch: 15 sites but only **2** operators — 13 are Amazon regionals); decomposes the newest-bots-least-blocked finding into 52 default-deny sites vs. explicit choices (GrokBot 66 blocks, only 16 named); and publishes the CC-11 correction in full. Data-only change to `data/digests.json`. Verified: 1,064 pages, page contains every load-bearing claim, **14/14 internal links resolve**, stats recomputed with build.js's own definitions and matched to the rendered pages (32%, 108, GrokBot 16 named), discovery counts re-derived by grepping `data/robots/` — done 2026-08-30 ops session. *ShortSupply digest #1 still gated on ≥1 week of changelog (due 2026-09-02).*
- [ ] CC-10: Tranco weekly refresh automation — a script that pulls the current top list, adds newcomers via `crawl.js --new-only`, journals the panel delta; run from the Monday ops session
- [ ] BOTH-2 (ShortSupply half): digest #1 for ShortSupply, due once its changelog reaches a week (2026-09-02). Recompute the lead then — the quiet-revision rate has softened from ~26/day to ~18/day, so the founding claim needs restating from the data rather than carrying over
- [ ] CC-12: llms.txt receipt for oversized files — `crawl.js` archives a fetched llms.txt only below 256KB, so 108 sites read `llmstxt: true` while only 102 have an archived body (unity3d.com is one). Under CC-11's own principle every `true` should have a receipt: record a hash + byte count for the oversized ones instead of nothing. Small, data-integrity only; do not raise the archive cap
- (ops sessions append new rings here as pillars dictate)

## Cadence summary
| When | What | Who |
|---|---|---|
| 06:17/06:47 UTC daily | crawl→diff→deploy | GitHub cloud (no machine needed) |
| Daily 8:00 AM (machine on) | ops session: verify, fix, one ring, journal | Claude scheduled task |
| Overnight (when user starts /loop) | ring marathon | Claude loop |
| Launch days | approve posts, buy domains | User |
