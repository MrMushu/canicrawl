# Marketing brief — Canicrawl

## Positioning
**The tracker of record for AI access to the web.** Every "publishers are blocking AI" story needs a chart; we are the chart. Every agent developer wonders "will my bot get blocked?"; we are the lookup.

Secondary hook, used honestly: the index is operated by an AI (Claude) on a daily schedule, with a human holding the keys — an AI monitoring how the web treats AIs. Press loves recursion.

## Rules (non-negotiable)
- Nothing posted anywhere without the user's explicit per-action OK, in the session it happens.
- Reddit: via the user's logged-in browser session only; the exact post is shown to them first; I never touch credentials. Respect each subreddit's self-promo rules; disclose the AI-built angle plainly.
- No astroturfing, no fake accounts, no engagement bait. The data is the pitch.

## Channels, in firing order
1. **Built-in SEO** (live at deploy, no approvals needed): ~200 per-site pages targeting "does <site> block AI crawlers", 16 per-bot pages targeting "who blocks <bot>", stats page with JSON-LD Dataset markup, sitemap.xml. This compounds while we sleep.
2. **Show HN** (launch day): "Show HN: Canicrawl – a daily-updated index of which sites block AI crawlers". First comment = methodology + the one-human-one-AI story + best stat from the founding snapshot.
3. **Reddit** (user's account, per-post OK): r/SEO, r/TechSEO, r/webdev, r/artificial, r/LocalLLaMA (angle: "which sites your agents can actually visit"). One sub per day, tailored, no copy-paste blast.
4. **X/Bluesky** (drafts below; user posts or approves): the headline-stat thread with the per-bot block-rate chart image.
5. **Directories/newsletters:** Hacker Newsletter, TLDR, Ben's Bites, The Rundown (submit/tip forms), plus explorabl.es-equivalents for data: Data Is Plural (Jeremy Singer-Vine's newsletter takes dataset submissions — perfect fit).
6. **Journalist availability:** a /press page ("cite us, embed the chart, data is CC BY 4.0") — passive but durable. No cold outreach without user OK.

## Draft: Show HN (numbers current as of 2026-08-25; refresh from live /stats/ before posting)
> **Show HN: Canicrawl – daily index of which websites block AI crawlers**
> https://canicrawl.com
> I track the robots.txt and llms.txt of 1,000 top domains (Tranco top sites + hand-curated majors) every day and publish which of 16 AI bots (GPTBot, ClaudeBot, PerplexityBot…) each site allows or blocks, plus a changelog of every policy flip. Founding findings: 31% of the top 1,000 block at least one AI crawler — but among 232 household-name sites it's 49%: the bigger the brand, the higher the wall. CCBot is the most-blocked; ClaudeBot is blocked more than GPTBot; 108 sites already publish an llms.txt, including Fox News, Target, and Amex. Free JSON API, RSS of policy flips, no tracking, data CC BY 4.0, every number reproducible from committed snapshots. Built and operated by Claude (the AI) with me approving deploys and posts — an AI keeping the census of how the web treats AIs.
> *First-comment material: methodology + honest-crawling rules; the Stack Overflow HTTP 418 anecdote; the "default-deny" pattern (18 sites).*

## Draft: X/Bluesky thread opener (refresh numbers before posting)
> Which websites actually block AI crawlers? I run a daily census of 232 top sites. Founding numbers: 48.5% block at least one AI bot · most-blocked: CCBot (38.7%) · ClaudeBot (34.3%) is blocked more than GPTBot (29.4%) · llms.txt adoption: 14.7%. Live tracker, free API + RSS: https://canicrawl.com

## Draft: r/TechSEO / r/SEO (angle: monitoring + llms.txt adoption data; adapt per sub rules)
> **I built a daily tracker of which major sites block AI crawlers (and who's adopted llms.txt)**
> Data points from the founding crawl of 232 major domains: 48.5% block at least one AI bot; llms.txt is at 14.7% adoption and isn't just tech companies anymore (Fox News, Target, Shein, Amex). Every site gets a page showing its exact per-bot policy and history. Free API + RSS of policy flips. Happy to answer methodology questions.

## Overnight rule
Overnight/autonomous sessions may prepare and refresh this kit but never post it. Every external post is shown to the user for an explicit yes, in the session it goes out.

## Launch checklist (M3)
- [ ] Replace placeholder stats in drafts with live numbers
- [ ] OG share image for stats page (block-rate bar chart)
- [ ] /press page live; data license stated (CC BY 4.0)
- [ ] Show HN posted (user approves) — reply to every comment within the session
- [ ] Reddit sequence started (user's session, per-post OK)
- [ ] Data Is Plural submission (user approves)
