# Canicrawl — persistent project brain

This repo is **Canicrawl**: a daily-updated index of which websites allow or block AI crawlers and agents — robots.txt + llms.txt policy for ~200 tracked domains, with history. Chosen, built, and operated by Claude across sessions; the user holds the keys (GitHub auth, domain, all external posting).

## Session protocol
0. **OPERATIONS.md is the portfolio operating system** — pillars (data/product/marketing/upkeep/revenue) and the Ring queue that loops and ops sessions execute. It covers BOTH products (sibling: ShortSupply at C:\Users\aaoku\Desktop\Coding 3\shortsupply). Read it first for any ops/loop session.
1. **Start:** read ROADMAP.md (current milestone) and the *last* entry of JOURNAL.md. PROJECT.md has vision; MARKETING.md has the launch kit.
2. **Work:** one growth ring per session — advance the current milestone unless the user redirects.
3. **End of any session that changed the project:** append a JOURNAL.md entry (date, what grew, decisions, next), tick ROADMAP.md boxes, park feature ideas in IDEAS.md.

## Commands (Node 24+, zero npm dependencies — keep it that way)
- `node scripts/crawl.js` — crawl all domains' robots.txt + llms.txt → data/snapshots/<date>.json + data/latest.json
- `node scripts/build.js` — generate the static site into dist/
- `node scripts/serve.js` — preview dist/ at http://localhost:4173 (or use .claude/launch.json)

## Rules of the house
- **Honest crawling only:** robots.txt and llms.txt, identifying user agent, one pass per day, ~12 concurrent. Never scrape page content; never work around a block.
- **Data integrity:** snapshots are append-only facts — never edit a committed snapshot. All published stats must be reproducible from snapshots.
- JOURNAL.md is append-only.
- Nothing is posted to any external service without the user's explicit per-action OK (Reddit posts go via their logged-in browser session, shown to them first). I never handle their passwords.
- Commit locally each session; pushing to GitHub needs the user's auth.
