import type { ReactNode } from "react";
import { FrameCard } from "@/components/frame";
import { formatPrice } from "@/lib/format";
import type { Candle, MarketStructure, Technicals } from "@/data/market/types";

export function CandleChart({
  candles,
  synthetic,
  tech,
  structure,
}: {
  candles: Candle[];
  synthetic: boolean;
  tech: Technicals;
  structure?: MarketStructure;
}) {
  const lows = candles.map((c) => c.low);
  const highs = candles.map((c) => c.high);
  const min = Math.min(...lows);
  const max = Math.max(...highs);
  const pad = (max - min) * 0.08 || 1;
  const lo = min - pad;
  const hi = max + pad;
  const span = hi - lo || 1;
  const w = 720;
  const h = 280;
  const n = candles.length;
  const slot = w / Math.max(n, 1);
  const y = (p: number) => h - ((p - lo) / span) * h;
  const last = candles.at(-1);

  return (
    <FrameCard className="p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-tech">CHART · SMC</p>
          <h3 className="mt-1 text-lg font-light tracking-tight">ساختار قیمت</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {structure ? (
            <>
              <Tag>{structure.trend === "BULLISH" ? "روند صعودی" : structure.trend === "BEARISH" ? "روند نزولی" : "خنثی"}</Tag>
              {structure.bos ? <Tag>BOS</Tag> : null}
              {structure.choch ? <Tag>CHOCH</Tag> : null}
              <Tag>FVG {structure.fvgs.length}</Tag>
              <Tag>OB {structure.orderBlocks.filter((o) => o.status === "active").length}</Tag>
            </>
          ) : null}
        </div>
      </div>
      {synthetic ? (
        <p className="mb-3 max-w-xl text-xs text-muted">
          کندل‌ها ساختار کمکی از قیمت زنده‌اند — تاریخچهٔ بورسی نیستند. رقم آخر زنده است و برچسب می‌خورد.
        </p>
      ) : null}
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full min-w-[520px]" role="img" aria-label="نمودار کندل">
          {structure?.fvgs.map((f, i) => (
            <rect
              key={`fvg-${i}`}
              x={0}
              y={y(Math.max(f.high, f.low))}
              width={w}
              height={Math.abs(y(f.high) - y(f.low))}
              fill={f.type === "bullish" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)"}
            />
          ))}
          {structure?.support.map((s, i) => (
            <line key={`s-${i}`} x1={0} x2={w} y1={y(s)} y2={y(s)} stroke="rgba(16,185,129,0.35)" strokeDasharray="4 4" />
          ))}
          {structure?.resistance.map((s, i) => (
            <line key={`r-${i}`} x1={0} x2={w} y1={y(s)} y2={y(s)} stroke="rgba(239,68,68,0.35)" strokeDasharray="4 4" />
          ))}
          {candles.map((c, i) => {
            const up = c.close >= c.open;
            const x = i * slot + slot / 2;
            const color = up ? "#10b981" : "#ef4444";
            const bodyTop = y(Math.max(c.open, c.close));
            const bodyH = Math.max(1.2, Math.abs(y(c.open) - y(c.close)));
            return (
              <g key={c.time}>
                <line x1={x} x2={x} y1={y(c.high)} y2={y(c.low)} stroke={color} strokeWidth={1} />
                <rect
                  x={x - Math.max(1.4, slot * 0.28)}
                  y={bodyTop}
                  width={Math.max(2.8, slot * 0.56)}
                  height={bodyH}
                  fill={color}
                />
              </g>
            );
          })}
          {last ? (
            <line x1={0} x2={w} y1={y(last.close)} y2={y(last.close)} stroke="#d4af37" strokeWidth={0.8} opacity={0.7} />
          ) : null}
        </svg>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
        <Stat label="RSI" value={String(tech.rsi)} />
        <Stat label="EMA20" value={formatPrice(tech.ema20, 2)} />
        <Stat label="EMA50" value={formatPrice(tech.ema50, 2)} />
        <Stat label="ATR" value={formatPrice(tech.atr, 2)} />
        <Stat
          label="مومنتوم"
          value={tech.momentum === "bullish" ? "صعودی" : tech.momentum === "bearish" ? "نزولی" : "خنثی"}
        />
      </dl>
    </FrameCard>
  );
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="label-tech well px-2 py-1 text-gold">{children}</span>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-tech">{label}</dt>
      <dd className="num mt-1 text-sm text-fg">{value}</dd>
    </div>
  );
}
