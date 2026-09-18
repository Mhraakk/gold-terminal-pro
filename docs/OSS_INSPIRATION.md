# OSS inspiration (daily digest)

Reference table for open-source projects considered for **gold-terminal-pro**. Prefer dependency or copy-paste only where noted. Do **not** vendor AGPL jewellery ERP apps into this repo.

| Project | Use for | License / note | Link | Action |
|---------|---------|----------------|------|--------|
| tradingview/lightweight-charts | Candlestick / terminal charts | Apache-2.0; already in `package.json`; module at `src/components/candle-chart.tsx` | https://github.com/tradingview/lightweight-charts | dependency |
| bymilon/strata-pro-crypto-ui | Crypto terminal UI patterns | MIT | https://github.com/bymilon/strata-pro-crypto-ui | inspiration-only |
| Hitheshkaranth/OpenTerminalUI | Open terminal UI layout ideas | MIT (path verified) | https://github.com/Hitheshkaranth/OpenTerminalUI | inspiration-only |
| jsdevspace/Minimal-Crypto-Dashboard | Minimal dashboard density | Unspecified / check before copy | https://github.com/jsdevspace/Minimal-Crypto-Dashboard | inspiration-only |
| farsi-ui/ui | Persian / RTL primitives | Check repo license; copy patterns into `src/components/ui` | https://github.com/farsi-ui/ui | copy-paste |
| persianlabs/ui | Persian / RTL components | Check repo license; selective copy | https://github.com/persianlabs/ui | copy-paste |
| QuarkComponent/rad-ui | Radix-style headless ideas | Check repo license | https://github.com/QuarkComponent/rad-ui | inspiration-only |
| shadcn RTL changelog | Official RTL / logical props guidance | Docs | https://ui.shadcn.com/docs/changelog/2026-01-rtl | inspiration-only |

## Explicit non-goals

- Do **not** install strata / OpenTerminalUI / jewellery apps as npm dependencies.
- Do **not** vendor AGPL jewellery ERPs (e.g. CaratFlow and similar) into this repository.
- Chart work via Lightweight Charts is **done** — do not rewrite `candle-chart.tsx` without a product reason.

See also: [`RTL_UI.md`](./RTL_UI.md).
