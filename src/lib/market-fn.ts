import { createServerFn } from "@tanstack/react-start";
import { loadMarketSnapshot, structureCandles } from "@/data/market/fetch";
import { structure, technicals } from "@/data/market/indicators";
import { allowAiCall, analyzeInput, logGateway, newRequestId, parseAssetId } from "@/gateway";
import { runQuantGraph } from "@/orchestrator";
import type { AssetId } from "@/data/market/types";

export const getMarketFn = createServerFn({ method: "GET" }).handler(async () => {
  const started = Date.now();
  const requestId = newRequestId();
  const snap = await loadMarketSnapshot();
  logGateway({
    requestId,
    route: "market.snapshot",
    ok: true,
    latencyMs: Date.now() - started,
    detail: `${snap.quotes.length} quotes`,
  });
  return snap;
});

export const getChartFn = createServerFn({ method: "POST" })
  .validator((input: { assetId: AssetId }) => input)
  .handler(async ({ data }) => {
    const snap = await loadMarketSnapshot();
    const quote = snap.quotes.find((q) => q.id === data.assetId) ?? snap.quotes[0];
    const pack = structureCandles(quote);
    return {
      quote,
      candles: pack.candles,
      synthetic: pack.synthetic,
      tech: technicals(pack.candles),
      structure: structure(pack.candles),
    };
  });

export const analyzeFn = createServerFn({ method: "POST" })
  .validator((input: unknown) => analyzeInput.parse(input))
  .handler(async ({ data }) => {
    const started = Date.now();
    const requestId = newRequestId();
    const limit = allowAiCall();
    if (!limit.allowed) {
      logGateway({ requestId, route: "quant.analyze", ok: false, latencyMs: Date.now() - started, guardrail: "rate" });
      return { ok: false as const, error: "سقف درخواست کوانت در این دقیقه پر شد." };
    }
    const assetId = parseAssetId(data.assetId);
    const snap = await loadMarketSnapshot();
    const quote = snap.quotes.find((q) => q.id === assetId);
    if (!quote || quote.price <= 0) {
      return { ok: false as const, error: "قیمت زنده برای این دارایی در دسترس نیست." };
    }
    const pack = structureCandles(quote);
    const result = await runQuantGraph({
      question: data.question ?? "تحلیل ساختار و سناریوی معامله",
      quote,
      tech: technicals(pack.candles),
    });
    logGateway({
      requestId,
      route: "quant.analyze",
      ok: result.ok,
      latencyMs: Date.now() - started,
      model: result.ok ? result.model : undefined,
      guardrail: result.ok ? result.guardrail : result.guardrail,
    });
    return result;
  });
