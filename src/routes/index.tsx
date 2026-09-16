import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  BrainCircuit,
  Crosshair,
  Database,
  LayoutDashboard,
  Scale,
  ScrollText,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { AmberAura } from "@/components/amber-aura";
import { AlertsDesk } from "@/components/alerts-desk";
import { CandleChart } from "@/components/candle-chart";
import { DealerDesk } from "@/components/dealer-desk";
import { ForecastDesk } from "@/components/forecast-desk";
import { HunterDesk } from "@/components/hunter-desk";
import { JournalDesk } from "@/components/journal-desk";
import { LiveClock } from "@/components/live-clock";
import { PortfolioDesk } from "@/components/portfolio-desk";
import { QuantDesk } from "@/components/quant-desk";
import { QuoteCard } from "@/components/quote-card";
import { SourcesDesk } from "@/components/sources-desk";
import { StatsDesk } from "@/components/stats-desk";
import { StrategyDesk } from "@/components/strategy-desk";
import { getChartFn, getMarketFn } from "@/lib/market-fn";
import { cn } from "@/lib/cn";
import { formatPct, formatPrice } from "@/lib/format";
import type { AssetId } from "@/data/market/types";

export const Route = createFileRoute("/")({
  loader: () => getMarketFn(),
  component: Terminal,
});

type Tab =
  | "markets"
  | "terminal"
  | "quant"
  | "forecast"
  | "hunter"
  | "stats"
  | "book"
  | "alerts"
  | "strategy"
  | "truth";

const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "markets", label: "بازار", icon: LayoutDashboard },
  { id: "terminal", label: "ترمینال", icon: Activity },
  { id: "quant", label: "کوانت", icon: BrainCircuit },
  { id: "forecast", label: "پیش‌بینی", icon: TrendingUp },
  { id: "hunter", label: "شکار / دیلر", icon: Crosshair },
  { id: "stats", label: "آمار", icon: Scale },
  { id: "book", label: "دفتر", icon: Wallet },
  { id: "alerts", label: "هشدار", icon: Bell },
  { id: "strategy", label: "استراتژی", icon: SlidersHorizontal },
  { id: "truth", label: "صحت داده", icon: Database },
];

function Terminal() {
  const initial = Route.useLoaderData();
  const market = useQuery({
    queryKey: ["market"],
    queryFn: () => getMarketFn(),
    initialData: initial,
    refetchInterval: 30_000,
  });
  const snap = market.data ?? initial;
  const [tab, setTab] = useState<Tab>("markets");
  const [assetId, setAssetId] = useState<AssetId>("GOLD_18K");
  const quote = useMemo(
    () => snap.quotes.find((q) => q.id === assetId) ?? snap.quotes[0],
    [snap.quotes, assetId],
  );

  const chart = useQuery({
    queryKey: ["chart", quote.id],
    queryFn: () => getChartFn({ data: { assetId: quote.id } }),
    enabled: tab === "terminal" || tab === "forecast" || tab === "quant",
  });

  const liveCount = snap.quotes.filter((q) => q.freshness === "live" && q.price > 0).length;

  return (
    <AmberAura>
      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-5 sm:px-6">
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="label-tech text-gold">ZARIN · GOLD TERMINAL</p>
            <h1 className="mt-1 text-3xl font-light tracking-tight sm:text-5xl">زرین</h1>
            <p className="mt-2 max-w-md text-sm text-muted">
              ترمینال طلا و ارز تهران. قیمت زنده از TGJU. رقم ساختگی به‌جای زنده نشان داده نمی‌شود.
            </p>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="label-tech">SOURCES</p>
              <p className="num mt-1 text-sm text-up">{liveCount} زنده</p>
            </div>
            <LiveClock />
          </div>
        </header>

        <div className="mb-5 -mx-4 overflow-x-auto px-4">
          <div className="flex min-w-max gap-4 pb-2 text-xs">
            {snap.quotes.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setAssetId(q.id);
                  setTab("terminal");
                }}
                className="flex items-baseline gap-2 whitespace-nowrap"
              >
                <span className="text-muted">{q.persianName}</span>
                <span className={cn("num", q.price > 0 ? "text-fg" : "text-muted")}>
                  {formatPrice(q.price, q.decimals)}
                </span>
                <span
                  className={cn(
                    "num",
                    q.changePercent > 0 && "text-up",
                    q.changePercent < 0 && "text-down",
                    q.changePercent === 0 && "text-muted",
                  )}
                >
                  {formatPct(q.changePercent)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <nav className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 pb-1" aria-label="بخش‌ها">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-sm px-3 text-sm",
                  on ? "bg-gold text-ink" : "text-muted hover:text-fg",
                )}
              >
                <Icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "markets" && (
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {snap.quotes.map((q) => (
              <QuoteCard
                key={q.id}
                quote={q}
                active={q.id === assetId}
                onSelect={() => {
                  setAssetId(q.id);
                  setTab("terminal");
                }}
              />
            ))}
          </section>
        )}

        {tab === "terminal" && (
          <section className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {snap.quotes.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setAssetId(q.id)}
                  className={cn(
                    "min-h-11 rounded-sm px-3 text-sm",
                    q.id === assetId ? "bg-gold text-ink" : "text-fg shadow-border",
                  )}
                >
                  {q.persianName}
                </button>
              ))}
            </div>
            {chart.data ? (
              <CandleChart
                candles={chart.data.candles}
                synthetic={chart.data.synthetic}
                tech={chart.data.tech}
                structure={chart.data.structure}
              />
            ) : (
              <p className="panel p-8 text-sm text-muted">در حال بارگذاری ساختار…</p>
            )}
          </section>
        )}

        {tab === "quant" && <QuantDesk assetId={quote.id} assetName={quote.persianName} />}

        {tab === "forecast" && chart.data && (
          <ForecastDesk quote={chart.data.quote} tech={chart.data.tech} />
        )}

        {tab === "hunter" && (
          <section className="space-y-4">
            <HunterDesk mazaneh={snap.mazaneh} />
            <DealerDesk mazaneh={snap.mazaneh} />
          </section>
        )}

        {tab === "stats" && <StatsDesk quotes={snap.quotes} />}

        {tab === "book" && (
          <section className="space-y-4">
            <PortfolioDesk quotes={snap.quotes} />
            <JournalDesk />
          </section>
        )}

        {tab === "alerts" && <AlertsDesk quotes={snap.quotes} />}

        {tab === "strategy" && <StrategyDesk quotes={snap.quotes} />}

        {tab === "truth" && <SourcesDesk snap={snap} />}

        <footer className="mt-auto flex items-start gap-2 pt-10 text-xs text-muted">
          <ScrollText className="mt-0.5 size-3.5 shrink-0" />
          <p>
            لایهٔ داده: TGJU + Gold API · کوانت: grok-4.5 پشت گارد · پورتفوی روی همین دستگاه.{" "}
            {snap.requestId}
          </p>
        </footer>
      </div>
    </AmberAura>
  );
}
