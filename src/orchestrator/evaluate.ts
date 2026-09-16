import type { StructuredAnalysis } from "@/guardrails";
import type { MarketQuote } from "@/data/market/types";

export type EvalVerdict = {
  schemaOk: boolean;
  warnings: string[];
};

export function evaluateAnalysis(
  raw: string,
  structured: StructuredAnalysis | null,
  quote: MarketQuote,
): EvalVerdict {
  const warnings: string[] = [];
  if (!structured) {
    return { schemaOk: false, warnings: ["خروجی ساخت‌یافته با اسکیما جور نشد."] };
  }

  const entry = structured.tradeSetup.entry;
  if (quote.price > 0 && entry > 0) {
    const drift = Math.abs(entry - quote.price) / quote.price;
    if (drift > 0.35) {
      warnings.push(
        `ورود پیشنهادی از چاپ زنده (${quote.price} ${quote.unit}) بیش از ۳۵٪ فاصله دارد. چاپ زنده را مبنا بگیر، نه رقم تخیل.`,
      );
    }
  }

  if (quote.freshness === "unavailable" || quote.price <= 0) {
    warnings.push("چاپ زنده قطع است. ستاپ قیمتی معتبر نیست.");
  }

  if (!raw.includes("{")) {
    return { schemaOk: false, warnings };
  }

  return { schemaOk: true, warnings };
}
