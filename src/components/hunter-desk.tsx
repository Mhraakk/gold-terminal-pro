import { FrameCard } from "@/components/frame";
import { formatPct, formatPrice, formatSigned } from "@/lib/format";
import type { MazanehDesk } from "@/data/market/types";

const VERDICT = {
  cheap: "ارزان‌تر از مظنه",
  fair: "نزدیک مظنه",
  expensive: "گران‌تر از مظنه",
  unknown: "نامشخص",
} as const;

export function HunterDesk({ mazaneh }: { mazaneh: MazanehDesk }) {
  return (
    <FrameCard className="p-5">
      <p className="label-tech">MAZANEH HUNTER</p>
      <h3 className="mt-1 text-lg font-light">شکار مظنه</h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{mazaneh.note}</p>
      <p className="mt-4 text-2xl font-light text-gold">{VERDICT[mazaneh.verdict]}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="اونس جهانی" value={`${formatPrice(mazaneh.ounceUsd, 2)} $`} />
        <Cell label="دلار آزاد" value={formatPrice(mazaneh.usdToman)} />
        <Cell label="گرم ۱۸ تئوریک" value={formatPrice(mazaneh.theoretical18k)} />
        <Cell label="گرم ۱۸ زنده" value={formatPrice(mazaneh.live18k)} />
        <Cell label="اسپرد" value={`${formatSigned(mazaneh.spreadToman)} · ${formatPct(mazaneh.spreadPercent)}`} />
        <Cell label="مثقال آب‌شده" value={formatPrice(mazaneh.meltedMesghal)} />
      </dl>
      <p className="mt-6 text-xs text-muted">
        مظنهٔ تئوریک = (اونس ÷ ۳۱٫۱۰۳۵) × ۰٫۷۵ × دلار آزاد. اگر منبعی قطع باشد، حکم صادر نمی‌شود.
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
