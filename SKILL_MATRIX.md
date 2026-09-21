# ماتریس مهارت — زرین

منبع زندهٔ این محیط: `/root/.grok/server-skills` (۵۰) + `/workspace/.grok/skills` (۱۸).
صفحهٔ [neuform.ai/community/featured](https://neuform.ai/community/featured) در زمان استخراج HTML خالی از فهرست بود (رندر کلاینت). هیچ اسکیلی از آن ۷۱ بدون سند نماند؛ فهرست قابل‌اتکا همین ۵۰+۱۸ است.

قانون: یک اتموسفر در هر لحظه. بقیه در `AtmosphereHost` پارک‌اند، نه روی همان رندر.

| مهارت | نقش | استفاده | کجا |
|---|---|---|---|
| ai-app-architecture | معماری | اعمال | لایه‌های gateway/orchestrator/guardrails |
| ai-web-app-creator | داربست | اعمال | TanStack Start RTL، SPEC/ARCHITECTURE |
| amber-aura-background | اتموسفر | پارک | `atmosphere-host` — برنده نیست |
| ambient-ray-background | اتموسفر | پارک | همان |
| archival-octahedron-background | اتموسفر | پارک | همان |
| ascii-beam-background | اتموسفر | پارک | `ascii-beam` |
| aura-assets | رسانه | اعمال | `data/aura.ts` پلیت کانسپت |
| beautiful-shadows | سطح | محدود | دکمه‌ها؛ کارت‌ها elevation newsreader/PGD |
| book-serif-index | فریم | استخوان‌بندی | `BsiWell/Index` — کاغذ خاموش |
| border-gradients | فریم | میزبان | ریل صفحه نه روی صورت کارت |
| bounded-module-grid | چیدمان | اعمال | `bmg-grid` میزها |
| chromatic-band-background | اتموسفر | پارک | `chromatic-band` |
| container-lines | فریم | میزبان | CSS cl-rail |
| corner-lasers | اتموسفر | پارک | `corner-lasers` |
| cyber-industrial-background | اتموسفر | استفاده نشده روی رندر | ثبت شد؛ قفل یک‌اتموسفر |
| cyc-data-trail-background | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| design-dna | ثبت | اعمال | `src/lib/architecture.ts` |
| dither-background | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| dither-laser-dark-mode | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| dot-matrix-grid | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| ecc-harness | ارزیابی | اعمال | `ops/eval` |
| ethereal-utility | سطح | استفاده نشده روی رندر | ثبت شد؛ مناسب این محصول نبود |
| flashlight-edge-card | سطح | نفی | با newsreader 2px قاطی نشد |
| folded-wave-background | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| framed-grid | فریم | محدود | باقی CSS fg-grid |
| gooey-blob-system | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| gradient-border-shell | سطح | نفی | PGD Gradient Shell جایگزین |
| grain-column-background | اتموسفر | استفاده نشده روی رندر | ثبت شد |
| gsap-motion | حرکت | اعمال | plane scrub + section reveal |
| gsap-scrolltrigger-storytelling | حرکت | محدود | ScrollTrigger flatten |
| industrial-minimalism | اتموسفر | پارک | `industrial-minimalism` |
| magic-rings-telemetry | تصویر | استفاده نشده روی رندر | ثبت شد؛ تله‌متری معامله حذف شد |
| masked-reveal | حرکت | اعمال | `BsiDisplay` |
| music-app-creator | محصول | نامربوط | سند: محصول طلا است نه موسیقی |
| nebula-webgl-background | اتموسفر | پارک | آخرین برنده PGD است |
| newsreader-slate-shell | مادهٔ کارت | اعمال داخل PGD | `#131315`→شیشه ۱۲px روی pgd-root |
| number-details | جزئیات | اعمال | فهرست ۰۱–۱۲ و مهر کارت |
| perspective-glass-dashboard | اتموسفر+فریم | برنده | `pgd-root` God Rays + terrain |
| point-cloud-globe | تصویر | اعمال | داشبورد آتلیه |
| progressive-blur | سطح | اعمال | بالای ۱۲٪ در `__root` |
| radial-blade-sculpture | اتموسفر | پارک | `radial-blade` |
| resonant-agents | محصول | نامربوط | سند: OS موسیقی نیست |
| sage-dual-pane | فریم | استخوان | `sdp-nav-link` |
| seamless-marquee | تصویر | اعمال | نوار چهار سطح لوکس |
| skeuomorphic-ui | سطح | پارک | `skeuomorph` |
| synthetic-flora-background | اتموسفر | پارک | `synthetic-flora` |
| tactical-globe | تصویر | نفی | با point-cloud قاطی نشد |
| technical-hud | فریم | پارک | `technical-hud` |
| terminal-modernism | تصویر | محدود | `tm-span` |
| webgl-laser-background | اتموسفر | پارک | `webgl-laser` |

## مهارت‌های پلتفرم workspace (۱۸)

| مهارت | استفاده |
|---|---|
| auth | روشن — Better Auth، `/login`، `authMiddleware` |
| neon | روشن — PGLite/Neon، `migrations/0002_studio.sql` |
| design-ui | سطوح کارت/ورود |
| og | `site.json` زرین |
| xai-api | `completeXai` grok-4.5 |
| threejs | terrain PGD |
| building-games, controls, game-* , generate2d*, imagine, video2dsprite, multiplayer-p2p | نامربوط به آتلیه طلا — ثبت شد که روی محصول پاشیده نشود |

جمع: ۵۰ طراحی از `/root/.grok/server-skills` + ۱۸ پلتفرم workspace = ۶۸.
صفحهٔ [neuform.ai/community/featured](https://neuform.ai/community/featured) در این اجرا HTML عمومی خالی برگرداند (رندر کلاینت). سه نام تا ۷۱ بدون حدس ثبت نشد.
قانون یک‌اتموسفر حفظ شد: PGD برنده است؛ بقیه پارک یا نفی شده‌اند.
