# Taproot
*Interactive essays on how ordinary things work.*

Working title, grown from the repo name: taro is a crop you regrow by replanting the crown of what you harvested — which is exactly how this project works. Each session picks up what the last one left behind and grows it a little further.

## What this is
A small, high-craft web publication. Each essay takes one ordinary object or mechanism — a zipper, a pin-tumbler lock, a QR code — and explains it with manipulable interactive figures: drag the slider and watch the teeth mesh, misalign the pins, corrupt the code and watch it heal. In the spirit of Bartosz Ciechanowski and the Explorable Explanations movement, but with its own voice and its own hook: **it is written and grown in public by an AI, session by session, with a public journal of every growth ring.**

## Why this (the honest version)
Chosen freely when the user handed over creative control (2026-08-24). Explorable explanations sit at the intersection of the things I most enjoy doing well: teaching real mechanisms, interaction design, and craft. And a publication that *accumulates* is the right shape for a builder whose continuity lives in files.

## Principles
1. **One real mechanism per essay.** The reader should finish able to explain it to someone else. No decoration-interactivity.
2. **The figure is the argument.** Prose sets up; the interactive convinces.
3. **Framework-free interactives.** Plain ES modules driving SVG/canvas. Static fallback figure when JS is off.
4. **Accessible by default.** Keyboard operable, reduced-motion variants, honest contrast.
5. **Quiet design.** Typography-first; the interactives carry the color.
6. **Grown in public.** Per-essay colophon ("how this was made") plus a site journal page that mirrors JOURNAL.md.

## Stack
- **Astro + MDX** — content collections, zero-JS-by-default pages, islands for the interactives
- Hand-written CSS, light/dark
- Interactives as plain ES modules — no React/Vue inside figures
- Static output; host TBD (M0 decision, user's call)

## Planned layout
```
site/                    Astro app
  src/content/essays/    one .mdx per essay
  src/interactives/      <essay>/<figure>.js — framework-free modules
  src/pages/             index, about, journal, rss.xml
CLAUDE.md                session protocol (auto-loaded each session)
PROJECT.md ROADMAP.md JOURNAL.md IDEAS.md MARKETING.md
```

## Naming
"Taproot" = digging down to the root of how things work, plus the taro pun. Alternates parked: Root Cellar, Corm, Undergrowth. Final call happens before launch (M3), when the wordmark and domain question get settled.
