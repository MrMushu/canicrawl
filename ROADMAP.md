# Roadmap

**Current phase: M1 — founding build.**

## M1 — Founding build (2026-08-24 session)
- [ ] Repot project docs + memory around Canicrawl
- [ ] Curated domain list (~200 recognizable sites, categorized)
- [ ] AI bot registry (~16 user agents with operator/purpose metadata)
- [ ] Crawler: robots.txt fetch + RFC 9309 parse + llms.txt detection
- [ ] First real crawl — founding snapshot committed
- [ ] Static site generator: home (searchable table), per-site pages, per-bot pages, stats, changelog, about/methodology, API docs
- [ ] Our own robots.txt (welcoming) + llms.txt + static JSON API
- [ ] Local preview verified in browser
- [ ] GitHub Actions workflow ready (daily crawl → rebuild → deploy)

## M2 — Deploy (needs user: one-time GitHub auth)
- [ ] Create GitHub repo, push, enable Pages + Actions
- [ ] Verify daily cron runs unattended
- [ ] sitemap.xml submitted to Google Search Console (user account)
- [ ] Decide on custom domain (user's call; Pages URL fine to start)

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
