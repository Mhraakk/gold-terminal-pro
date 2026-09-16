export type AssetId =
  | "MELTED_GOLD"
  | "GOLD_18K"
  | "GOLD_24K"
  | "MESGHAL"
  | "COIN_EMAMI"
  | "COIN_HALF"
  | "COIN_QUARTER"
  | "COIN_GERAMI"
  | "GOLD_GRAM"
  | "USDIRT"
  | "USDTIRT"
  | "XAUUSD";

export type QuoteUnit = "toman" | "usd";

export type Freshness = "live" | "delayed" | "stale" | "unavailable";

export interface AssetMeta {
  id: AssetId;
  name: string;
  persianName: string;
  symbol: string;
  unit: string;
  quoteUnit: QuoteUnit;
  decimals: number;
  tgjuKey: string;
}

export interface MarketQuote {
  id: AssetId;
  persianName: string;
  symbol: string;
  unit: string;
  quoteUnit: QuoteUnit;
  decimals: number;
  /** Display price (toman for IRR assets, USD for XAU). */
  price: number;
  raw: number;
  high: number;
  low: number;
  change: number;
  changePercent: number;
  source: string;
  fetchedAt: number;
  sourceTs: string | null;
  freshness: Freshness;
}

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Technicals {
  rsi: number;
  ema20: number;
  ema50: number;
  atr: number;
  vwap: number;
  momentum: "bullish" | "bearish" | "neutral";
  trendStrength: number;
}

export interface OrderBlock {
  type: "bullish" | "bearish";
  priceStart: number;
  priceEnd: number;
  status: "active" | "mitigated";
}

export interface FairValueGap {
  type: "bullish" | "bearish";
  high: number;
  low: number;
  status: "open" | "filled";
}

export interface MarketStructure {
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  support: number[];
  resistance: number[];
  orderBlocks: OrderBlock[];
  fvgs: FairValueGap[];
  bos: boolean;
  choch: boolean;
}

export interface MazanehDesk {
  theoretical18k: number;
  live18k: number;
  spreadToman: number;
  spreadPercent: number;
  ounceUsd: number;
  usdToman: number;
  meltedMesghal: number;
  impliedMesghal: number;
  verdict: "cheap" | "fair" | "expensive" | "unknown";
  note: string;
}

export interface MarketSnapshot {
  quotes: MarketQuote[];
  mazaneh: MazanehDesk;
  fetchedAt: number;
  sources: { name: string; ok: boolean; detail: string }[];
  requestId: string;
}
