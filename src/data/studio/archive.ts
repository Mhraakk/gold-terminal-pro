import { fingerprint, jaccard } from "./similarity.ts";
import type { Concept, ConceptStatus, LuxuryLevel, ProductType } from "./types.ts";

export type ArchiveFilter = {
  q?: string;
  status?: ConceptStatus;
  level?: LuxuryLevel;
  type?: ProductType;
};

export function archiveHaystack(concept: Concept): string {
  return [
    concept.title,
    concept.description,
    concept.story,
    concept.path,
    concept.audience,
    concept.usage,
    concept.specs.style,
    concept.fingerprint,
  ].join(" ");
}

/** Substring first; Jaccard on fingerprints if the query is a phrase, not a letter. */
export function matchesQuery(concept: Concept, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (archiveHaystack(concept).toLowerCase().includes(needle)) return true;
  if (needle.length < 2) return false;
  return jaccard(fingerprint([needle]), concept.fingerprint) >= 0.18;
}

export function filterArchive(concepts: Concept[], filter: ArchiveFilter): Concept[] {
  return concepts.filter((concept) => {
    if (filter.status && concept.status !== filter.status) return false;
    if (filter.level && concept.brief.level !== filter.level) return false;
    if (filter.type && concept.brief.productType !== filter.type) return false;
    if (filter.q && !matchesQuery(concept, filter.q)) return false;
    return true;
  });
}
