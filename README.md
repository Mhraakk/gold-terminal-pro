# زرین — ترمینال طلا و فلزات

ترمینال معاملاتی و تحلیل طلا و فلزات. دسکتاپ و موبایل. گیت‌وی، ارکستراتور، و ابزارهای Quant روی xAI grok-4.5.

محصول زنده است؛ تکمیل فیچر را روی همین ریپو ادامه بده. دیپلوی خودکار با push به `main`.

## خلاصه

| بخش | شرح |
|------|------|
| نام فارسی | زرین — ترمینال طلا |
| محصول | ترمینال + SMC (BOS / CHOCH / FVG / OB) |
| مدل | grok-4.5: plan → tools → evaluate |
| داده بازار | کش ATR و مظنه طلا |
| میزها | شکار و دیلر جدا، آرب دلار/تتر، تست مظنه |
| دیزاین | سیستم Newsreader-slate روی nebula |
| ورود / احراز | قابل خاموشی با `VITE_AUTH_ENABLED` |
| میزبانی | Vercel |

مسیر نمونه: `/?desk=hunter&asset=GOLD_18K`

## معماری

TanStack Start RTL · Gateway (validate / rate / log) · Orchestrator graph · RAG disabled · xAI grok-4.5 · Guardrails · Memory localStorage · Cache + TGJU / Gold API · Vercel

جزئیات: [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`SPEC.md`](SPEC.md) · **دیپلوی:** [`docs/DEPLOY.md`](docs/DEPLOY.md)

OSS / RTL: [`docs/OSS_INSPIRATION.md`](docs/OSS_INSPIRATION.md) · [`docs/RTL_UI.md`](docs/RTL_UI.md)

## دیزاین

Design system — Frame newsreader-slate-shell, Atmosphere nebula-webgl-background (D2), Motion masked-reveal, Surfaces elevated #131315. Type Newsreader 48.

Auth قابل خاموشی است. ورود و احراز هویت فقط وقتی فعال باشد روی گیت‌وی و کانکتور اعمال می‌شود.

- پروداکشن: [gold-terminal-pro-lemon.vercel.app](https://gold-terminal-pro-lemon.vercel.app)
- ریپو: [Mhraakk/gold-terminal-pro](https://github.com/Mhraakk/gold-terminal-pro)

## اجرا

```bash
npm install
cp .env.example .env   # سپس مقادیر را پر کن
npm run dev
```

بیلد و پیش‌نمایش: `npm run build && npm run preview`
