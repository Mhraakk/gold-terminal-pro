/** Bag-of-tokens Jaccard. No live embeddings; swap this adapter for a vector store later. */

export const SIMILARITY_LIMIT = 0.72;

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1),
  );
}

export function fingerprint(parts: string[]): string {
  return [...tokens(parts.join(" "))].sort().join("·").slice(0, 180);
}

export function jaccard(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0;
  A.forEach((t) => {
    if (B.has(t)) inter += 1;
  });
  return inter / (A.size + B.size - inter);
}

export function maxSimilarity(candidate: string, corpus: string[]): number {
  if (corpus.length === 0) return 0;
  return Math.max(...corpus.map((c) => jaccard(candidate, c)));
}

/** Drop drafts that collide with the org archive. Never silently keep a twin. */
export function rejectTooClose<T extends { fingerprint: string }>(items: T[], archive: string[]): T[] {
  if (archive.length === 0) return items;
  return items.filter((item) => maxSimilarity(item.fingerprint, archive) <= SIMILARITY_LIMIT);
}
