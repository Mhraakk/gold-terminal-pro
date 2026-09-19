import { fingerprint } from "@/data/studio/similarity";
import { SEED_COLLECTIONS, SEED_CONCEPTS, SEED_DNA } from "@/data/studio/seed";
import type { BrandDna, Collection, Concept, ConceptStatus, PackageKind } from "@/data/studio/types";

const CONCEPT_KEY = "zarin-studio-concepts-v2";
const DNA_KEY = "zarin-studio-dna-v1";
const COL_KEY = "zarin-studio-collections-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadConcepts(): Concept[] {
  const saved = read<Concept[] | null>(CONCEPT_KEY, null);
  if (saved && saved.length) return saved;
  write(CONCEPT_KEY, SEED_CONCEPTS);
  return SEED_CONCEPTS;
}

export function saveConcepts(next: Concept[]) {
  write(CONCEPT_KEY, next);
}

export function upsertConcept(concept: Concept) {
  const all = loadConcepts();
  const i = all.findIndex((c) => c.id === concept.id);
  if (i >= 0) all[i] = concept;
  else all.unshift(concept);
  saveConcepts(all);
  return all;
}

export function setConceptStatus(id: string, status: ConceptStatus) {
  const all = loadConcepts();
  const hit = all.find((c) => c.id === id);
  if (!hit) return all;
  hit.status = status;
  hit.versions.unshift({ at: Date.now(), note: `وضعیت: ${status}`, title: hit.title });
  hit.version += 1;
  saveConcepts(all);
  return all;
}

export function issuePassport(id: string) {
  const all = loadConcepts();
  const hit = all.find((c) => c.id === id);
  if (!hit) return all;
  const serial = `ZR-${hit.brief.karat}-${hit.at.toString(36).toUpperCase()}`;
  hit.passport = { serial, issuedAt: Date.now() };
  hit.limited ??= { series: hit.path, edition: 1, of: hit.brief.level === "collector" ? 12 : 50 };
  hit.set.architecture.serial ??= serial;
  hit.versions.unshift({ at: Date.now(), note: `شناسنامه ${serial}`, title: hit.title });
  hit.version += 1;
  saveConcepts(all);
  return all;
}

export function selectCompanion(id: string, companionId: string) {
  const all = loadConcepts();
  const hit = all.find((c) => c.id === id);
  if (!hit) return all;
  if (!hit.set.companions.some((x) => x.id === companionId)) return all;
  hit.set.companionId = companionId;
  hit.versions.unshift({ at: Date.now(), note: "انتخاب همراه ست", title: hit.title });
  hit.version += 1;
  saveConcepts(all);
  return all;
}

export function setPackageKind(id: string, kind: PackageKind) {
  const all = loadConcepts();
  const hit = all.find((c) => c.id === id);
  if (!hit) return all;
  hit.set.architecture.kind = kind;
  if (kind === "limited" || kind === "collectible") {
    hit.set.architecture.edition ??= { n: 1, of: hit.brief.level === "collector" ? 12 : 40 };
    hit.set.architecture.serial ??= `PK-${hit.at.toString(36).toUpperCase()}`;
  }
  hit.versions.unshift({ at: Date.now(), note: `گونهٔ پکیج: ${kind}`, title: hit.title });
  hit.version += 1;
  saveConcepts(all);
  return all;
}

export function dedicatePackage(id: string, name: string) {
  const all = loadConcepts();
  const hit = all.find((c) => c.id === id);
  if (!hit) return all;
  const dedicateTo = name.trim();
  if (!dedicateTo) return all;
  hit.set.architecture.kind = "personal";
  hit.set.architecture.dedicateTo = dedicateTo;
  hit.versions.unshift({ at: Date.now(), note: `پکیج شخصی برای ${dedicateTo}`, title: hit.title });
  hit.version += 1;
  saveConcepts(all);
  return all;
}

export function loadDna(): BrandDna {
  const saved = read<BrandDna | null>(DNA_KEY, null);
  if (saved) return saved;
  write(DNA_KEY, SEED_DNA);
  return SEED_DNA;
}

export function saveDna(dna: BrandDna) {
  write(DNA_KEY, dna);
}

export function loadCollections(): Collection[] {
  const saved = read<Collection[] | null>(COL_KEY, null);
  if (saved && saved.length) return saved;
  write(COL_KEY, SEED_COLLECTIONS);
  return SEED_COLLECTIONS;
}

export function saveCollections(next: Collection[]) {
  write(COL_KEY, next);
}

export function conceptCorpus(concepts: Concept[]): string[] {
  return concepts.map((c) => fingerprint([c.title, c.description, c.story, c.specs.style, c.path]));
}
