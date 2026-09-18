export { completeXai } from "./providers/xai";
export {
  completeCline2Api,
  isCline2ApiConfigured,
} from "./providers/cline2api";
export { QUANT_SYSTEM } from "./prompts";

import { completeCline2Api, isCline2ApiConfigured } from "./providers/cline2api";
import { completeXai } from "./providers/xai";

type LlmOpts = { system: string; user: string; maxTokens?: number };

/** Prefer cline2api-workers when configured; otherwise xAI Grok. */
export async function completeLlm(opts: LlmOpts) {
  if (isCline2ApiConfigured()) {
    const viaCline = await completeCline2Api(opts);
    if (viaCline.ok) return viaCline;
    const viaXai = await completeXai(opts);
    if (viaXai.ok) return viaXai;
    return viaCline;
  }
  return completeXai(opts);
}
