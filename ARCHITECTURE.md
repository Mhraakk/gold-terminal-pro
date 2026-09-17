# Architecture

Architecture — Frontend TanStack Start RTL, Gateway TanStack server functions, Orchestrator graph (plan → tools → evaluate), RAG disabled adapter, Models xAI grok-4.5, Guardrails on, Memory short-term localStorage, Data in-memory cache + TGJU / Gold API, LLMOps Dockerfile + eval fixtures, Cloud Vercel

Design system — Frame newsreader-slate-shell (flex, full-bleed, open, 2px radius), Atmosphere nebula-webgl-background (D2), Motion 150ms + masked-reveal, Surfaces elevated #131315 inside 1px white-gradient shell. Type Newsreader 48 + system-sans

Request path:

`web --HTTPS--> gateway --> orchestrator ⇄ (llm + guardrails + memory + rag/disabled + knowledge/disabled) ⇄ cache`

Auth off. Portfolio, alerts, journal and rules are device-local. Quotes are world-readable market data.

Applied design skills (pixels, not runtime):

| Role | Skill |
|---|---|
| Frame | newsreader-slate-shell 2px gradient shell |
| Atmosphere | nebula-webgl-background (D2, one owner) |
| Motion | masked-reveal |
| Illustration | point-cloud-globe · terminal-modernism |
| Details | number-details 01–99 |

Custom instructions from the original Gold Terminal: Persian-only quant, no fake live prices, Tehran gold/FX desk (melted, 18k, coins, USD, XAUUSD), SMC language, Kelly-style setups. Spec in `SPEC.md`.
