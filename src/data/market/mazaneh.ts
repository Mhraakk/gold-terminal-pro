import type { MarketQuote, MazanehDesk } from "./types";

export const TROY_OZ_G = 31.1034768;
export const MESGHAL_FROM_18K = 4.3318;

export function emptyMazaneh(): MazanehDesk {
  return {
    theoretical18k: 0,
    live18k: 0,
    spreadToman: 0,
    spreadPercent: 0,
    ounceUsd: 0,
    usdToman: 0,
    usdtToman: 0,
    usdUsdtSpread: 0,
    usdUsdtPercent: 0,
    meltedMesghal: 0,
    impliedMesghal: 0,
    meltGap: 0,
    verdict: "unknown",
    note: "دادهٔ کافی برای مظنه نیست.",
  };
}

export function theoretical18k(ounceUsd: number, usdToman: number): number {
  return (ounceUsd / TROY_OZ_G) * 0.75 * usdToman;
}

export function buildMazaneh(quotes: MarketQuote[]): MazanehDesk {
  const xau = quotes.find((q) => q.id === "XAUUSD");
  const usd = quotes.find((q) => q.id === "USDIRT");
  const usdt = quotes.find((q) => q.id === "USDTIRT");
  const g18 = quotes.find((q) => q.id === "GOLD_18K");
  const melt = quotes.find((q) => q.id === "MELTED_GOLD") ?? quotes.find((q) => q.id === "MESGHAL");

  const ounceUsd = xau && xau.price > 0 ? xau.price : 0;
  const usdToman = usd && usd.price > 0 ? usd.price : 0;
  const usdtToman = usdt && usdt.price > 0 ? usdt.price : 0;
  const live18k = g18 && g18.price > 0 ? g18.price : 0;

  if (!ounceUsd || !usdToman || !live18k) {
    return {
      ...emptyMazaneh(),
      ounceUsd,
      usdToman,
      usdtToman,
      usdUsdtSpread: usdtToman ? usdToman - usdtToman : 0,
      usdUsdtPercent: usdtToman ? ((usdToman - usdtToman) / usdtToman) * 100 : 0,
    };
  }

  const theoretical = theoretical18k(ounceUsd, usdToman);
  const spreadToman = live18k - theoretical;
  const spreadPercent = (spreadToman / theoretical) * 100;
  const impliedMesghal = live18k * MESGHAL_FROM_18K;
  const meltedMesghal = melt?.price ?? 0;
  const meltGap = meltedMesghal > 0 ? meltedMesghal - impliedMesghal : 0;
  const usdUsdtSpread = usdtToman ? usdToman - usdtToman : 0;
  const usdUsdtPercent = usdtToman ? (usdUsdtSpread / usdtToman) * 100 : 0;
  const abs = Math.abs(spreadPercent);
  const verdict: MazanehDesk["verdict"] =
    abs < 0.6 ? "fair" : spreadPercent > 0 ? "expensive" : "cheap";
  const note =
    verdict === "fair"
      ? "گرم ۱۸ عیار نزدیک مظنهٔ تئوریک اونس×دلار است."
      : verdict === "expensive"
        ? "طلای داخلی از مظنهٔ جهانی گران‌تر است — حباب مثبت."
        : "طلای داخلی از مظنهٔ جهانی ارزان‌تر است — حباب منفی.";
  return {
    theoretical18k: theoretical,
    live18k,
    spreadToman,
    spreadPercent,
    ounceUsd,
    usdToman,
    usdtToman,
    usdUsdtSpread,
    usdUsdtPercent,
    meltedMesghal,
    impliedMesghal,
    meltGap,
    verdict,
    note,
  };
}
