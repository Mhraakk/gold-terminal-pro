import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
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
import { FrameCard, Shell } from "@/components/frame";
import { HunterDesk } from "@/components/hunter-desk";
import { JournalDesk } from "@/components/journal-desk";
import { LiveClock } from "@/components/live-clock";
import { PortfolioDesk } from "@/components/portfolio-desk";
import { QuantDesk } from "@/components/quant-desk";
import { QuoteCard } from "@/components/quote-card";
import { SourcesDesk } from "@/components/sources-desk";
import { StatsDesk } from "@/components/stats-desk";
import { StrategyDesk } from "@/components/strategy-desk";
import { ASSET_BY_ID } from "@/data/market/assets";
import { getChartFn, getMarketFn } from "@/lib/market-fn";
import { cn } from "@/lib/cn";
import { formatPct, formatPrice } from "@/lib/format";
import type { AssetId } from "@/data/market/types";

const DESKS = [
  "markets",
  "terminal",
  "quant",
  "forecast",
  "hunter",
  "stats",
  "book",
  "alerts",
  "strategy",
  "truth",
] as const;

type Tab = (typeof DESKS)[number];

type DeskSearch = { desk: Tab; asset?: AssetId };

function parseSearch(raw: Record<string, unknown>): DeskSearch {
  const desk = DESKS.includes(raw.desk as Tab) ? (raw.desk as Tab) : "markets";
  const asset =
    typeof raw.asset === "string" && raw.asset in ASSET_BY_ID ? (raw.asset as AssetId) : undefined;
  return { desk, asset };
}

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  loader: () => getMarketFn(),
  pendingComponent: TerminalPending,
  component: Terminal,
});

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

function TerminalPending() {
  return (
    <AmberAura>
      <Shell className="flex min-h-dvh items-center justify-center">
        <p className="label-tech text-gold">در حال دریافت چاپ زنده…</p>
      </Shell>
    </AmberAura>
  );
}

function Terminal() {
  const initial = Route.useLoaderData();
  const { desk: tab, asset } = Route.useSearch();
  const navigate = Route.useNavigate();
  const market = useQuery({
    queryKey: ["market"],
    queryFn: () => getMarketFn(),
    initialData: initial,
    refetchInterval: 30_000,
  });
  const snap = market.data ?? initial;
  const assetId: AssetId = asset ?? "GOLD_18K";
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
  const delayedCount = snap.quotes.filter((q) => q.freshness === "delayed" && q.price > 0).length;

  function setTab(id: Tab) {
    void navigate({ search: (s) => ({ ...s, desk: id }) });
  }
  function setAssetId(id: AssetId) {
    void navigate({ search: (s) => ({ ...s, asset: id }) });
  }

  return (
    <AmberAura>
      <a href="#desk" className="skip-link">
        پرش به میز
      </a>
      <Shell className="flex min-h-dvh flex-col">
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
              <p className="num mt-1 text-sm text-up">
                {liveCount > 0
                  ? `${liveCount} زنده`
                  : delayedCount > 0
                    ? `${delayedCount} تأخیر`
                    : "قطع"}
              </p>
            </div>
            <LiveClock />
          </div>
        </header>

        <div className="-mx-1 overflow-x-auto">
          <div className="ticker-row text-xs">
            {snap.quotes.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => {
                  setAssetId(q.id);
                  setTab("terminal");
                }}
                className="flex min-h-11 items-baseline gap-2 whitespace-nowrap"
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

        <nav className="mt-4 mb-6 flex gap-1 overflow-x-auto pb-1" aria-label="بخش‌ها">
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                data-on={on}
                aria-current={on ? "page" : undefined}
                onClick={() => setTab(t.id)}
                className="tab-mark"
              >
                <Icon className="size-4" aria-hidden="true" />
                {t.label}
              </button>
            );
          })}
        </nav>

        <main id="desk">
          {tab === "markets" && (
            <section className="fg-grid" data-recipe="board" aria-label="بازار">
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
            <section className="fg-grid" data-recipe="builder" aria-label="ترمینال">
              <div className="flex flex-wrap gap-1">
                {snap.quotes.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    data-on={q.id === assetId}
                    aria-current={q.id === assetId ? "true" : undefined}
                    onClick={() => setAssetId(q.id)}
                    className="tab-mark"
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
                <FrameCard className="p-8">
                  <p className="text-sm text-muted">در حال بارگذاری ساختار…</p>
                </FrameCard>
              )}
            </section>
          )}

          {tab === "quant" && <QuantDesk assetId={quote.id} assetName={quote.persianName} />}

          {tab === "forecast" &&
            (chart.data ? (
              <ForecastDesk quote={chart.data.quote} tech={chart.data.tech} />
            ) : (
              <FrameCard className="p-8">
                <p className="text-sm text-muted">در حال بارگذاری ساختار…</p>
              </FrameCard>
            ))}

          {tab === "hunter" && (
            <section className="fg-grid" data-recipe="builder" aria-label="شکار مظنه">
              <HunterDesk mazaneh={snap.mazaneh} />
              <DealerDesk mazaneh={snap.mazaneh} />
            </section>
          )}

          {tab === "stats" && <StatsDesk quotes={snap.quotes} />}

          {tab === "book" && (
            <section className="fg-grid" data-recipe="builder" aria-label="دفتر">
              <PortfolioDesk quotes={snap.quotes} />
              <JournalDesk />
            </section>
          )}

          {tab === "alerts" && <AlertsDesk quotes={snap.quotes} />}

          {tab === "strategy" && <StrategyDesk quotes={snap.quotes} />}

          {tab === "truth" && <SourcesDesk snap={snap} />}
        </main>

        <footer className="mt-auto flex items-start gap-2 pt-10 text-xs text-muted">
          <ScrollText className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <p>
            لایهٔ داده: TGJU + Gold API · کوانت: grok-4.5 پشت گارد · پورتفوی روی همین دستگاه.{" "}
            {snap.requestId}
          </p>
        </footer>
      </Shell>
    </AmberAura>
  );
}
