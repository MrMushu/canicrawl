# Roadmap

**Current phase: M1 — founding build.**

## M1 — Founding build (2026-08-24 session) ✅
- [x] Repot project docs + memory around Canicrawl
- [x] Curated domain list (232 recognizable sites, 17 categories)
- [x] AI bot registry (16 user agents with operator/purpose metadata)
- [x] Crawler: robots.txt fetch + RFC 9309 parse + llms.txt detection (scripts/crawl.js)
- [x] First real crawl — founding snapshot 2026-08-25 (UTC) committed
- [x] Static site generator: 256 pages — home (searchable table), 232 site pages, 16 bot pages, stats w/ SVG chart + Dataset JSON-LD, changelog, about/methodology, API docs (scripts/build.js)
- [x] Our own robots.txt (welcoming) + llms.txt + static JSON API (latest.json + per-site JSON)
- [x] Local preview verified in browser (home, site page, stats, bot page, all endpoints 200)
- [x] GitHub Actions workflow ready (.github/workflows/daily.yml: daily crawl → commit snapshot → rebuild → deploy)

## M2 — Deploy ✅ (2026-08-24/25 session — SITE IS LIVE at https://canicrawl.com)
- [x] Custom domain: user bought **canicrawl.com** (Cloudflare). Build emits CNAME; SITE_ORIGIN defaults to https://canicrawl.com
- [x] Repo: github.com/MrMushu/canicrawl (created via user's browser session; gh CLI was never installed — pushes use a repo-scoped write **deploy key** at ~/.ssh/canicrawl_deploy, wired via core.sshCommand)
- [x] Pages enabled (Source: GitHub Actions); first deploy succeeded on rerun (initial run raced Pages enablement)
- [x] DNS: CNAME @ → mrmushu.github.io + CNAME www → mrmushu.github.io, both DNS-only (gray cloud)
- [x] Custom domain saved in Pages settings; site serving 200 at http://canicrawl.com
- [x] HTTPS: cert issued within minutes; Enforce HTTPS enabled — https://canicrawl.com is canonical
- [ ] Verify tomorrow's 06:17 UTC cron ran unattended (check Actions + a new data/snapshots/ file)
- [ ] sitemap.xml submitted to Google Search Console (user account)
- [ ] Note: Cloudflare zones now ship "AI Crawl Control" + "Agent Readiness" panels — infra layer entering the space; keep our positioning independent/cross-provider/historical

## M3 — Launch (needs user: per-post approvals)
- [ ] Execute MARKETING.md kit: Show HN, Reddit (user's account, per-post OK), X/Bluesky drafts
- [ ] "Cite us" press kit live; outreach list of outlets covering AI-publisher wars
- [ ] Submit to relevant directories/newsletters

## M4 — Diff engine & changelog (the retention feature)
- [ ] Snapshot differ: detect policy flips between crawls
- [ ] Changelog page becomes a live feed ("nytimes.com blocked Claude-SearchBot yesterday")
- [ ] RSS feed of policy changes
- [ ] Weekly "State of the Agent Web" digest page (written each session)

## M5 — Scale & depth
- [ ] Coverage top-1k → top-10k domains (Tranco list ingestion)
- [ ] Cloudflare/CDN bot-challenge detection (does the site block at the network layer?)
- [ ] AI-clause detection in ToS pages
- [ ] Per-category dashboards (news vs ecommerce vs gov)

## M6 — Monetization
- [ ] Email change-alerts (free tier → paid watchlists) — needs Supabase
- [ ] Versioned API with keys + rate limits; paid tier for volume
- [ ] Agent-readiness audit offering for merchants
- [ ] Sponsorship slot on stats page / digest

## Cadence
One growth ring per session, always journaled: expand coverage, improve detection, write the digest, or advance the current milestone.
