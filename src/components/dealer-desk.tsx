import { FrameCard } from "@/components/frame";
import { formatPct, formatPrice } from "@/lib/format";
import type { MazanehDesk } from "@/data/market/types";

export function DealerDesk({ mazaneh }: { mazaneh: MazanehDesk }) {
  const live = mazaneh.verdict !== "unknown" && mazaneh.live18k > 0 && mazaneh.ounceUsd > 0;
  const abs = Math.abs(mazaneh.spreadPercent);
  const p = live ? Math.min(0.72, Math.max(0.51, 0.5 + abs / 80)) : 0;
  const b = 2;
  const q = 1 - p;
  const kelly = live ? Math.max(0, (p * b - q) / b) : 0;
  const half = kelly * 0.5;
  const bias =
    mazaneh.verdict === "cheap" ? "خرید محتاط" : mazaneh.verdict === "expensive" ? "فروش / صبر" : "بدون حکم";

  return (
    <FrameCard className="p-5">
      <p className="label-tech">DEALER DESK · HALF KELLY</p>
      <h3 className="mt-1 text-lg font-light">میز دیلر مظنه</h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        سایز فقط از اسپرد زندهٔ اونس×دلار در برابر گرم ۱۸ ساخته می‌شود. اگر منبعی قطع باشد حکم صادر نمی‌شود. Kelly
        کسری از دفتر است، نه قیمت.
      </p>
      <p className="mt-4 text-2xl font-light text-gold">{bias}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Cell label="اسپرد" value={live ? formatPct(mazaneh.spreadPercent) : "—"} />
        <Cell label="احتمال ضمنی p" value={live ? formatPct(p * 100) : "—"} />
        <Cell label="Kelly کامل" value={live ? formatPct(kelly * 100) : "—"} />
        <Cell label="نیم‌کلی دفتر" value={live ? formatPct(half * 100) : "—"} />
      </dl>
      <p className="mt-6 text-xs text-muted">
        RR فرضی ۱:۲ · f* = (p·b − q) / b · نیم‌کلی برای تهران. ورود پیشنهادی نزدیک گرم ۱۸ زنده{" "}
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
