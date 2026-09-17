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
  const dollarLive = mazaneh.usdToman > 0 && mazaneh.usdtToman > 0;
  const meltLive = mazaneh.meltedMesghal > 0 && mazaneh.impliedMesghal > 0;
  return (
    <FrameCard className="p-5">
      <p className="label-tech">MAZANEH HUNTER</p>
      <h3 className="mt-1 text-lg font-light">شکار مظنه</h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">{mazaneh.note}</p>
      <p className="mt-4 text-2xl font-light text-gold">{VERDICT[mazaneh.verdict]}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Cell label="اونس جهانی" value={mazaneh.ounceUsd > 0 ? `${formatPrice(mazaneh.ounceUsd, 2)} $` : "قطع"} />
        <Cell label="دلار آزاد" value={mazaneh.usdToman > 0 ? formatPrice(mazaneh.usdToman) : "قطع"} />
        <Cell label="گرم ۱۸ تئوریک" value={mazaneh.theoretical18k > 0 ? formatPrice(mazaneh.theoretical18k) : "—"} />
        <Cell label="گرم ۱۸ زنده" value={mazaneh.live18k > 0 ? formatPrice(mazaneh.live18k) : "قطع"} />
        <Cell
          label="اسپرد ۱۸"
          value={mazaneh.verdict === "unknown" ? "—" : `${formatSigned(mazaneh.spreadToman)} · ${formatPct(mazaneh.spreadPercent)}`}
        />
        <Cell label="مثقال آب‌شده" value={mazaneh.meltedMesghal > 0 ? formatPrice(mazaneh.meltedMesghal) : "قطع"} />
        <Cell
          label="آرب دلار / تتر"
          value={dollarLive ? `${formatSigned(mazaneh.usdUsdtSpread)} · ${formatPct(mazaneh.usdUsdtPercent)}` : "قطع"}
        />
        <Cell
          label="گپ آب‌شده / مثقال ۱۸"
          value={meltLive ? `${formatSigned(mazaneh.meltGap)}` : "قطع"}
        />
      </dl>
      <p className="mt-6 text-xs text-muted">
        مظنهٔ تئوریک = (اونس ÷ ۳۱٫۱۰۳۵) × ۰٫۷۵ × دلار آزاد. حکم فقط وقتی اونس، دلار و گرم ۱۸ هر سه زنده‌اند صادر می‌شود.
        آرب دلار آزاد و تتر چاپ بازار تهران است، نه جایگزین قیمت.
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
