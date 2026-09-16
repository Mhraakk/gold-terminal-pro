import { cache } from "@/data/cache";

const WINDOW_MS = 60_000;
const MAX_AI = 8;

export function allowAiCall(bucket = "anon"): { allowed: boolean; remaining: number } {
  const key = `rl:ai:${bucket}:${Math.floor(Date.now() / WINDOW_MS)}`;
  const used = cache.get<number>(key) ?? 0;
  if (used >= MAX_AI) return { allowed: false, remaining: 0 };
  cache.set(key, used + 1, WINDOW_MS);
  return { allowed: true, remaining: MAX_AI - used - 1 };
}
