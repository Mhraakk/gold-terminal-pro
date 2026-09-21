export { completeXai } from "./providers/xai";
export {
  completeCline2Api,
  isCline2ApiConfigured,
} from "./providers/cline2api";
export { QUANT_SYSTEM, STUDIO_SYSTEM } from "./prompts";

import { completeCline2Api, isCline2ApiConfigured } from "./providers/cline2api";
import { completeXai } from "./providers/xai";

type LlmOpts = { system: string; user: string; maxTokens?: number; temperature?: number };

/** Prefer cline2api-workers when configured; otherwise xAI Grok. Always time-bound. */
export async function completeLlm(opts: LlmOpts) {
  const bound = Promise.race([
    (async () => {
      if (isCline2ApiConfigured()) {
        const viaCline = await completeCline2Api(opts);
        if (viaCline.ok) return viaCline;
      }
      return completeXai(opts);
    })(),
    new Promise<{ ok: false; error: string }>((resolve) => {
      setTimeout(() => resolve({ ok: false, error: "llm-timeout" }), 7000);
    }),
  ]);
  return bound;
}
