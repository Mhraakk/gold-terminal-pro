import { z } from "zod";
import { ASSET_BY_ID } from "@/data/market/assets";
import type { AssetId } from "@/data/market/types";

export const analyzeInput = z.object({
  assetId: z.string(),
  question: z.string().max(800).optional(),
  mode: z.enum(["structure", "chat"]).default("structure"),
});

export type AnalyzeInput = z.infer<typeof analyzeInput>;

export function parseAssetId(id: string): AssetId {
  if (id in ASSET_BY_ID) return id as AssetId;
  throw new Error("unknown asset");
}
