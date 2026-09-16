import { detectInjection } from "./injection";
import { redactPii } from "./pii";
import { analysisSchema, type StructuredAnalysis } from "./schema";

export { analysisSchema, type StructuredAnalysis };

export type GuardVerdict = {
  ok: boolean;
  reason?: string;
  text: string;
};

export function guardInbound(text: string): GuardVerdict {
  const clean = redactPii(text).slice(0, 1200);
  if (detectInjection(clean)) {
    return { ok: false, reason: "injection", text: clean };
  }
  return { ok: true, text: clean };
}

export function parseStructured(raw: string): StructuredAnalysis | null {
  const fence = raw.match(/\{[\s\S]*\}/);
  if (!fence) return null;
  try {
    const parsed = JSON.parse(fence[0]);
    const result = analysisSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}
