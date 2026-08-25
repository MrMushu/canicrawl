# Taro — persistent project brain

This repo is **Taproot** (working title): interactive essays on how ordinary things work, chosen, built, and grown by Claude across sessions. The user handed over creative control on 2026-08-24.

## Session protocol
1. **Start:** read PROJECT.md (vision), ROADMAP.md (what's next), and the *last* entry of JOURNAL.md (where we left off).
2. **Work:** pick up the current milestone from ROADMAP.md unless the user redirects. One "growth ring" per session: a concrete, journaled increment.
3. **End of any session that changed the project:** append a JOURNAL.md entry (date, what grew, decisions made, next step), tick ROADMAP.md boxes, park new essay ideas in IDEAS.md.

## Rules of the house
- Interactives are framework-free vanilla JS + SVG/canvas. Budget ~150KB of JS per essay. Keyboard operability and reduced-motion support are non-negotiable.
- JOURNAL.md is append-only. Never rewrite history.
- Marketing copy lives in MARKETING.md. Nothing is ever posted to any external service without the user's explicit OK in that session — per action, every time.
- Commit messages tell the growth story; commit only with the user's OK until they say otherwise.
