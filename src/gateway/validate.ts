import { z } from "zod";
import { ASSET_BY_ID } from "@/data/market/assets";
import { LUXURY_LEVELS, PRODUCT_TYPES } from "@/data/studio/types";
import type { AssetId } from "@/data/market/types";

export const analyzeInput = z.object({
  assetId: z.string(),
  question: z.string().max(800).optional(),
  mode: z.enum(["structure", "chat"]).default("structure"),
  memory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(2000),
      }),
    )
    .max(8)
    .optional(),
});

export type AnalyzeInput = z.infer<typeof analyzeInput>;

export const conceptBriefInput = z.object({
  productType: z.enum(PRODUCT_TYPES),
  level: z.enum(LUXURY_LEVELS),
  weightGrams: z.number().min(0.4).max(80),
  karat: z.union([z.literal(18), z.literal(21), z.literal(22), z.literal(24)]),
  occasion: z.string().min(1).max(80),
  notes: z.string().max(600).optional().default(""),
  dna: z
    .object({
      name: z.string(),
      promise: z.string(),
      materials: z.string(),
      silhouette: z.string(),
      forbidden: z.string(),
    })
    .optional(),
  archive: z.array(z.string().max(400)).max(40).optional(),
});

export type ConceptBriefInput = z.infer<typeof conceptBriefInput>;

export function parseAssetId(id: string): AssetId {
  if (id in ASSET_BY_ID) return id as AssetId;
  throw new Error("unknown asset");
}
