# Deploy checklist — gold-terminal-pro (زرین)

## Status (as of prep)

| Item | State |
|------|--------|
| GitHub repo | https://github.com/Mhraakk/gold-terminal-pro |
| Vercel project | `gold-terminal-pro` (linked to this repo, branch `main`) |
| Production URL | https://gold-terminal-pro-lemon.vercel.app |
| Framework on Vercel | TanStack Start |
| Auto-deploy | Push / merge to `main` → Vercel deploy |

## Env vars (Vercel already configured)

| Key | Notes |
|-----|--------|
| `DATABASE_URL` | Neon Postgres (sensitive) |
| `XAI_API_KEY` | xAI (sensitive) |
| `VITE_AUTH_ENABLED` | Client auth toggle |
| `GROK_PROJECT_ID` | Distinguishes deployed app vs workspace preview |
| `BETTER_AUTH_URL` | Auth base URL |

Local: copy `.env.example` → `.env` and fill placeholders. Never commit `.env`.

## Local

```bash
npm ci
cp .env.example .env   # then edit secrets
npm run dev            # http://0.0.0.0:8080
```

Useful checks before push:

```bash
npm run typecheck
npm test
```

CI on GitHub (`.github/workflows/ci.yml`) runs `npm ci`, `typecheck`, and `ops/eval/run.mjs` on `main` and PRs.

## Continue deploying after you finish app work

1. Commit on a branch → open PR (CI should pass).
2. Merge to `main`.
3. Vercel builds automatically; confirm https://gold-terminal-pro-lemon.vercel.app and the deployment in the Vercel dashboard.
4. If build fails on migrate/DB, verify `DATABASE_URL` still points at the Neon pooler.
5. Rotate secrets in Vercel → Project → Settings → Environment Variables (do not put secrets in git).

## Out of scope for this prep

- Do not confuse with archived scaffold `Mhraakk/goldo` or `Mhraakk/Gold`.
- Product DB is Neon (`DATABASE_URL`), not Supabase, unless you deliberately migrate later.

## فارسی (خلاصه)

ریپو و Vercel از قبل به هم وصل‌اند. با هر push به `main` دیپلوی می‌شود.
قبل از ادامهٔ کدنویسی، `.env.example` را برای لوکال کپی کن؛ سکرت‌های پروداکشن فقط در Vercel بمانند.
