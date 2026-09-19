# زرین — آتلیه کانسپت

پلتفرم ایده‌پردازی طلای لوکس. کانسپت مداوم بدون تکرار. چهار سطح: روزمره لوکس، امضای برند، بسیار لاکچری، کالکتورز.

هر طرح: مشخصات، داستان، مخاطب، اجرت تقریبی، ورییشن، وزن، تولیدپذیری، پکیج و آنباکسینگ، شناسنامه و سری محدود.

ورود واقعی، صف جاب روی Postgres، ایزولهٔ سازمان. الهام از میلان، موناکو، پاریس — کپی ممنوع.

## صفحات

| میز | کار |
|---|---|
| داشبورد | ایده / تأیید / تولید / پکیجینگ |
| کانسپت تازه | نوع، سطح، وزن، عیار، مناسبت → سه مسیر |
| آتلیه | آرشیو طرح‌ها |
| شناسنامه طرح | پرونده کامل + شباهت |
| تولید | کانبان وضعیت |
| ست و پکیج | همراه، آنباکس، شخصی‌سازی |
| کالکشن / دی‌ان‌ای / اصالت | خط برند و گواهی |

لینک: `/?desk=brief`

## معماری

TanStack Start RTL · Gateway · Orchestrator · grok-4.5 (قابل تعویض) · Guardrails · Postgres/Neon · Vercel

جزئیات: [`ARCHITECTURE.md`](ARCHITECTURE.md) · [`SPEC.md`](SPEC.md) · **دیپلوی:** [`docs/DEPLOY.md`](docs/DEPLOY.md)

- پروداکشن: [gold-terminal-pro-lemon.vercel.app](https://gold-terminal-pro-lemon.vercel.app)
- ریپو: [Mhraakk/gold-terminal-pro](https://github.com/Mhraakk/gold-terminal-pro)

## اجرا

```bash
npm install
npm run dev
```

بیلد و پیش‌نمایش: `npm run build && npm run preview`
