import type { Candle, MarketStructure, Technicals } from "./types";

export function rsi(candles: Candle[], period = 14): number {
  if (candles.length < period + 1) return 50;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gain += diff;
    else loss -= diff;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Math.round(100 - 100 / (1 + rs));
}

export function ema(candles: Candle[], period: number): number {
  if (candles.length === 0) return 0;
  const k = 2 / (period + 1);
  let value = candles[0].close;
  for (let i = 1; i < candles.length; i++) value = candles[i].close * k + value * (1 - k);
  return value;
}

export function atr(candles: Candle[], period = 14): number {
  if (candles.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const hi = candles[i].high;
    const lo = candles[i].low;
    const prev = candles[i - 1].close;
    trs.push(Math.max(hi - lo, Math.abs(hi - prev), Math.abs(lo - prev)));
  }
  const slice = trs.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

export function vwap(candles: Candle[]): number {
  let pv = 0;
  let vol = 0;
  for (const c of candles) {
    pv += ((c.high + c.low + c.close) / 3) * c.volume;
    vol += c.volume;
  }
  return vol === 0 ? 0 : pv / vol;
}

export function technicals(candles: Candle[]): Technicals {
  const r = rsi(candles);
  const e20 = ema(candles, 20);
  const e50 = ema(candles, 50);
  const last = candles.at(-1)?.close ?? 0;
  const momentum =
    r >= 58 && e20 >= e50 ? "bullish" : r <= 42 && e20 <= e50 ? "bearish" : "neutral";
  const trendStrength = Math.min(100, Math.abs(e20 - e50) / Math.max(last, 1) * 4000 + Math.abs(r - 50));
  return { rsi: r, ema20: e20, ema50: e50, atr: atr(candles), vwap: vwap(candles), momentum, trendStrength };
}

export function structure(candles: Candle[]): MarketStructure {
  const closes = candles.map((c) => c.close);
  const last = closes.at(-1) ?? 0;
  const sorted = [...closes].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.2)] ?? last;
  const q3 = sorted[Math.floor(sorted.length * 0.8)] ?? last;
  const e20 = ema(candles, 20);
  const e50 = ema(candles, 50);
  const trend = e20 > e50 * 1.002 ? "BULLISH" : e20 < e50 * 0.998 ? "BEARISH" : "NEUTRAL";
  return { trend, support: [q1, Math.min(q1, last * 0.992)], resistance: [q3, Math.max(q3, last * 1.008)] };
}
