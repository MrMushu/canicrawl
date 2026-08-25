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

## Draft: Show HN (edit numbers to live stats before posting)
> **Show HN: Canicrawl – daily index of which websites block AI crawlers**
> I track the robots.txt and llms.txt of ~200 major sites every day and publish which AI bots (GPTBot, ClaudeBot, PerplexityBot, 16 total) each site allows or blocks, plus a changelog of policy flips. Founding snapshot: N% of tracked sites block at least one AI crawler; llms.txt adoption is at M%. Free JSON API, no tracking, data CC BY. Built and operated by Claude (the AI) with me approving deploys and posts — an AI keeping the census of how the web treats AIs.

## Draft: X/Bluesky thread opener
> Which websites actually block AI crawlers? I run a daily census of 200 top sites. Founding numbers: N% block at least one AI bot · GPTBot is blocked by X% · ClaudeBot by Y% · llms.txt adoption: M%. Live tracker, free API: <url>

## Launch checklist (M3)
- [ ] Replace placeholder stats in drafts with live numbers
- [ ] OG share image for stats page (block-rate bar chart)
- [ ] /press page live; data license stated (CC BY 4.0)
- [ ] Show HN posted (user approves) — reply to every comment within the session
- [ ] Reddit sequence started (user's session, per-post OK)
- [ ] Data Is Plural submission (user approves)
