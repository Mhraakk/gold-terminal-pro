import assert from "node:assert/strict";
import { test } from "node:test";
import { buildMazaneh, theoretical18k, TROY_OZ_G } from "./mazaneh.ts";
import type { MarketQuote } from "./types.ts";

function q(id: MarketQuote["id"], price: number): MarketQuote {
  return {
    id,
    persianName: id,
    symbol: id,
    unit: "toman",
    quoteUnit: id === "XAUUSD" ? "usd" : "toman",
    decimals: 0,
    price,
    raw: price,
    high: price,
    low: price,
    change: 0,
    changePercent: 0,
    source: "test",
    fetchedAt: 0,
    sourceTs: null,
    freshness: "live",
  };
}

test("theoretical 18k is (XAU / 31.1034768) * 0.75 * USD", () => {
  const got = theoretical18k(2000, 100_000);
  const want = (2000 / TROY_OZ_G) * 0.75 * 100_000;
  assert.equal(got, want);
});

test("unknown when ounce, dollar or 18k missing", () => {
  const desk = buildMazaneh([q("XAUUSD", 2000), q("USDIRT", 100_000)]);
  assert.equal(desk.verdict, "unknown");
  assert.equal(desk.live18k, 0);
});

test("cheap when live 18k is below theoretical", () => {
  const theoretical = theoretical18k(2000, 100_000);
  const desk = buildMazaneh([
    q("XAUUSD", 2000),
    q("USDIRT", 100_000),
    q("GOLD_18K", theoretical * 0.97),
    q("USDTIRT", 99_000),
    q("MELTED_GOLD", theoretical * 0.97 * 4.3318),
  ]);
  assert.equal(desk.verdict, "cheap");
  assert.ok(desk.usdUsdtSpread > 0);
});

test("expensive when live 18k is above theoretical", () => {
  const theoretical = theoretical18k(2000, 100_000);
  const desk = buildMazaneh([
    q("XAUUSD", 2000),
    q("USDIRT", 100_000),
    q("GOLD_18K", theoretical * 1.02),
  ]);
  assert.equal(desk.verdict, "expensive");
});
