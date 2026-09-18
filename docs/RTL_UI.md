# Farsi / RTL UI adoption

Short guide for Persian RTL in gold-terminal-pro.

## Root document

`src/routes/__root.tsx` already sets `lang="fa"` and `dir="rtl"` on `<html>`. Keep that; do not flip to LTR for the shell.

## Fonts

- Google Fonts link in `__root.tsx` loads **Vazirmatn** (primary FA UI) alongside **Noto Naskh Arabic**.
- Theme token `--font-fa` in `src/styles-fa.css` drives `body` (`font-family: var(--font-fa)`).
- Mono / display stacks stay on IBM Plex / Newsreader for the terminal aesthetic.

## Components

- Expand `src/components/ui/` with Radix + `cn` (see `input`, `card`, `dialog`, `sheet`, …).
- Prefer **logical** properties (`start`/`end`, `ps`/`pe`, `ms`/`me`) over hard-coded `left`/`right`.
- Pull patterns from [farsi-ui/ui](https://github.com/farsi-ui/ui) and [persianlabs/ui](https://github.com/persianlabs/ui); adapt to gold theme (sharp corners, gold stroke).
- Official shadcn RTL notes: https://ui.shadcn.com/docs/changelog/2026-01-rtl

## Do not

- Replace the terminal chrome with a full jewellery ERP UI.
- Add AGPL apps as dependencies.
