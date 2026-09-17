import { createFileRoute, Link } from "@tanstack/react-router";
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
import { AlertsDesk } from "@/components/alerts-desk";
import {
  BsiBody,
  BsiCrease,
  BsiDisplay,
  BsiFolio,
  BsiIndex,
  BsiIndexGroup,
  BsiIndexItem,
  BsiPage,
  BsiShell,
  BsiSpread,
  BsiWell,
} from "@/components/book-serif-index";
import { CandleChart } from "@/components/candle-chart";
import { DealerDesk } from "@/components/dealer-desk";
import { ForecastDesk } from "@/components/forecast-desk";
import { FrameCard } from "@/components/frame";
import { HunterDesk } from "@/components/hunter-desk";
import { JournalDesk } from "@/components/journal-desk";
import { LiveClock } from "@/components/live-clock";
import { PortfolioDesk } from "@/components/portfolio-desk";
import { QuantDesk } from "@/components/quant-desk";
import { QuoteCard } from "@/components/quote-card";
import { SourcesDesk } from "@/components/sources-desk";
import { StatsDesk } from "@/components/stats-desk";
import { StrategyDesk } from "@/components/strategy-desk";
import { stillForAsset } from "@/data/aura";
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

const INDEX_GROUPS: { label: string; ids: Tab[] }[] = [
  { label: "دفتر", ids: ["markets", "terminal", "quant", "forecast"] },
  { label: "صراف", ids: ["hunter", "stats", "book"] },
  { label: "بایگانی", ids: ["alerts", "strategy", "truth"] },
];

const TAB_BY_ID = Object.fromEntries(TABS.map((t) => [t.id, t])) as Record<Tab, (typeof TABS)[number]>;

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  loader: () => getMarketFn(),
  pendingComponent: TerminalPending,
  component: Terminal,
  head: ({ match }) => {
    const desk = match.search.desk;
    const label = TAB_BY_ID[desk]?.label ?? "بازار";
    return { meta: [{ title: `${label} · زرین — گلد ترمینال` }] };
  },
});
function TerminalPending() {
  return (
    <BsiShell>
      <BsiIndex>
        <p className="bsi-index-group">دفتر</p>
        <span className="bsi-index-item is-active">بازار</span>
      </BsiIndex>
      <BsiWell>
        <BsiSpread>
          <BsiPage>
            <p className="bsi-folio">f. 00 · PRESS</p>
            <p className="bsi-kicker">ZARIN · TGJU</p>
            <BsiDisplay>زرین</BsiDisplay>
            <p className="bsi-body">در حال دریافت چاپ زنده…</p>
          </BsiPage>
        </BsiSpread>
      </BsiWell>
    </BsiShell>
  );
}

function Terminal() {
  const initial = Route.useLoaderData();
  const { desk: tab, asset } = Route.useSearch();
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
  const still = stillForAsset(quote.id);
  const deskLabel = TAB_BY_ID[tab].label;

  return (
    <BsiShell>
      <a href="#desk" className="skip-link shadow-beautiful-sm">
        پرش به برگ
      </a>
      <BsiIndex>
        {INDEX_GROUPS.map((g) => (
          <div key={g.label}>
            <BsiIndexGroup>{g.label}</BsiIndexGroup>
            {g.ids.map((id) => (
              <BsiIndexItem key={id} active={tab === id} desk={id} asset={assetId}>
                {TAB_BY_ID[id].label}
              </BsiIndexItem>
            ))}
          </div>
        ))}
        <BsiIndexGroup>چاپ</BsiIndexGroup>
        <p className="bsi-index-item" style={{ borderInlineStartColor: "transparent", cursor: "default" }}>
          {liveCount > 0 ? `${liveCount} زنده` : delayedCount > 0 ? `${delayedCount} تأخیر` : "قطع"}
        </p>
        <div className="mt-6">
          <LiveClock />
        </div>
      </BsiIndex>
      <BsiWell>
        <BsiSpread>
          <BsiPage side="verso">
            <BsiFolio>
              f. {quote.symbol} · {deskLabel}
            </BsiFolio>
            <p className="bsi-kicker">ZARIN · TGJU · VOL. I</p>
            <BsiDisplay>{quote.persianName}</BsiDisplay>
            <blockquote className="bsi-quote">
              {formatPrice(quote.price, quote.decimals)} {quote.unit} · {formatPct(quote.changePercent)}
            </blockquote>
            <BsiBody drop="ت">
              رمینال طلا و ارز تهران. قیمت از TGJU می‌آید و اگر زنده نباشد رقم ساختگی جای آن نمی‌نشیند. این برگ دفتر
              همان چاپ است؛ مظنه و ساختار در صفحهٔ روبه‌رو خوانده می‌شود.
            </BsiBody>
            <aside className="bsi-margin">{quote.unit}</aside>
            <figure className="bsi-plate">
              <img src={still.src} alt={still.alt} width={1600} height={900} />
              <figcaption>Pl. {quote.symbol} · {still.label}</figcaption>
            </figure>
            <p className="bsi-cite">
              {quote.source} · {quote.freshness} · {snap.requestId}
            </p>
            <aside className="bsi-note">
              رقم ساختگی به‌جای زنده نشان داده نمی‌شود. پورتفوی روی همین دستگاه می‌ماند.
            </aside>
          </BsiPage>
          <BsiCrease />
          <BsiPage side="recto" id="desk">
            <BsiFolio>pp. {deskLabel}</BsiFolio>
            <span className="bsi-label">Lectio</span>
            {tab === "markets" && (
              <section className="bmg-grid" data-recipe="board" aria-label="بازار">
                {snap.quotes.map((q) => (
                  <QuoteCard key={q.id} quote={q} />
                ))}
              </section>
            )}
            {tab === "terminal" && (
              <section className="bmg-grid bmg-stack" data-recipe="builder" aria-label="ترمینال">
                <div className="flex flex-wrap gap-1">
                {snap.quotes.map((q) => (
                  <Link
                    key={q.id}
                    to="/"
                    search={(s) => ({ ...s, asset: q.id, desk: "terminal" })}
                    data-on={q.id === assetId}
                    aria-current={q.id === assetId ? "true" : undefined}
                    className={cn("tab-mark", q.id === assetId && "shadow-beautiful-sm")}
                  >
                    {q.persianName}
                  </Link>
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
              <section className="bmg-grid" data-recipe="builder" aria-label="شکار مظنه">
                <HunterDesk mazaneh={snap.mazaneh} />
                <DealerDesk mazaneh={snap.mazaneh} quotes={snap.quotes} />
              </section>
            )}
            {tab === "stats" && <StatsDesk quotes={snap.quotes} />}
            {tab === "book" && (
              <section className="bmg-grid" data-recipe="builder" aria-label="دفتر">
                <PortfolioDesk quotes={snap.quotes} />
                <JournalDesk />
              </section>
            )}
            {tab === "alerts" && <AlertsDesk quotes={snap.quotes} />}
            {tab === "strategy" && <StrategyDesk quotes={snap.quotes} />}
            {tab === "truth" && <SourcesDesk snap={snap} />}
            <p className="bsi-cite mt-8 flex items-start gap-2">
              <ScrollText className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              لایهٔ داده: TGJU + Gold API · کوانت: grok-4.5 پشت گارد
            </p>
          </BsiPage>
        </BsiSpread>
      </BsiWell>
    </BsiShell>
  );
}
