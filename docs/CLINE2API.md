# cline2api-workers (Zarin)

Upstream: [pingmike2/cline2api-workers](https://github.com/pingmike2/cline2api-workers)

Turns Cline’s free models into an **OpenAI-compatible** API on Cloudflare Workers (or Vercel Edge).

## Deploy the worker (once)

1. Get a Cline `refreshToken` with the upstream `cline_oauth.py` (or their GitHub Action).
2. Deploy `worker.js` to Cloudflare Workers (or `api/index.js` to Vercel) per upstream README.
3. Set Worker secrets:
   - `CLINE_REFRESH_TOKEN` — from step 1
   - `API_KEY` — e.g. `sk-cline-zarin`
4. Note the public base URL, e.g. `https://cline2api.<subdomain>.workers.dev`

## Wire Zarin

In Vercel / local `.env`:

```bash
CLINE2API_BASE_URL=https://cline2api.<subdomain>.workers.dev
CLINE2API_API_KEY=sk-cline-zarin
CLINE2API_MODEL=cline-free/deepseek-v4.1-flash
```

`completeLlm()` in `src/llm` prefers cline2api when both URL and key are set, then falls back to xAI (`XAI_API_KEY`).

Smoke test:

```bash
curl "$CLINE2API_BASE_URL/v1/health"
curl "$CLINE2API_BASE_URL/v1/chat/completions" \
  -H "Authorization: Bearer $CLINE2API_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"cline-free/deepseek-v4.1-flash","messages":[{"role":"user","content":"ping"}]}'
```
