import { Link } from "@tanstack/react-router";
import { ModuleShell } from "@/components/module-shell";
import { stillForAsset } from "@/data/aura";
import { cn } from "@/lib/cn";
import { formatPct, formatPrice, formatSigned } from "@/lib/format";
import type { MarketQuote } from "@/data/market/types";

const FRESH: Record<MarketQuote["freshness"], string> = {
  live: "زنده",
  delayed: "تأخیر",
  stale: "کهنه",
  unavailable: "قطع",
};

export function QuoteCard({ quote }: { quote: MarketQuote }) {
  const up = quote.changePercent > 0;
  const down = quote.changePercent < 0;
  const dead = quote.freshness === "unavailable" || quote.price <= 0;
  const still = stillForAsset(quote.id);
  return (
    <Link to="/" search={{ desk: "terminal", asset: quote.id }} className="block">
      <ModuleShell>
        <div className="relative h-32">
          <img
            src={still.src}
            alt={still.alt}
            width={1600}
            height={900}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/55 to-black/20" />
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm">{quote.persianName}</p>
              <p className="label-tech mt-2">{quote.symbol}</p>
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
          <p className={cn("num text-2xl", dead ? "text-[#A3A3A3]" : "text-[#EDEDED]")}>
            {formatPrice(quote.price, quote.decimals)}
          </p>
          <p className="mt-2 text-xs text-[#A3A3A3]">{quote.unit}</p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className={cn("num", up && "text-up", down && "text-down", !up && !down && "text-[#A3A3A3]")}>
              {formatSigned(quote.change, quote.decimals)} · {formatPct(quote.changePercent)}
            </span>
            <span className="text-[#A3A3A3]">{quote.source}</span>
          </div>
        </div>
      </ModuleShell>
    </Link>
  );
}
