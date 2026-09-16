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
| شکار / دیلر | مظنه تئوریک و نیم‌کلی |
| آمار | نوسان روز و هم‌جهتی |
| دفتر / هشدار / استراتژی | ذخیره روی همین دستگاه |
| صحت داده | وضعیت منبع + لایه‌های معماری |

لینک قابل‌اشتراک: `/?desk=hunter&asset=GOLD_18K`

## معماری

TanStack Start RTL · Gateway (validate / rate / log) · Orchestrator graph · RAG disabled · xAI grok-4.5 · Guardrails · Memory localStorage · Cache + TGJU / Gold API · Vercel

جزئیات: [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`SPEC.md`](SPEC.md)

## طراحی

Field `#050505` · accent `#D4AF37` · Vazirmatn + JetBrains Mono · amber-aura · framed-grid · container-lines · gold-thread cards

Auth خاموش است. دفتر و هشدار فقط روی دستگاه بازدیدکننده می‌مانند.
