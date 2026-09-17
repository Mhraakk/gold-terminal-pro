# زرین — گلد ترمینال

ترمینال طلا و ارز تهران. قیمت زنده از TGJU، مظنهٔ تئوریک اونس×دلار، کوانت فارسی پشت گارد، دیلر نیم‌کلی، ساختار SMC.

رقم ساختگی به‌عنوان قیمت زنده نشان داده نمی‌شود. کندل‌های ترمینال ساختار کمکی از قیمت زنده‌اند و برچسب می‌خورند.

## محصول

| میز | کار |
|---|---|
| بازار | کارت‌های قیمت زنده |
| ترمینال | کندل + SMC (BOS / CHOCH / FVG / OB) |
| کوانت | grok-4.5: plan → tools → evaluate |
| پیش‌بینی | باند ATR از چاپ زنده |
| شکار | مظنه تئوریک، آرب دلار/تتر، گپ آب‌شده |
| دیلر | نیم‌کلی روی دفتر محلی |
| آمار | نوسان روز و هم‌جهتی |
| دفتر / هشدار / استراتژی | ذخیره روی همین دستگاه |
| صحت داده | وضعیت منبع + لایه‌های معماری |

لینک قابل‌اشتراک: `/?desk=hunter&asset=GOLD_18K`

## معماری

TanStack Start RTL · Gateway (validate / rate / log) · Orchestrator graph · RAG disabled · xAI grok-4.5 · Guardrails · Memory localStorage · Cache + TGJU / Gold API · Vercel

جزئیات: [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`SPEC.md`](SPEC.md)

## طراحی

Design system — Frame newsreader-slate-shell, Atmosphere nebula-webgl-background (D2), Motion masked-reveal, Surfaces elevated #131315. Type Newsreader 48.

Auth خاموش است. دفتر و هشدار فقط روی دستگاه بازدیدکننده می‌مانند.

- زنده: [gold-terminal-pro-lemon.vercel.app](https://gold-terminal-pro-lemon.vercel.app)
- کد: [Mhraakk/gold-terminal-pro](https://github.com/Mhraakk/gold-terminal-pro)

## اجرا

```bash
npm install
npm run dev
```

پیش‌نمایش تولید: `npm run build && npm run preview`
