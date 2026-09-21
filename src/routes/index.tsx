import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DESK_META } from "@/components/app-shell";
import { StudioProvider, type StudioSnapshot } from "@/components/studio-store";
import {
  StudioAtelier,
  StudioBoard,
  StudioBrief,
  StudioCollections,
  StudioDna,
  StudioDossier,
  StudioPapers,
  StudioProduction,
  StudioSet,
  StudioSheet,
} from "@/components/studio-desks";
import { SEED_COLLECTIONS, SEED_CONCEPTS, SEED_DNA } from "@/data/studio/seed";
import { LUXURY_LEVELS, PRODUCT_TYPES, STATUSES } from "@/data/studio/types";
import type { ConceptStatus, LuxuryLevel, ProductType } from "@/data/studio/types";
import { listStudioFn } from "@/lib/studio-fn";

const DESKS = DESK_META.map((d) => d.id);
type Tab = (typeof DESKS)[number];

type DeskSearch = {
  desk?: Tab;
  concept?: string;
  status?: ConceptStatus;
  q?: string;
  level?: LuxuryLevel;
  type?: ProductType;
};

function parseSearch(raw: Record<string, unknown>): DeskSearch {
  const desk = DESKS.includes(raw.desk as Tab) ? (raw.desk as Tab) : undefined;
  const concept = typeof raw.concept === "string" ? raw.concept : undefined;
  const status = STATUSES.includes(raw.status as ConceptStatus) ? (raw.status as ConceptStatus) : undefined;
  const q = typeof raw.q === "string" && raw.q.trim() ? raw.q.trim().slice(0, 80) : undefined;
  const level = LUXURY_LEVELS.includes(raw.level as LuxuryLevel) ? (raw.level as LuxuryLevel) : undefined;
  const type = PRODUCT_TYPES.includes(raw.type as ProductType) ? (raw.type as ProductType) : undefined;
  return { desk, concept, status, q, level, type };
}

const TAB_BY_ID = Object.fromEntries(DESK_META.map((t) => [t.id, t])) as Record<
  Tab,
  (typeof DESK_META)[number]
>;

async function loadStudio(): Promise<StudioSnapshot> {
  try {
    const r = await listStudioFn();
    if (r.concepts.length) {
      return { concepts: r.concepts, dna: r.dna, collections: r.collections, jobs: r.jobs ?? [] };
    }
  } catch {
    /* seed below */
  }
  return { concepts: SEED_CONCEPTS, dna: SEED_DNA, collections: SEED_COLLECTIONS, jobs: [] };
}

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  loader: loadStudio,
  loaderDeps: () => ({}),
  staleTime: 60_000,
  component: Studio,
  head: ({ match }) => {
    const desk = match.search.desk ?? "board";
    const label = TAB_BY_ID[desk]?.label ?? "خانه";
    return { meta: [{ title: `${label} · زرین` }] };
  },
});

function Studio() {
  const search = Route.useSearch();
  const tab = search.desk ?? "board";
  const { concept, status, q, level, type } = search;
  const deskLabel = TAB_BY_ID[tab].label;
  const initial = Route.useLoaderData();

  return (
    <StudioProvider initial={initial}>
      <AppShell desk={tab} title={deskLabel}>
        {tab === "board" && <StudioBoard />}
        {tab === "brief" && <StudioBrief />}
        {tab === "atelier" && <StudioAtelier q={q} status={status} level={level} type={type} />}
        {tab === "dossier" && <StudioDossier id={concept} />}
        {tab === "production" && <StudioProduction />}
        {tab === "set" && <StudioSet id={concept} />}
        {tab === "collections" && <StudioCollections />}
        {tab === "dna" && <StudioDna />}
        {tab === "papers" && <StudioPapers />}
        {tab === "sheet" && <StudioSheet id={concept} />}
      </AppShell>
    </StudioProvider>
  );
}
