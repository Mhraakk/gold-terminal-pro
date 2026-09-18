import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  createSeriesMarkers,
  type IChartApi,
  type ISeriesApi,
  type Time,
  type UTCTimestamp,
} from "lightweight-charts";
import type { ReactNode } from "react";
import { FrameCard } from "@/components/frame";
import { formatPrice } from "@/lib/format";
import type { Candle, MarketStructure, Technicals } from "@/data/market/types";

function toChartTime(raw: string): Time {
  const asNum = Number(raw);
  if (Number.isFinite(asNum) && asNum > 1_000_000_000) {
    return (asNum > 1e12 ? Math.floor(asNum / 1000) : Math.floor(asNum)) as UTCTimestamp;
  }
  const ms = Date.parse(raw);
  if (Number.isFinite(ms)) return Math.floor(ms / 1000) as UTCTimestamp;
  return raw as Time;
}

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
  const hostRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "rgba(232, 228, 216, 0.72)",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "rgba(212, 175, 55, 0.08)" },
        horzLines: { color: "rgba(212, 175, 55, 0.08)" },
      },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      crosshair: { mode: 1 },
      autoSize: true,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: el.clientWidth, height: el.clientHeight });
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || candles.length === 0) return;

    const data = candles.map((c) => ({
      time: toChartTime(c.time),
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    series.setData(data);

    const markers = [];
    if (structure?.bos && data.length) {
      markers.push({
        time: data[data.length - 1]!.time,
        position: "aboveBar" as const,
        color: "#d4af37",
        shape: "arrowDown" as const,
        text: "BOS",
      });
    }
    if (structure?.choch && data.length > 1) {
      markers.push({
        time: data[Math.max(0, data.length - 3)]!.time,
        position: "belowBar" as const,
        color: "#60a5fa",
        shape: "arrowUp" as const,
        text: "CHOCH",
      });
    }
    try {
      createSeriesMarkers(series, markers);
    } catch {
      /* markers optional if API shape differs */
    }

    chart.timeScale().fitContent();
  }, [candles, structure?.bos, structure?.choch]);

  return (
    <FrameCard className="p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="label-tech">CHART · SMC</p>
          <h3 className="mt-1 text-lg font-light tracking-tight">ساختار بازار</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-[10px]">
          {structure ? (
            <>
              <Tag>
                {structure.trend === "BULLISH"
                  ? "روند صعودی"
                  : structure.trend === "BEARISH"
                    ? "روند نزولی"
                    : "خنثی"}
              </Tag>
              {structure.bos ? <Tag>BOS</Tag> : null}
              {structure.choch ? <Tag>CHOCH</Tag> : null}
              <Tag>FVG {structure.fvgs.length}</Tag>
              <Tag>
                OB {structure.orderBlocks.filter((o) => o.status === "active").length}
              </Tag>
            </>
          ) : null}
        </div>
      </div>
      {synthetic ? (
        <p className="mb-3 max-w-xl text-xs text-muted">
          دادهٔ ساختار بازار ترکیبی است — برای دموی ترمینال. بعداً به فید زنده وصل می‌شود.
        </p>
      ) : null}
      <div
        ref={hostRef}
        className="h-64 w-full min-h-[260px] min-w-[280px]"
        role="img"
        aria-label="نمودار شمعی طلا"
      />
      <p className="mt-2 text-[10px] text-muted">
        TradingView Lightweight Charts ·{" "}
        <a
          className="text-gold underline-offset-2 hover:underline"
          href="https://github.com/tradingview/lightweight-charts"
          target="_blank"
          rel="noreferrer"
        >
          github.com/tradingview/lightweight-charts
        </a>
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
        <Stat label="RSI" value={String(tech.rsi)} />
        <Stat label="EMA20" value={formatPrice(tech.ema20, 2)} />
        <Stat label="EMA50" value={formatPrice(tech.ema50, 2)} />
        <Stat label="ATR" value={formatPrice(tech.atr, 2)} />
        <Stat
          label="مومنتوم"
          value={
            tech.momentum === "bullish"
              ? "صعودی"
              : tech.momentum === "bearish"
                 / "نز؈لی"
                 : "خ͆ثی"
          }
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
