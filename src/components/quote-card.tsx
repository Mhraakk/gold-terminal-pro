import { cn } from "@/lib/cn";
import { formatPct, formatPrice, formatSigned } from "@/lib/format";
import type { MarketQuote } from "@/data/market/types";

const FRESH: Record<MarketQuote["freshness"], string> = {
  live: "زنده",
  delayed: "تأخیر",
  stale: "کهنه",
  unavailable: "قطع",
};

export function QuoteCard({
  quote,
  active,
  onSelect,
}: {
  quote: MarketQuote;
  active?: boolean;
  onSelect: () => void;
}) {
  const up = quote.changePercent > 0;
  const down = quote.changePercent < 0;
  const dead = quote.freshness === "unavailable" || quote.price <= 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "panel l-bracket w-full p-4 text-right transition-shadow duration-200",
        active && "shadow-border-hover",
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-fg">{quote.persianName}</p>
          <p className="label-tech mt-1">{quote.symbol}</p>
        </div>
        <span
          className={cn(
            "label-tech",
            quote.freshness === "live" && "text-up",
            quote.freshness === "stale" && "text-down",
            quote.freshness === "unavailable" && "text-down",
          )}
        >
          {FRESH[quote.freshness]}
        </span>
      </div>
      <p className={cn("num text-2xl font-medium", dead ? "text-muted" : "text-fg")}>
        {formatPrice(quote.price, quote.decimals)}
      </p>
      <p className="mt-1 text-xs text-muted">{quote.unit}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={cn("num", up && "text-up", down && "text-down", !up && !down && "text-muted")}>
          {formatSigned(quote.change, quote.decimals)} · {formatPct(quote.changePercent)}
        </span>
        <span className="text-muted">{quote.source}</span>
      </div>
    </button>
  );
}
