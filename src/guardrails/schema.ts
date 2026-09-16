import { z } from "zod";

export const analysisSchema = z.object({
  trend: z.enum(["BULLISH", "BEARISH", "CONSOLIDATION"]),
  marketPhase: z.string(),
  confidenceScore: z.number().min(0).max(100),
  supportLevels: z.array(z.number()).max(4),
  resistanceLevels: z.array(z.number()).max(4),
  scenarios: z.object({
    primary: z.string(),
    alternative: z.string(),
    invalidation: z.string(),
  }),
  tradeSetup: z.object({
    entry: z.number(),
    stopLoss: z.number(),
    takeProfit1: z.number(),
    takeProfit2: z.number(),
    riskRewardRatio: z.number(),
  }),
  detailedAnalysisMarkdown: z.string(),
});

export type StructuredAnalysis = z.infer<typeof analysisSchema>;
