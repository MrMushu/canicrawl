# Feature & growth backlog

## Sibling-tracker bench (researched 2026-08-24, 10-agent verification pass; build only AFTER Canicrawl launch is cruising)
Same engine, new data source. Verified verdicts, ranked:
1. **ShortSupply — US drug-shortage history.** openFDA shortages endpoint verified live (keyless JSON, 1,628 records, current). Gap proven hard: FDA overwrites status with no history — HHS/NCBI researchers had to rebuild the record from 84 Wayback snapshots. Nobody publishes flip-events, "day N of shortage" counters, or FDA-vs-ASHP discrepancies. Millions of patients affected (ADHD, GLP-1s, chemo). Verdict: contested-but-winnable (Medfinder owns "which pharmacy has it today" — different product). Monetize: clinic/pharmacy/telehealth alerts, not anxious patients. Care: report FDA data, never medical advice.
2. **BreachClock — breach-disclosure behavior tracker.** CA AG CSV verified live (org, breach date, reported date — entries same-day fresh); HHS OCR portal confirmed (needs JSF POST handling). Two products nobody computes: disclosure-lag leaderboard ("X waited 14 months to tell you") and a versioned archive catching silently-revised affected counts. PRC aggregates annually + sells data; a dormant 1-star GitHub attempt proves the idea occurs but never ships. Verdict: contested-but-winnable.
3. **FeeCreep — bank fee-schedule diff tracker.** Verified end-to-end: BofA's public Reg DD fee PDF fetched + parsed cleanly ("Effective August 7, 2026"). No funded incumbent (Cushion died 1/2025); Bankrate/NerdWallet publish annual statics only; CFPB retreat means fees rise unwatched. Best affiliate economics ($100+ bank bounties). Cost: ~75 per-bank PDF adapters + URL churn. Verdict: contested-but-winnable.
- **Killed by verification (do not revisit without new evidence):** CanTheyTrain (AI-training ToS tracker — occupied: TOSTracker tracks AI-training clauses across 44k docs; Terms Watch ships daily OTA-based diffs, current as of Aug 2026; ClausePatrol owns the B2B wedge) and CaseClock (USCIS times — occupied: ImmigrationTimes.org has 4.4 years of daily history + open datasets; USCIS blocks datacenter IPs since 2/2025).

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
