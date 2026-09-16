# Spec — زرین · Gold Terminal

Coach output from the original Gold Terminal custom instructions (`Mhraakk/Gold`).
Skeleton follows `ai-app-architecture` layers. Auth off. Device-local book & alerts.

## Product

Institutional-grade Tehran gold & FX desk. Live quotes only. Never present a fabricated figure as a live price.

## Custom instructions (binding)

- All quant / analysis / chat output is **Persian**. English only for tickers and technical terms (BOS, CHOCH, FVG, RSI, ATR, Kelly).
- Role: Principal Institutional Quant, Senior SMC trader, geopolitical desk covering melted gold, 18k, coins, USD/IRT, USDT, XAUUSD.
- Tools: Elliott, Fibonacci, SMC (order blocks, FVG, liquidity, CHOCH/BOS). High-confidence setups or say the tape is unclear.
- Melted gold is Tehran bazaar dynamics, azad dollar arb, domestic inflation. Unit is تومان unless the quote is XAUUSD.
- Never invent a live print. If a source is down the card reads «قطع».
- Terminal candles are **structure helpers** derived from the live print and must be labelled as such.
- Theoretical mazaneh = (XAUUSD ÷ 31.1034768) × 0.75 × USD/IRT. Hunter / dealer only fire a verdict when ounce, dollar and 18k are all live.
- AI is user-initiated (button / question). Rate-limited. grok-4.5 behind gateway + guardrails.
- Kelly-style size is a **fraction of the local book**, never a live-price substitute.

## Surfaces

بازار · ترمینال · کوانت · پیش‌بینی · شکار مظنه · دیلر · آمار · دفتر · هشدار · استراتژی · صحت داده

## Architecture

Frontend TanStack Start RTL · Gateway TanStack server functions · Orchestrator graph · RAG disabled adapter · Models xAI grok-4.5 · Guardrails on · Memory short-term localStorage · Data in-memory cache + TGJU / Gold API · LLMOps Dockerfile + eval · Cloud Vercel

## Design

Frame Gold Terminal luxury obsidian (field `#050505`, accent `#D4AF37`, Vazirmatn + JetBrains Mono, RTL) · Atmosphere amber-aura-background · Motion shader breath + 1.5s pointer lerp · Surfaces opaque gold-thread cards
