import { rag } from "@/rag";
import { knowledge } from "@/knowledge";
import { QUANT_SYSTEM, completeXai } from "@/llm";
import { guardInbound, parseStructured } from "@/guardrails";
import type { MarketQuote, Technicals } from "@/data/market/types";

export type OrchestratorResult =
  | {
      ok: true;
      text: string;
      structured: ReturnType<typeof parseStructured>;
      model: string;
      guardrail: "pass";
    }
  | { ok: false; error: string; guardrail?: string };

export async function runQuantGraph(input: {
  question: string;
  quote: MarketQuote;
  tech: Technicals;
}): Promise<OrchestratorResult> {
  const inbound = guardInbound(input.question);
  if (!inbound.ok) {
    return { ok: false, error: "درخواست رد شد (گارد).", guardrail: inbound.reason };
  }

  const ragNote = rag.enabled ? "rag-on" : "rag-disabled";
  const knowledgeNote = knowledge.enabled ? "knowledge-on" : "knowledge-disabled";

  const user = [
    `دارایی: ${input.quote.persianName} (${input.quote.symbol})`,
    `قیمت زنده: ${input.quote.price} ${input.quote.unit}`,
    `تغییر: ${input.quote.changePercent}% | high ${input.quote.high} | low ${input.quote.low}`,
    `منبع: ${input.quote.source} | تازگی: ${input.quote.freshness}`,
    `RSI ${input.tech.rsi} | EMA20 ${input.tech.ema20.toFixed(2)} | EMA50 ${input.tech.ema50.toFixed(2)} | ATR ${input.tech.atr.toFixed(2)} | مومنتوم ${input.tech.momentum}`,
    `لایه دانش: ${knowledgeNote} | RAG: ${ragNote}`,
    `سؤال کاربر: ${inbound.text || "تحلیل ساختار بازار و سناریوی معامله."}`,
    "خروجی را JSON ساخت‌یافته مطابق اسکیما بده، بعد یک خلاصه فارسی کوتاه.",
  ].join("\n");

  const llm = await completeXai({ system: QUANT_SYSTEM, user, maxTokens: 900 });
  if (!llm.ok) return { ok: false, error: llm.error };

  return {
    ok: true,
    text: llm.text,
    structured: parseStructured(llm.text),
    model: llm.model,
    guardrail: "pass",
  };
}
