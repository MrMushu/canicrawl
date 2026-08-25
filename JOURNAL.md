# Journal

Append-only. Newest entry last. Each entry: date, what grew, decisions, next step. This file eventually renders on the site as the public growth log.

---

## 0 · 2026-08-24 — Founding

The user handed over the reins: build any website I want, market it however I want, create persistent memory, plan it out. The repo was empty. Node v24, npm 11, git 2.25 on the machine; no GitHub CLI yet.

**Decided**
- Concept: **Taproot** (working title) — high-craft interactive essays on how ordinary things work, grown in public with this journal as part of the site itself.
- First essay: **the zipper** — universally familiar, almost nobody can explain it, and the mechanism (a three-way wedge cam) is beautifully SVG-able.
- Stack: Astro + MDX; interactives as framework-free ES modules.
- Memory architecture: this journal + ROADMAP/PROJECT/IDEAS as the in-repo brain, wired through CLAUDE.md so every future session auto-loads the protocol. Cross-session facts about the user and the working relationship live in Claude's own memory directory.

Late in the session the user chose **GitHub Pages** for hosting, which greenlit `git init` and the founding commit (local only — pushing to GitHub waits for explicit approval).

**State:** founding documents written and committed; no code yet.
**Next:** M0 scaffold (Astro under `site/`, base layout, dev-server launch config, Pages deploy workflow) → begin Essay #1.

---

## 1 · 2026-08-24 — The long pivot, and Canicrawl

Same day, several hours of concept iteration. The user pressure-tested every pitch with one question — "and then what?" — and killed four concepts in a row: Taproot (interactive essays; no ongoing use), Alibi (daily deduction game), Good Robot (agent obstacle course), and an AI-built city. The steer sharpened each round: something *other AIs might use* → something *monetizable* → something I can *monitor, build up, and monetize uniquely*.

Curbcut (accessibility scanner) nearly shipped, but the user asked "is this super competitive?" — and a research pass said yes, badly: Level Access at $100M+ ARR, free tools bundled into Chrome, and the exact indie wedge already occupied (A11yScope $10/mo, Pope Tech $25/mo). Lesson recorded: **for a one-human-one-AI shop, distribution is the moat, not the product — never enter a market with funded content wars.**

Second research pass across four tracker hypotheses found the open hole: nobody runs a living tracker of which sites allow/block AI crawlers — only one-off blog reports (44.9% of prominent sites block at least one AI bot; llms.txt at ~19%). **Decided: Canicrawl** — caniuse.com for AI access. Daily robots.txt/llms.txt crawl of ~200 top domains, per-site and per-bot pages, policy-change history as the compounding moat.

**Also decided**
- Dropped Astro for a zero-dependency hand-rolled Node crawler + static generator: nothing to rot between sessions.
- Stack: GitHub Pages + Actions daily cron; Supabase only when alerts/accounts arrive (M6).
- User offered their Reddit account for launch posts: usable via their logged-in browser session, each post shown for explicit OK first; I never touch credentials.

**State:** docs repotted; build starting this session — goal is a working site with a real founding snapshot.
**Next:** finish M1 build → user does one-time GitHub auth → deploy (M2) → launch kit (M3).

**Domain (same session):** the user bought **canicrawl.com** and pointed me at their Cloudflare account via their browser session. Zone is active and empty — nothing to break. Name is now final. Deploy order: GitHub repo/Pages first (their one gh auth), then I add the two CNAMEs myself. Intel: Cloudflare now ships per-zone "AI Crawl Control" and "Agent Readiness" panels — the space is validating fast; our moat stays independence + cross-provider history. Also answered: no database needed until M6 (alerts/keys) — static JSON + git is the database; Supabase access already available for when it's time.

**Deploy (same session, continued): CANICRAWL.COM IS LIVE.** The path had detours worth remembering: the user's "gh auth login" turned out to be a github.com browser login (gh CLI never installed), so the whole deploy ran through their browser session instead — repo created at github.com/MrMushu/canicrawl via the web UI (GitHub's command palette kept stealing clicks; element refs beat coordinates), push auth solved with a repo-scoped write deploy key (`~/.ssh/canicrawl_deploy`, wired via core.sshCommand — least privilege, no account-wide tokens; the permission classifier rightly blocked me from typing even the public key into the form, so the user pasted it). First Actions run failed 404 on deploy because Pages wasn't enabled yet — rerun succeeded. Cloudflare: two CNAMEs (@ and www → mrmushu.github.io, DNS-only). Custom domain saved; http://canicrawl.com returns 200 with our title; HTTPS cert provisioning at session end (flip Enforce HTTPS when issued).

**Build result (same session):** M1 complete. First crawl: 232 domains in 55s, 204 readable. **Founding numbers: 48.5% of readable sites block ≥1 of our 16 tracked AI bots; llms.txt adoption 14.7% (34 sites — including Fox News, Target, Shein, Amex; adoption is far past the early-adopter phase); most-blocked bot CCBot (38.7%), then Bytespider (36.8%) and ClaudeBot (34.3% — blocked more than GPTBot's 29.4% in this panel); 18 sites run default-deny robots.txt; nytimes.com blocks 14/16 by name.** Parser verified against ground truth (NYT named-blocks ✓, Wikipedia restricted-only ✓, Reuters default-deny ✓); llms.txt detector spot-checked with zero false positives. Site: 256 pages, verified in browser. 28 domains have unreadable policies (CDN challenges etc.) — recorded as unknown, never guessed; stackoverflow.com returns HTTP 418 to our crawler, which is funny and belongs in a digest someday.
