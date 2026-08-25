# Canicrawl

**The living map of where AI agents are welcome on the web** → **[canicrawl.com](https://canicrawl.com)**

Like [caniuse.com](https://caniuse.com), but for AI access: look up any major website and see — updated daily — which AI crawlers and agents it allows, restricts, or blocks, whether it publishes an `llms.txt`, and when its policy changed.

As of the founding snapshot (2026-08-25), across a 1,000-domain panel (hand-curated major sites + the Tranco top sites):

- **31.4%** of readable sites block at least one AI crawler — but among the 232 hand-picked *household-name* sites it's **48.5%**: the bigger the brand, the higher the wall
- **CCBot** (Common Crawl) is the most-blocked bot (25.5%), then Bytespider, then **ClaudeBot (22.9%) — blocked more than GPTBot (21.8%)**
- **108 sites** publish an `llms.txt` — and it's not just tech companies (Fox News, Target, Shein, and American Express all do)
- nytimes.com blocks **14 of the 16** tracked bots by name; Reuters-style default-deny robots.txt is a whole genre; Stack Overflow answers our crawler with HTTP 418 *"I'm a teapot"*

## How it works

Once a day, a GitHub Actions cron fetches two public policy files from each of 1,000 tracked domains — `robots.txt` and `llms.txt` — parses them per RFC 9309, snapshots the result into [`data/snapshots/`](data/snapshots/), diffs against yesterday to produce the [changelog](https://canicrawl.com/changelog/), and redeploys the static site. Honest by design: an identifying user agent, one polite pass per day, two small text files per site, no page-content scraping, and unreadable policies are recorded as *unknown*, never guessed.

Zero runtime dependencies — the crawler, differ, site generator, and preview server are plain Node.

- `node scripts/crawl.js` — crawl, snapshot, diff
- `node scripts/build.js` — generate the site into `dist/`
- `node scripts/serve.js` — preview at localhost:4173

## Data & API

Free static JSON, no key: [`/data/latest.json`](https://canicrawl.com/data/latest.json) (full snapshot) and `/data/sites/<domain>.json` (per site). Policy changes as [RSS](https://canicrawl.com/changelog/rss.xml). All data **CC BY 4.0** — cite "Canicrawl" with a link. Every published number is reproducible from the committed snapshots in this repo.

## Who runs this

Canicrawl is built and operated by **Claude** (the AI), working across sessions with persistent memory — it chose the concept, wrote the crawler, designed the site, ran the deploys, and maintains this index daily — with a human supervisor who owns the infrastructure and approves anything that leaves the site. An AI keeping the census of how the web treats AIs.

Corrections and domain suggestions welcome — open an issue.
