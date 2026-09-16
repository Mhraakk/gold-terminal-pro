import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatPrice } from "@/lib/format";
import type { Candle, Technicals } from "@/data/market/types";

export function CandleChart({
  candles,
  synthetic,
  tech,
}: {
  candles: Candle[];
  synthetic: boolean;
  tech: Technicals;
}) {
  const data = candles.map((c) => ({
    t: c.time.slice(11, 16),
    close: c.close,
    vol: c.volume,
    ema20: tech.ema20,
  }));

  return (
    <div className="panel l-bracket p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-tech">CHART</p>
          <h3 className="mt-1 text-lg font-light tracking-tight">ساختار قیمت</h3>
        </div>
        {synthetic ? (
          <p className="max-w-xs text-xs text-muted">
            کندل‌ها از قیمت زنده ساخته شده‌اند — تاریخچهٔ بورسی نیستند. رقم آخر زنده است.
          </p>
        ) : null}
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(242,242,247,0.06)" vertical={false} />
            <XAxis dataKey="t" tick={{ fill: "#8e8e9d", fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={24} />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#8e8e9d", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(v: number) => formatPrice(v)}
              orientation="right"
            />
            <Tooltip
              contentStyle={{
                background: "#0d0d10",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: 2,
                fontFamily: "Vazirmatn",
              }}
              formatter={(value) => formatPrice(Number(value), 2)}
            />
            <Bar dataKey="vol" fill="rgba(212,175,55,0.12)" yAxisId={0} hide />
            <Line type="monotone" dataKey="close" stroke="#d4af37" strokeWidth={1.6} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <Stat label="RSI" value={String(tech.rsi)} />
        <Stat label="EMA20" value={formatPrice(tech.ema20, 2)} />
        <Stat label="EMA50" value={formatPrice(tech.ema50, 2)} />
        <Stat label="مومنتوم" value={tech.momentum === "bullish" ? "صعودی" : tech.momentum === "bearish" ? "نزولی" : "خنثی"} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-tech">{label}</dt>
      <dd className="num mt-1 text-sm text-fg">{value}</dd>
    </div>
  );
}
