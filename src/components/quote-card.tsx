import { Link } from "@tanstack/react-router";
import { NssCard } from "@/components/nss-card";
import { NdStamp } from "@/components/number-details";
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

export function QuoteCard({ quote, index }: { quote: MarketQuote; index?: number }) {
  const up = quote.changePercent > 0;
  const down = quote.changePercent < 0;
  const dead = quote.freshness === "unavailable" || quote.price <= 0;
  const still = stillForAsset(quote.id);
  return (
    <Link to="/" search={{ desk: "atelier" }} className="nss-link block">
      <NssCard tile stamp={index != null ? <NdStamp index={index} /> : null}>
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
          <div className="nss-plate-veil" />
        </div>
        <p className="nss-label">{quote.symbol}</p>
        <p className="nss-body">{quote.persianName}</p>
        <p className={cn("num text-2xl", dead ? "text-[#525252]" : "text-[#FAFAFA]")}>
          {formatPrice(quote.price, quote.decimals)}
        </p>
        <p className="nss-meta">
          {FRESH[quote.freshness]} · {quote.unit}
        </p>
        <p className={cn("nss-meta", up && "text-up", down && "text-down")}>
          {formatSigned(quote.change, quote.decimals)} · {formatPct(quote.changePercent)}
        </p>
      </NssCard>
    </Link>
  );
}
