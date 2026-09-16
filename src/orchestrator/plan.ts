import type { AssetId } from "@/data/market/types";

export type ToolName = "quote" | "structure" | "mazaneh" | "kelly" | "memory";

const MAZANEH_RE = /مظنه|mazaneh|شکار|دیلر|arb|اونس|دلار آزاد|آب‌شده|آبشده|گرم ۱۸|18k/i;
const KELLY_RE = /kelly|کلی|حجم|سایز|پوزیشن|ورود|حد ضرر|ستاپ|setup|تحلیل|ساختار|سناریو/i;

export function planTools(question: string, assetId: AssetId): ToolName[] {
  const tools = new Set<ToolName>(["quote", "structure", "memory"]);
  const fx = assetId === "USDIRT" || assetId === "USDTIRT";
  if (!fx || MAZANEH_RE.test(question)) tools.add("mazaneh");
  if (KELLY_RE.test(question)) tools.add("kelly");
  return [...tools];
}
