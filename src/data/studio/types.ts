export const LUXURY_LEVELS = ["everyday", "signature", "ultra", "collector"] as const;
export type LuxuryLevel = (typeof LUXURY_LEVELS)[number];

export const PRODUCT_TYPES = [
  "ring",
  "necklace",
  "earring",
  "bracelet",
  "set",
  "brooch",
  "watch",
  "object",
  "bridal",
] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const KARATS = [18, 21, 22, 24] as const;
export type Karat = (typeof KARATS)[number];

export const STATUSES = ["idea", "approved", "production", "packaging"] as const;
export type ConceptStatus = (typeof STATUSES)[number];

export const CITIES = ["milan", "monaco", "paris", "tehran"] as const;
export type City = (typeof CITIES)[number];

export const COMPANION_KINDS = ["charm", "art", "relic", "surprise"] as const;
export type CompanionKind = (typeof COMPANION_KINDS)[number];

export const PACKAGE_KINDS = ["object", "collectible", "limited", "personal"] as const;
export type PackageKind = (typeof PACKAGE_KINDS)[number];

export type ConceptBrief = {
  productType: ProductType;
  level: LuxuryLevel;
  weightGrams: number;
  karat: Karat;
  occasion: string;
  notes: string;
};

export type Companion = {
  id: string;
  kind: CompanionKind;
  title: string;
  isGold: boolean;
  narrative: string;
  specs: string;
};

export type PackageArchitecture = {
  name: string;
  concept: string;
  form: string;
  opening: string;
  materials: string[];
  layers: string[];
  sequence: string[];
  surprise: string;
  afterlife: string;
  complexity: string;
  kind: PackageKind;
  serial?: string;
  edition?: { n: number; of: number };
  dedicateTo?: string;
};

export type ProductSet = {
  companions: Companion[];
  companionId: string;
  architecture: PackageArchitecture;
};

export type ConceptVersion = {
  at: number;
  note: string;
  title: string;
};

export type Concept = {
  id: string;
  title: string;
  path: string;
  brief: ConceptBrief;
  description: string;
  specs: {
    dimensions: string;
    weightGrams: number;
    karat: Karat;
    style: string;
    complexity: string;
  };
  laborEstimate: string;
  story: string;
  audience: string;
  usage: string;
  costApprox: string;
  variations: string[];
  weightOpt: string;
  manufacturability: string;
  set: ProductSet;
  collectionId?: string;
  status: ConceptStatus;
  version: number;
  versions: ConceptVersion[];
  limited?: { series: string; edition: number; of: number };
  passport?: { serial: string; issuedAt: number };
  city: City;
  fingerprint: string;
  at: number;
};

export type BrandDna = {
  name: string;
  promise: string;
  materials: string;
  silhouette: string;
  forbidden: string;
  cities: City[];
};

export type Collection = {
  id: string;
  name: string;
  season: string;
  note: string;
  at: number;
};
