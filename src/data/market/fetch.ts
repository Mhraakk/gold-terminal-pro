import { cache } from "@/data/cache";
import { ASSETS } from "./assets";
import { freshnessFromTs, parseNumber, rialToToman } from "./parse";
import type { Freshness, MarketQuote, MarketSnapshot, MazanehDesk } from "./types";

const TGJU = "https://call5.tgju.org/ajax.json";
const GOLD_API = "https://api.gold-api.com/price/XAU";
const TROY_OZ_G = 31.1034768;
const MESGHAL_FROM_18K = 4.3318;

type TgjuRow = { p?: string; h?: string; l?: string; d?: string; dp?: number; ts?: string };

interface TgjuPayload {
  current?: Record<string, TgjuRow>;
}

function emptyMazaneh(): MazanehDesk {
  return {
    theoretical18k: 0,
    live18k: 0,
    spreadToman: 0,
    spreadPercent: 0,
    ounceUsd: 0,
    usdToman: 0,
    meltedMesghal: 0,
    impliedMesghal: 0,
    verdict: "unknown",
    note: "دادهٔ کافی برای مظنه نیست.",
  };
}

function buildMazaneh(quotes: MarketQuote[]): MazanehDesk {
  const xau = quotes.find((q) => q.id === "XAUUSD");
  const usd = quotes.find((q) => q.id === "USDIRT");
  const g18 = quotes.find((q) => q.id === "GOLD_18K");
  const melt = quotes.find((q) => q.id === "MELTED_GOLD") ?? quotes.find((q) => q.id === "MESGHAL");
  if (!xau || !usd || !g18 || xau.price <= 0 || usd.price <= 0 || g18.price <= 0) {
    return emptyMazaneh();
  }
  const theoretical18k = (xau.price / TROY_OZ_G) * 0.75 * usd.price;
  const spreadToman = g18.price - theoretical18k;
  const spreadPercent = (spreadToman / theoretical18k) * 100;
  const impliedMesghal = g18.price * MESGHAL_FROM_18K;
  const meltedMesghal = melt?.price ?? 0;
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
    theoretical18k,
    live18k: g18.price,
    spreadToman,
    spreadPercent,
    ounceUsd: xau.price,
    usdToman: usd.price,
    meltedMesghal,
    impliedMesghal,
    verdict,
    note,
  };
}

async function fetchTgju(): Promise<{ ok: boolean; current: Record<string, TgjuRow>; detail: string }> {
  try {
    const res = await fetch(TGJU, {
      headers: { "User-Agent": "ZarinTerminal/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, current: {}, detail: `tgju ${res.status}` };
    const body = (await res.json()) as TgjuPayload;
    const current = body.current ?? {};
    return { ok: true, current, detail: `${Object.keys(current).length} keys` };
  } catch (err) {
    return { ok: false, current: {}, detail: err instanceof Error ? err.message : "tgju fail" };
  }
}

async function fetchXauFallback(): Promise<number | null> {
  try {
    const res = await fetch(GOLD_API, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const body = (await res.json()) as { price?: number };
    return typeof body.price === "number" ? body.price : null;
  } catch {
    return null;
  }
}

export async function loadMarketSnapshot(): Promise<MarketSnapshot> {
  const cached = cache.get<MarketSnapshot>("market:snapshot");
  if (cached) return cached;

  const fetchedAt = Date.now();
  const tgju = await fetchTgju();
  const quotes: MarketQuote[] = [];

  for (const meta of ASSETS) {
    const row = tgju.current[meta.tgjuKey];
    const raw = parseNumber(row?.p);
    if (raw == null || raw <= 0) {
      quotes.push({
        id: meta.id,
        persianName: meta.persianName,
        symbol: meta.symbol,
        unit: meta.unit,
        quoteUnit: meta.quoteUnit,
        decimals: meta.decimals,
        price: 0,
        raw: 0,
        high: 0,
        low: 0,
        change: 0,
        changePercent: 0,
        source: "tgju",
        fetchedAt,
        sourceTs: row?.ts ?? null,
        freshness: "unavailable",
      });
      continue;
    }
    const high = parseNumber(row?.h) ?? raw;
    const low = parseNumber(row?.l) ?? raw;
    const changeRaw = parseNumber(row?.d) ?? 0;
    const price = meta.quoteUnit === "toman" ? rialToToman(raw) : raw;
    const highD = meta.quoteUnit === "toman" ? rialToToman(high) : high;
    const lowD = meta.quoteUnit === "toman" ? rialToToman(low) : low;
    const change = meta.quoteUnit === "toman" ? rialToToman(changeRaw) : changeRaw;
    quotes.push({
      id: meta.id,
      persianName: meta.persianName,
      symbol: meta.symbol,
      unit: meta.unit,
      quoteUnit: meta.quoteUnit,
      decimals: meta.decimals,
      price,
      raw,
      high: highD,
      low: lowD,
      change,
      changePercent: parseNumber(row?.dp) ?? (typeof row?.dp === "number" ? row.dp : 0),
      source: "tgju",
      fetchedAt,
      sourceTs: row?.ts ?? null,
      freshness: freshnessFromTs(row?.ts ?? null, fetchedAt),
    });
  }

  const xau = quotes.find((q) => q.id === "XAUUSD");
  if (!xau || xau.price <= 0) {
    const fallback = await fetchXauFallback();
    if (fallback && xau) {
      xau.price = fallback;
      xau.raw = fallback;
      xau.source = "gold-api";
      xau.freshness = "live";
      xau.sourceTs = new Date(fetchedAt).toISOString();
    }
  }

  const sources = [
    { name: "TGJU", ok: tgju.ok, detail: tgju.detail },
    {
      name: "Gold API",
      ok: Boolean(quotes.find((q) => q.id === "XAUUSD" && q.price > 0)),
      detail: quotes.find((q) => q.id === "XAUUSD")?.source ?? "missing",
    },
  ];

  const snapshot: MarketSnapshot = {
    quotes,
    mazaneh: buildMazaneh(quotes),
    fetchedAt,
    sources,
    requestId: `mkt-${fetchedAt.toString(36)}`,
  };
  cache.set("market:snapshot", snapshot, 20_000);
  return snapshot;
}

export function structureCandles(quote: MarketQuote, count = 72): {
  candles: { time: string; open: number; high: number; low: number; close: number; volume: number }[];
  synthetic: true;
} {
  const candles = [];
  const base = quote.price > 0 ? quote.price : 1;
  const now = quote.fetchedAt;
  let price = base * 0.985;
  for (let i = 0; i < count; i++) {
    const t = new Date(now - (count - i) * 60 * 60 * 1000).toISOString();
    const wave = Math.sin(i / 9) * 0.004 + Math.cos(i / 17) * 0.002;
    const drift = ((i / count) * (base - price * 0.2)) / base;
    const mid = base * (0.982 + drift * 0.018 + wave);
    const spread = mid * 0.0032;
    const open = mid + (i % 3 === 0 ? -spread * 0.2 : spread * 0.15);
    const close = i === count - 1 ? base : mid + wave * mid * 0.15;
    const high = Math.max(open, close) + spread * 0.45;
    const low = Math.min(open, close) - spread * 0.4;
    candles.push({
      time: t,
      open,
      high,
      low,
      close,
      volume: 1200 + Math.abs(close - open) * 40,
    });
    price = close;
  }
  return { candles, synthetic: true };
}
