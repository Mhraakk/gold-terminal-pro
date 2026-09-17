import { useEffect, useMemo, useState } from "react";
import { FrameCard } from "@/components/frame";
import { formatPct, formatPrice } from "@/lib/format";
import { loadPositions } from "@/lib/desk-store";
import type { MarketQuote, MazanehDesk } from "@/data/market/types";

export function DealerDesk({ mazaneh, quotes }: { mazaneh: MazanehDesk; quotes: MarketQuote[] }) {
  const [book, setBook] = useState(0);
  useEffect(() => {
    const live = Object.fromEntries(quotes.map((q) => [q.id, q.price]));
    const value = loadPositions().reduce((sum, p) => {
      const px = live[p.assetId] || p.entry;
      return sum + px * p.qty;
    }, 0);
    setBook(value);
  }, [quotes]);

  const live = mazaneh.verdict !== "unknown" && mazaneh.live18k > 0 && mazaneh.ounceUsd > 0;
  const abs = Math.abs(mazaneh.spreadPercent);
  const p = live ? Math.min(0.72, Math.max(0.51, 0.5 + abs / 80)) : 0;
  const b = 2;
  const q = 1 - p;
  const kelly = live ? Math.max(0, (p * b - q) / b) : 0;
  const half = kelly * 0.5;
  const size = book > 0 ? half * book : 0;
  const bias =
    mazaneh.verdict === "cheap" ? "خرید محتاط" : mazaneh.verdict === "expensive" ? "فروش / صبر" : "بدون حکم";

  const note = useMemo(() => {
    if (!live) return "منبع کافی نیست — حکم صادر نمی‌شود.";
    if (book <= 0) return "دفتر خالی است. نیم‌کلی کسری است؛ اول پوزیشن ثبت کن.";
    return `نیم‌کلی روی دفتر زنده ≈ ${formatPrice(size)} تومان.`;
  }, [live, book, size]);

  return (
    <FrameCard className="p-5">
      <p className="label-tech">DEALER DESK · HALF KELLY</p>
      <h3 className="mt-1 text-lg font-light">میز دیلر مظنه</h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{note}</p>
      <p className="mt-4 text-2xl font-light text-gold">{bias}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cell label="اسپرد" value={live ? formatPct(mazaneh.spreadPercent) : "—"} />
        <Cell label="احتمال ضمنی p" value={live ? formatPct(p * 100) : "—"} />
        <Cell label="نیم‌کلی" value={live ? formatPct(half * 100) : "—"} />
        <Cell label="سایز دفتر" value={book > 0 && live ? formatPrice(size) : "—"} />
      </dl>
      <p className="mt-6 text-xs text-muted">
        RR فرضی ۱:۲ · f* = (p·b − q) / b · نیم‌کلی کسری از دفتر همین دستگاه است، نه جایگزین قیمت زنده. گرم ۱۸ زنده{" "}
        {formatPrice(mazaneh.live18k)} در برابر تئوریک {formatPrice(mazaneh.theoretical18k)}.
      </p>
    </FrameCard>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="well p-3">
      <dt className="label-tech">{label}</dt>
      <dd className="num mt-2 text-lg text-fg">{value}</dd>
    </div>
  );
}
