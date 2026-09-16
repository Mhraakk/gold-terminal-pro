import { FrameCard } from "@/components/frame";
import { formatPct, formatPrice } from "@/lib/format";
import type { MarketQuote, Technicals } from "@/data/market/types";

export function ForecastDesk({ quote, tech }: { quote: MarketQuote; tech: Technicals }) {
  const atr = tech.atr || quote.price * 0.004;
  const bias = tech.momentum === "bullish" ? 0.35 : tech.momentum === "bearish" ? -0.35 : 0;
  const next = quote.price + atr * bias;
  const lo = quote.price - atr;
  const hi = quote.price + atr;
  return (
    <FrameCard className="p-5">
      <p className="label-tech">RANGE FORECAST</p>
      <h3 className="mt-1 text-lg font-light">باند فردا — {quote.persianName}</h3>
      <p className="mt-3 text-sm text-muted">
        این باند از ATR و مومنتوم روی ساختار ساخته می‌شود، نه از پیش‌بینی جادویی. قیمت فعلی زنده است.
      </p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="label-tech">کف باند</dt>
          <dd className="num mt-2 text-xl">{formatPrice(lo, quote.decimals)}</dd>
        </div>
        <div>
          <dt className="label-tech">مرکز متمایل</dt>
          <dd className="num mt-2 text-xl text-gold">{formatPrice(next, quote.decimals)}</dd>
        </div>
        <div>
          <dt className="label-tech">سقف باند</dt>
          <dd className="num mt-2 text-xl">{formatPrice(hi, quote.decimals)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted">
        RSI {tech.rsi} · قدرت روند {formatPct(tech.trendStrength / 10)} · ATR {formatPrice(atr, quote.decimals)}
      </p>
    </FrameCard>
  );
}
