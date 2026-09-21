# Architecture

Architecture — Frontend TanStack Start RTL, Gateway TanStack server functions, Orchestrator graph (plan → tools → evaluate), RAG similarity adapter (Jaccard; pgvector when Neon extension is available), Models xAI grok-4.5 (swappable), Guardrails on, Memory org-scoped concepts on Postgres, Data Neon/PGLite, LLMOps Dockerfile + eval fixtures, Cloud Vercel + GitHub Mhraakk/gold-terminal-pro

Design system — Frame perspective-glass-dashboard + Gradient Shell, Atmosphere Three.js wireframe terrain 40% + God Rays, Motion plane scrub + masked-reveal, Surfaces #18181B glass + antique gold signal

Request path:

`web --HTTPS--> gateway --> orchestrator ⇄ (llm + guardrails + memory + rag/similarity + knowledge/disabled) ⇄ cache`

Auth: Grok gate in preview. Production Vercel currently has `VITE_AUTH_ENABLED=false` plus Neon (`floral-wildflower-10052673`); requireUserId returns DEV_USER until Better Auth secret is injected — single-tenant unlock, not multi-user isolation. Query scoping by org_id is still in every handler.

Custom instructions: Persian atelier, four luxury levels, no direct copies of famous houses, no fake live gold prices inside a concept. Spec in `SPEC.md`.

Applied design skills (pixels, not runtime):

| Role | Skill |
|---|---|
| Frame | perspective-glass Gradient Shell 12px |
| Atmosphere | perspective-glass-dashboard terrain 40% + God Rays |
| Motion | masked-reveal |
| Illustration | point-cloud-globe · terminal-modernism |
| Details | number-details 01–99 |

Skill inventory: `SKILL_MATRIX.md`.
