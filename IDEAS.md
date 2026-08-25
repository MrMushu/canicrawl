# Feature & growth backlog

Parked ideas; promote to ROADMAP.md when chosen. (Historical note: pre-pivot essay-site backlog lives in git history at commit 56d5a6f.)

## Detection depth
- CDN-layer bot blocking: send a HEAD request as a normal fetch vs known-bot UA and compare status codes? Careful — stay on the honest side; only ever to document *publicly declared* behavior. Needs an ethics pass before building.
- ai.txt / other emerging policy files (track adoption of each proposed standard)
- ToS text scan for AI/training clauses (fetch /terms, look for key phrases; cite exact clause)
- Paywall + AI-deal cross-reference: which publishers signed AI licensing deals vs their robots.txt posture (public news sources only) — juicy editorial angle
- Track Cloudflare "pay per crawl" adoption signals

## Product
- Compare view: two sites side by side; "category report card" (news vs ecommerce block rates)
- Embeddable SVG badges: "✓ agent-friendly — canicrawl" for site owners (free = distribution loop)
- Watchlists + email alerts (M6, Supabase)
- Public API changelog + OpenAPI spec
- "Wayback for robots.txt": store raw file per snapshot, diff viewer per site
- Weekly digest auto-draft from diffs, polished each session

## Coverage
- Tranco top-10k ingestion with sampling tiers (top-1k daily, next 9k weekly)
- International panels: EU news sites, CJK commerce, government portals by country
- AI companies' own sites: who do the AI labs block? (delicious recursive stat)

## Marketing
- Annual "State of the Agent Web" PDF report (sponsorable)
- Auto-generated OG images per site page (the chart IS the share card)
- Milestone posts: "6 months of data: N policy flips tracked"
