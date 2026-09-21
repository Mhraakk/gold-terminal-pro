import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BsiBody,
  BsiCrease,
  BsiDisplay,
  BsiFolio,
  BsiIndex,
  BsiIndexItem,
  BsiPage,
  BsiShell,
  BsiSpread,
  BsiWell,
} from "@/components/book-serif-index";
import { SolarCpu } from "@/components/nss-card";
import { SeamlessMarquee } from "@/components/seamless-marquee";
import { UserButton } from "@/lib/auth/gates";
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
import { ZarinLoop } from "@/components/zarin-loop";
import { LEVEL_LABEL } from "@/data/studio/catalog";
import { LUXURY_LEVELS, PRODUCT_TYPES, STATUSES } from "@/data/studio/types";
import type { ConceptStatus, LuxuryLevel, ProductType } from "@/data/studio/types";

const DESKS = [
  "board",
  "brief",
  "atelier",
  "dossier",
  "production",
  "set",
  "collections",
  "dna",
  "papers",
  "sheet",
] as const;

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

const TABS: { id: Tab; label: string }[] = [
  { id: "board", label: "داشبورد" },
  { id: "brief", label: "کانسپت تازه" },
  { id: "atelier", label: "آتلیه" },
  { id: "dossier", label: "شناسنامه طرح" },
  { id: "production", label: "تولید" },
  { id: "set", label: "ست پکیج" },
  { id: "collections", label: "کالکشن" },
  { id: "dna", label: "دی‌ان‌ای" },
  { id: "papers", label: "اصالت" },
  { id: "sheet", label: "برگه ارائه" },
];

const TAB_BY_ID = Object.fromEntries(TABS.map((t) => [t.id, t])) as Record<Tab, (typeof TABS)[number]>;

export const Route = createFileRoute("/")({
  validateSearch: parseSearch,
  pendingComponent: StudioPending,
  component: Studio,
  head: ({ match }) => {
    const label = TAB_BY_ID[match.search.desk]?.label ?? "داشبورد";
    return { meta: [{ title: `${label} · زرین — آتلیه کانسپت` }] };
  },
});

function StudioPending() {
  return (
    <BsiShell>
      <BsiWell>
        <BsiIndex>
          <BsiIndexItem active>داشبورد</BsiIndexItem>
        </BsiIndex>
        <BsiSpread>
          <BsiPage>
            <p className="bsi-kicker">ZARIN · ATELIER</p>
            <BsiDisplay>زرین</BsiDisplay>
            <p className="nss-body">در حال گشودن آتلیه…</p>
          </BsiPage>
        </BsiSpread>
      </BsiWell>
    </BsiShell>
  );
}

function Studio() {
  const { desk: tab, concept, status, q, level, type } = Route.useSearch();
  const deskLabel = TAB_BY_ID[tab].label;

  return (
    <BsiShell>
      <BsiWell
        banner={
          <SeamlessMarquee
            items={LUXURY_LEVELS.map((id) => ({
              id,
              node: (
                <Link to="/" search={{ desk: "brief", concept: undefined }} className="mq-chip">
                  <span>{LEVEL_LABEL[id]}</span>
                </Link>
              ),
            }))}
          />
        }
      >
        <BsiIndex>
          {TABS.map((t) => (
            <BsiIndexItem key={t.id} active={tab === t.id} desk={t.id}>
              {t.label}
            </BsiIndexItem>
          ))}
        </BsiIndex>
        <BsiSpread>
          <BsiPage side="verso">
            <BsiFolio>f. {deskLabel}</BsiFolio>
            <UserButton />
            <p className="bsi-kicker">ZARIN · ATELIER · VOL. I</p>
            <ZarinLoop />
            <BsiBody drop="آ">
              تلیهٔ کانسپت زرین. چهار سطح لوکس، الهام از میلان و موناکو و پاریس، بدون کپی. هر طرح داستان، وزن، اجرت و جعبه دارد.
            </BsiBody>
            <aside className="bsi-note">آرشیو روی Postgres سازمان است. جاب مرحله‌به‌مرحله و قابل لغو است.</aside>
          </BsiPage>
          <BsiCrease />
          <BsiPage side="recto" id="desk">
            <BsiFolio>pp. {deskLabel}</BsiFolio>
            <span className="nss-label">Lectio</span>
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
            <p className="nss-meta mt-8 flex items-start gap-2">
              <SolarCpu />
              آتلیهٔ زرین · جاب واقعی روی Postgres · شباهت متنی در سطح سازمان
            </p>
          </BsiPage>
        </BsiSpread>
      </BsiWell>
    </BsiShell>
  );
}
