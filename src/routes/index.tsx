import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DESK_META } from "@/components/app-shell";
import { StudioProvider } from "@/components/studio-store";
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
import { LUXURY_LEVELS, PRODUCT_TYPES, STATUSES } from "@/data/studio/types";
import type { ConceptStatus, LuxuryLevel, ProductType } from "@/data/studio/types";

const DESKS = DESK_META.map((d) => d.id);
type Tab = (typeof DESKS)[number];

type DeskSearch = {
  desk: Tab;
  concept?: string;
  status?: ConceptStatus;
  q?: string;
  level?: LuxuryLevel;
  type?: ProductType;
};

function parseSearch(raw: Record<string, unknown>): DeskSearch {
  const desk = DESKS.includes(raw.desk as Tab) ? (raw.desk as Tab) : "board";
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

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  component: Studio,
  head: ({ match }) => {
    const label = TAB_BY_ID[match.search.desk]?.label ?? "خانه";
    return { meta: [{ title: `${label} · زرین` }] };
  },
});

function Studio() {
  const { desk: tab, concept, status, q, level, type } = Route.useSearch();
  const deskLabel = TAB_BY_ID[tab].label;

  return (
    <StudioProvider>
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
