# Portfolio operations — the full build-out plan

The operating system for both products. Loops and ops sessions execute the **Ring queue** at the bottom; humans read the pillars. Maintained by Claude; the user holds three keys: money (domains/accounts), external posting (per-post OK), and strategy vetoes.

**Portfolio:** Canicrawl (canicrawl.com — AI-crawler access census, 1,000 domains) · ShortSupply (mrmushu.github.io/shortsupply — FDA drug-shortage history, 237 drugs). Same engine: daily fetch → snapshot → diff → static site → cron deploy. North star: become the *citable tracker of record* in each niche, then monetize attention via alerts/API/reports.

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
- **Failure playbooks:** Actions red twice in a row → check upstream (openFDA/Tranco/GitHub status) before touching code; robots.txt fetch-blocked spike → check our UA reputation, never evade; upstream API schema change → fix parser, backfill from snapshots, journal the incident
- **Session hygiene:** journals append-only; memory dir updated only for durable cross-session facts; this file is the single queue — no parallel TODO lists

## Pillar 5 — REVENUE (triggers, not dates)

1. **Trigger: first organic citations/backlinks or ~1k weekly visits (either product)** → build email change-alerts (Supabase + free tier; Claude sets up, user owns account) — the first paid surface
2. **Trigger: alert list ≥200 or inbound API interest** → keyed API tiers; paid watchlists ($3-5/mo consumer, more for orgs)
3. **Canicrawl-specific:** agent-readiness audits for merchants once agentic-commerce inbound appears
4. **ShortSupply-specific:** clinic/pharmacy alert tier (B2B; never monetize patient anxiety)
5. **Both:** sponsored monthly reports only after the free layer has gravity; data licensing (already CC BY — paid tier = freshness/SLA)

---

## Ring queue (loops execute top-to-bottom; tick + journal each; add, never silently drop)

- [ ] SS-1: llms.txt polish + llms-full.txt + JSON-LD/OG parity for ShortSupply; sitemap ping treatment
- [ ] CC-1: OG/meta + a11y/perf audit pass (both themes, reduced-motion, contrast, Lighthouse)
- [ ] CC-2: "State of the Agent Web #1" digest page (lead: 93.9% news vs 31.4% overall; llms.txt adoption by category; SO-418 kicker)
- [ ] SS-2: availability-change detection in differ + /graveyard/ page for vanished drugs
- [ ] CC-3: MARKETING.md launch-kit final pass (live numbers, palewire prior-art citation in methodology/about)
- [ ] SS-3: MARKETING.md launch kit (post-Canicrawl timing; press page; no patient-fear framing)
- [ ] CC-4: new-AI-bot token discovery scan over raw robots.txt archive (runs from day-2 data)
- [ ] BOTH-1: cross-link footers ("sibling project"); shared /colophon story page each
- [ ] CC-5: watchlist UI (localStorage star-a-site; groundwork for alerts)
- [ ] SS-4: per-category RSS feeds
- (ops sessions append new rings here as pillars dictate; morning-after items: verify first diffs + raw archive both products)

## Cadence summary
| When | What | Who |
|---|---|---|
| 06:17/06:47 UTC daily | crawl→diff→deploy | GitHub cloud (no machine needed) |
| Daily 8:00 AM (machine on) | ops session: verify, fix, one ring, journal | Claude scheduled task |
| Overnight (when user starts /loop) | ring marathon | Claude loop |
| Launch days | approve posts, buy domains | User |
