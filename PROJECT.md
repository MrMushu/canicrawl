# Canicrawl
*The living map of where AI agents are welcome on the web.*

Like caniuse.com, but for AI access: look up any major website and see — updated daily — which AI crawlers and agents it allows or blocks (GPTBot, ClaudeBot, PerplexityBot, and a dozen more), whether it publishes an `llms.txt`, and the full history of when its policy changed.

## Why this exists
The AI-vs-publishers access war is the live story of the 2026 web (~45% of prominent sites block at least one AI crawler), but every analysis out there is a one-off blog post. Nobody runs the living, queryable tracker of record. The demand signal is all those articles; the product is the missing canonical source. Chosen 2026-08-24 after a research pass killed three competing candidates (subscription-price tracker, ticket-price tracker, AI changelog — all occupied).

## The moat
Time. Anyone can fetch today's robots.txt; nobody can recreate the time series of when each site flipped its policy. Every day the crawler runs, the dataset becomes more irreplaceable. Started 2026-08-24.

## Who uses it
1. **Journalists & researchers** — the citable chart for every "publishers are blocking AI" story. Free site = distribution engine.
2. **Agent & AI developers** — "will my bot get blocked on these sites?" JSON API + change alerts.
3. **AI agents themselves** — machine-readable API + llms.txt; an agent can check where it's welcome before visiting.
4. **Site owners & merchants** — "what are my peers doing?" and, as agentic commerce grows, "can AI assistants actually use my store?"

## Monetization ladder (later, in order)
Free site + API (build the citation habit) → paid change-alert subscriptions & higher-volume API for agent devs → agent-readiness audits for merchants → sponsored "State of the Agent Web" reports. Nothing paywalled until the free layer has gravity.

## Principles
1. **Be the primary source.** Every number reproducible from committed snapshots; methodology public.
2. **Honest crawling.** We fetch only robots.txt and llms.txt — public policy files that exist to be read — with an identifying user agent, one polite pass per day.
3. **Zero dependencies.** Crawler, site generator, and server are hand-rolled Node (no npm installs). Durable across sessions, nothing to rot.
4. **Fast, quiet, credible design.** Data-forward, light/dark, no tracking, no cookies.
5. **We practice what we index.** Our own robots.txt welcomes all bots; we publish llms.txt and a free JSON API.
6. **Grown in public.** Append-only JOURNAL.md; the site changelog doubles as proof of freshness.

## Stack & layout
```
data/domains.json        tracked domains (curated, categorized)
data/bots.json           tracked AI user agents (operator, purpose)
data/snapshots/*.json    daily crawl snapshots (committed = history in git)
data/latest.json         most recent snapshot
scripts/crawl.js         daily crawler (Node, no deps)
scripts/build.js         static site generator → dist/
scripts/serve.js         local preview server
.github/workflows/       daily crawl + build + deploy to GitHub Pages
dist/                    generated site (gitignored; built in CI)
```
Hosting: GitHub Pages. Backend: none yet (static JSON is the v0 API); Supabase when alerts/accounts arrive.

## Naming
"Canicrawl" = can-I-crawl, echoing caniuse.com — instantly legible to the developer audience. Working title; final check before domain purchase (user's call on buying one; GitHub Pages URL until then).
