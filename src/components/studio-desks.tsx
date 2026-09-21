import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { FrameCard } from "@/components/frame";
import { HoverExpand } from "@/components/hover-expand";
import { NdStamp } from "@/components/number-details";
import { NssCard } from "@/components/nss-card";
import { useStudio } from "@/components/studio-store";
import { Button } from "@/components/ui/button";
import { CountFlow } from "@/components/ui/count-flow";
import { SmoothInput } from "@/components/ui/smooth-input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { stillForType } from "@/data/atelier-stills";
import {
  CITY_LABEL,
  COMPANION_LABEL,
  KARAT_LABEL,
  LEVEL_LABEL,
  OCCASIONS,
  PACKAGE_KIND_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
} from "@/data/studio/catalog";
import { filterArchive, type ArchiveFilter } from "@/data/studio/archive";
import { maxSimilarity } from "@/data/studio/similarity";
import type { BrandDna, Collection, Concept, ConceptBrief, ConceptStatus, Karat, LuxuryLevel, PackageKind, ProductType } from "@/data/studio/types";
import { KARATS, LUXURY_LEVELS, PRODUCT_TYPES } from "@/data/studio/types";
import { formatSheet } from "@/data/studio/sheet";
import { cancelStudioJobFn, enqueueStudioJobFn, getStudioJobFn, listStudioFn, retryStudioJobFn, tickStudioJobFn } from "@/lib/studio-fn";
import { canRetry, isTerminal, stageLabel, type JobSnapshot } from "@/lib/studio-jobs";
import { MAX_JOB_TICKS } from "@/lib/studio-pipeline";
import { studioClientError } from "@/lib/studio-error";

const ACTIVE_JOB_KEY = "zarin-active-job";

function plate(concept: Concept) {
  return stillForType(concept.brief.productType);
}

export function StudioBoard() {
  const { concepts, jobs, error } = useStudio();
  const counts = useMemo(() => {
    const by: Record<ConceptStatus, number> = { idea: 0, approved: 0, production: 0, packaging: 0 };
    concepts.forEach((c) => {
      by[c.status] += 1;
    });
    return by;
  }, [concepts]);
  const tiles: { status: ConceptStatus; n: number }[] = [
    { status: "idea", n: counts.idea },
    { status: "approved", n: counts.approved },
    { status: "production", n: counts.production },
    { status: "packaging", n: counts.packaging },
  ];
  return (
    <section aria-label="داشبورد آتلیه">
      {error ? (
        <p className="nss-meta">
          {error}{" "}
          {error === "ورود لازم است." ? (
            <a href="/login" className="nss-link">ورود آتلیه</a>
          ) : null}
        </p>
      ) : null}
      <div className="za-stats">
        {tiles.map((t) => (
          <Tooltip key={t.status}>
            <TooltipTrigger asChild>
              <Link
                to="/"
                search={{ desk: "atelier", concept: undefined, status: t.status, q: undefined, level: undefined, type: undefined }}
                className="za-stat"
              >
                <strong>
                  <CountFlow value={t.n} />
                </strong>
                <span>{STATUS_LABEL[t.status]}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">باز کردن آرشیو {STATUS_LABEL[t.status]}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      {jobs.filter((j) => !isTerminal(j.status)).map((j) => (
        <p key={j.id} className="nss-meta mb-4">
          در حال تولید: {stageLabel(j.stage)}
        </p>
      ))}
      {concepts.length === 0 ? (
        <FrameCard>
          <h3 className="nss-display">هنوز کانسپتی نیست</h3>
          <p className="nss-body mt-2">از یک بریف ساده سه مسیر بساز.</p>
          <Link to="/" search={{ desk: "brief", concept: undefined }} className="nss-link mt-4 inline-block">
            <Button type="button" variant="primary">ساخت کانسپت</Button>
          </Link>
        </FrameCard>
      ) : (
        <HoverExpand concepts={concepts.slice(0, 6)} axis="col" />
      )}
    </section>
  );
}

function ConceptTile({ concept, near }: { concept: Concept; near?: number }) {
  const still = plate(concept);
  return (
    <Link to="/" search={{ desk: "dossier", concept: concept.id }} className="za-piece">
      <div className="za-clip">
        <img src={still.src} alt={still.alt} width={1600} height={900} />
      </div>
      <div className="za-piece-body">
        <p className="nss-meta">{TYPE_LABEL[concept.brief.productType]} · {LEVEL_LABEL[concept.brief.level]}</p>
        <h3>{concept.title}</h3>
        <p className="nss-meta mt-1">{STATUS_LABEL[concept.status]} · {CITY_LABEL[concept.city]}</p>
        {near != null ? (
          <p className="nss-meta mt-1">شباهت {Math.round(near * 100)}٪</p>
        ) : null}
      </div>
    </Link>
  );
}

export function StudioBrief() {
  const { dna, setConcepts } = useStudio();
  const [brief, setBrief] = useState<ConceptBrief>({
    productType: "ring",
    level: "signature",
    weightGrams: 6,
    karat: 18,
    occasion: "سالگرد",
    notes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<JobSnapshot | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [paths, setPaths] = useState<Concept[]>([]);
  const abortRef = useRef(false);

  async function pump(id: string) {
    setJobId(id);
    sessionStorage.setItem(ACTIVE_JOB_KEY, id);
    abortRef.current = false;
    for (let i = 0; i < MAX_JOB_TICKS; i += 1) {
      if (abortRef.current) {
        const cancelled = await cancelStudioJobFn({ data: { jobId: id } });
        if (cancelled.ok && cancelled.job) setJob(cancelled.job);
        sessionStorage.removeItem(ACTIVE_JOB_KEY);
        break;
      }
      const tick = await tickStudioJobFn({ data: { jobId: id } });
      if (!tick.ok) {
        setError(tick.error);
        break;
      }
      setJob(tick.job);
      if (tick.concepts?.length) setPaths(tick.concepts);
      if (isTerminal(tick.job.status)) {
        if (tick.job.error) setError(tick.job.error);
        sessionStorage.removeItem(ACTIVE_JOB_KEY);
        const list = await listStudioFn();
        setConcepts(list.concepts);
        if (!tick.concepts?.length) {
          setPaths(list.concepts.slice(0, 3));
        }
        break;
      }
      if (i === MAX_JOB_TICKS - 1) {
        setError("جاب بیش از حد طول کشید و متوقف شد. با رفرش ادامه می‌دهد.");
      }
    }
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(ACTIVE_JOB_KEY);
    if (!saved) return;
    let live = true;
    setBusy(true);
    getStudioJobFn({ data: { jobId: saved } })
      .then(async (hit) => {
        if (!live) return;
        if (!hit.ok || isTerminal(hit.job.status)) {
          sessionStorage.removeItem(ACTIVE_JOB_KEY);
          if (hit.ok) {
            setJob(hit.job);
            if (hit.concepts?.length) setPaths(hit.concepts);
          }
          return;
        }
        setJob(hit.job);
        await pump(saved);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(studioClientError(e, "ادامهٔ جاب شکست خورد."));
      })
      .finally(() => {
        if (live) setBusy(false);
      });
    return () => {
      live = false;
    };
    // Resume at most once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setBusy(true);
    setError(null);
    setJob(null);
    setPaths([]);
    try {
      const created = await enqueueStudioJobFn({
        data: {
          ...brief,
          dna: {
            name: dna.name,
            promise: dna.promise,
            materials: dna.materials,
            silhouette: dna.silhouette,
            forbidden: dna.forbidden,
          },
        },
      });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      await pump(created.jobId);
    } catch (e) {
      setError(studioClientError(e, "جاب شکست خورد. دوباره بزن."));
    } finally {
      setBusy(false);
    }
  }

  async function retryLast() {
    if (!jobId || !job || !canRetry(job.status)) return;
    setBusy(true);
    setError(null);
    setPaths([]);
    try {
      const created = await retryStudioJobFn({ data: { jobId } });
      if (!created.ok) {
        setError(created.error);
        return;
      }
      await pump(created.jobId);
    } catch (e) {
      setError(studioClientError(e, "ری‌تری شکست خورد."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard>
        <p className="nss-label">بریف</p>
        <h3 className="nss-display">سه مسیر تازه</h3>
        <p className="nss-body">نوع، سطح، وزن و عیار را بگو. خروجی سه هویت جدا است.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="نوع محصول">
            <select
              className="desk-input"
              value={brief.productType}
              onChange={(e) => setBrief({ ...brief, productType: e.target.value as ProductType })}
            >
              {PRODUCT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="سطح">
            <select
              className="desk-input"
              value={brief.level}
              onChange={(e) => setBrief({ ...brief, level: e.target.value as LuxuryLevel })}
            >
              {LUXURY_LEVELS.map((t) => (
                <option key={t} value={t}>{LEVEL_LABEL[t]}</option>
              ))}
            </select>
          </Field>
          <Field label="وزن هدف (گرم)">
            <SmoothInput
              type="number"
              value={String(brief.weightGrams)}
              onChange={(e) => setBrief({ ...brief, weightGrams: Number(e.target.value) || 0 })}
            />
          </Field>
          <Field label="عیار">
            <select
              className="desk-input"
              value={brief.karat}
              onChange={(e) => setBrief({ ...brief, karat: Number(e.target.value) as Karat })}
            >
              {KARATS.map((k) => (
                <option key={k} value={k}>{KARAT_LABEL[k]}</option>
              ))}
            </select>
          </Field>
          <Field label="مناسبت">
            <select
              className="desk-input"
              value={brief.occasion}
              onChange={(e) => setBrief({ ...brief, occasion: e.target.value })}
            >
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="یادداشت آزاد">
          <textarea
            className="desk-input min-h-24"
            value={brief.notes}
            maxLength={600}
            onChange={(e) => setBrief({ ...brief, notes: e.target.value })}
            placeholder="مثلاً بدون نگین مرکزی، قفل پنهان…"
          />
        </Field>
        <Button className="mt-6 min-h-12 w-full" type="button" variant="primary" onClick={() => void generate()} disabled={busy}>
          {busy ? "در حال تولید…" : "سه مسیر بساز"}
        </Button>
        {busy && jobId ? (
          <button
            type="button"
            className="nss-chip nss-link mt-3"
            onClick={() => {
              abortRef.current = true;
              sessionStorage.removeItem(ACTIVE_JOB_KEY);
              void cancelStudioJobFn({ data: { jobId } });
            }}
          >
            لغو جاب
          </button>
        ) : null}
        {!busy && job && canRetry(job.status) ? (
          <Button className="mt-3" type="button" onClick={() => void retryLast()}>
            ری‌تری امن همین بریف
          </Button>
        ) : null}
        {job ? (
          <p className="nss-meta mt-3">
            {stageLabel(job.stage)} · {job.status}
            {job.resultCount ? ` · ${job.resultCount} مسیر` : ""}
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-down">{error}</p> : null}
      </FrameCard>
      {paths.map((c) => (
        <ConceptTile key={c.id} concept={c} />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="nss-meta">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function StudioAtelier({ q, status, level, type }: ArchiveFilter) {
  const { concepts } = useStudio();
  const navigate = useNavigate({ from: "/" });
  const filtered = useMemo(
    () => filterArchive(concepts, { q, status, level, type }),
    [concepts, q, status, level, type],
  );

  function setFilter(patch: ArchiveFilter) {
    void navigate({
      search: {
        desk: "atelier",
        concept: undefined,
        q: "q" in patch ? patch.q || undefined : q,
        status: "status" in patch ? patch.status || undefined : status,
        level: "level" in patch ? patch.level || undefined : level,
        type: "type" in patch ? patch.type || undefined : type,
      },
    });
  }

  if (!concepts.length) {
    return (
      <FrameCard>
        <p className="nss-body">کانسپتی در آرشیو نیست. از «کانسپت تازه» سه مسیر بساز.</p>
        <Link to="/" search={{ desk: "brief", concept: undefined }} className="nss-link mt-3 inline-block">
          کانسپت تازه
        </Link>
      </FrameCard>
    );
  }

  return (
    <div className="bmg-grid" data-recipe="board" aria-label="آتلیه">
      <FrameCard className="tm-span">
        <p className="nss-label">آرشیو</p>
        <p className="nss-body mt-2">جست‌وجو روی عنوان، داستان، مسیر و اثرانگشت. فیلتر همان چهار سطل داشبورد است.</p>
        <Field label="جست‌وجو">
          <SmoothInput
            value={q ?? ""}
            maxLength={80}
            placeholder="مثلاً اسکله، باگت، موناکو…"
            onChange={(e) => setFilter({ q: e.target.value })}
          />
        </Field>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="وضعیت">
            <select
              className="desk-input"
              value={status ?? ""}
              onChange={(e) => setFilter({ status: (e.target.value || undefined) as ConceptStatus | undefined })}
            >
              <option value="">همه</option>
              {(["idea", "approved", "production", "packaging"] as ConceptStatus[]).map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </Field>
          <Field label="سطح">
            <select
              className="desk-input"
              value={level ?? ""}
              onChange={(e) => setFilter({ level: (e.target.value || undefined) as LuxuryLevel | undefined })}
            >
              <option value="">همه</option>
              {LUXURY_LEVELS.map((id) => (
                <option key={id} value={id}>{LEVEL_LABEL[id]}</option>
              ))}
            </select>
          </Field>
          <Field label="نوع">
            <select
              className="desk-input"
              value={type ?? ""}
              onChange={(e) => setFilter({ type: (e.target.value || undefined) as ProductType | undefined })}
            >
              <option value="">همه</option>
              {PRODUCT_TYPES.map((id) => (
                <option key={id} value={id}>{TYPE_LABEL[id]}</option>
              ))}
            </select>
          </Field>
        </div>
        <p className="nss-meta mt-3">{filtered.length} از {concepts.length} طرح</p>
      </FrameCard>
      {filtered.length === 0 ? (
        <FrameCard>
          <p className="nss-body">با این فیلتر طرحی نیست. فیلتر را بردار یا کانسپت تازه بساز.</p>
        </FrameCard>
      ) : (
        <>
          {filtered.length > 1 ? (
            <HoverExpand concepts={filtered.slice(0, 8)} />
          ) : null}
          {(filtered.length === 1 ? filtered : filtered.slice(8)).map((c) => {
            const near = maxSimilarity(
              c.fingerprint,
              concepts.filter((x) => x.id !== c.id).map((x) => x.fingerprint),
            );
            return <ConceptTile key={c.id} concept={c} near={near} />;
          })}
        </>
      )}
    </div>
  );
}

export function StudioDossier({ id }: { id?: string }) {
  const { concepts, persist, collections } = useStudio();
  const concept = concepts.find((c) => c.id === id) ?? concepts[0];
  if (!concept) {
    return (
      <FrameCard>
        <p className="nss-body">کانسپتی نیست. اول یک مسیر بساز.</p>
      </FrameCard>
    );
  }
  const still = plate(concept);
  const deck = [
    still,
    stillForType("object"),
    stillForType("bracelet"),
  ].filter((s, i, a) => a.findIndex((x) => x.src === s.src) === i);
  const twins = concepts.filter((c) => c.id !== concept.id);
  const near = maxSimilarity(concept.fingerprint, twins.map((c) => c.fingerprint));
  return (
    <div>
      <div className="za-deck" aria-label="صفحات محصول">
        {deck.map((s, i) => (
          <figure key={s.src} className="za-deck-card">
            <img src={s.src} alt={s.alt} />
            <figcaption>{i + 1} / {deck.length}</figcaption>
          </figure>
        ))}
      </div>
      <FrameCard>
        <p className="nss-label">{concept.path} · {CITY_LABEL[concept.city]}</p>
        <h3 className="nss-display">{concept.title}</h3>
        <p className="nss-body mt-2">{concept.description}</p>
        <p className="nss-meta mt-4">
          شباهت به آرشیو {Math.round(near * 100)}٪ · {near > 0.55 ? "نزدیک — مسیر را عوض کن" : "فاصلهٔ سالم"}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["idea", "approved", "production", "packaging"] as ConceptStatus[]).map((s) => (
            <button
              key={s}
              type="button"
              className="nss-chip nss-link"
              data-on={concept.status === s}
              onClick={() => {
                const next = { ...concept, status: s, version: concept.version + 1, versions: [{ at: Date.now(), note: `وضعیت: ${s}`, title: concept.title }, ...concept.versions] };
                void persist(next);
              }}
            >
              {STATUS_LABEL[s]}
            </button>
          ))}
        </div>
        {collections.length ? (
          <Field label="کالکشن">
            <select
              className="desk-input"
              value={concept.collectionId ?? ""}
              onChange={(e) => {
                const collectionId = e.target.value || undefined;
                const col = collections.find((c) => c.id === collectionId);
                void persist({
                  ...concept,
                  collectionId,
                  version: concept.version + 1,
                  versions: [
                    { at: Date.now(), note: col ? `کالکشن: ${col.name}` : "خروج از کالکشن", title: concept.title },
                    ...concept.versions,
                  ],
                });
              }}
            >
              <option value="">بدون کالکشن</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>{col.name}</option>
              ))}
            </select>
          </Field>
        ) : null}
      </FrameCard>
      <FrameCard>
        <p className="nss-label">مشخصات</p>
        <dl className="mt-3 space-y-2 text-sm">
          <Row k="ابعاد" v={concept.specs.dimensions} />
          <Row k="وزن" v={<><CountFlow value={concept.specs.weightGrams} /> g</>} />
          <Row k="عیار" v={KARAT_LABEL[concept.specs.karat]} />
          <Row k="سبک" v={concept.specs.style} />
          <Row k="پیچیدگی" v={concept.specs.complexity} />
          <Row k="اجرت" v={concept.laborEstimate} />
          <Row k="هزینه" v={concept.costApprox} />
        </dl>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">داستان و مخاطب</p>
        <p className="nss-body mt-3">{concept.story}</p>
        <p className="nss-meta mt-4">{concept.audience}</p>
        <p className="nss-body mt-2">{concept.usage}</p>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">تولید</p>
        <p className="nss-body mt-3">{concept.weightOpt}</p>
        <p className="nss-body mt-2">{concept.manufacturability}</p>
        <ul className="mt-3 space-y-1 text-sm">
          {concept.variations.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">ست محصول — نه جعبه</p>
        <p className="nss-body mt-3">{concept.set.architecture.concept}</p>
        <p className="nss-meta mt-2">{concept.set.architecture.form}</p>
        <p className="nss-label mt-4">همراه انتخاب‌شده</p>
        <p className="nss-body mt-2">
          {concept.set.companions.find((x) => x.id === concept.set.companionId)?.title}
        </p>
        <Link to="/" search={{ desk: "set", concept: concept.id }} className="nss-link mt-3 inline-block">
          معماری کامل ست
        </Link>
        <Link to="/" search={{ desk: "sheet", concept: concept.id }} className="nss-link mt-3 mr-4 inline-block">
          برگه ارائه
        </Link>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">نسخه‌ها</p>
        <ol className="nd-list mt-3" data-nd="leading">
          {concept.versions.map((v) => (
            <li key={v.at} className="nd-item">
              <span className="nd-title">{v.note}</span>
            </li>
          ))}
        </ol>
      </FrameCard>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="nss-meta">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

export function StudioProduction() {
  const { concepts, persist } = useStudio();
  return (
    <section className="bmg-grid" data-recipe="board" aria-label="خط تولید">
      {(["idea", "approved", "production", "packaging"] as ConceptStatus[]).map((status, i) => (
        <NssCard key={status} tile stamp={<NdStamp index={i + 1} />}>
          <p className="nss-label">{STATUS_LABEL[status]}</p>
          <ul className="mt-3 space-y-2">
            {concepts.filter((c) => c.status === status).map((c) => (
              <li key={c.id}>
                <Link to="/" search={{ desk: "dossier", concept: c.id }} className="nss-link">
                  {c.title}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(["idea", "approved", "production", "packaging"] as ConceptStatus[])
                    .filter((s) => s !== status)
                    .slice(0, 2)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="nss-meta"
                        onClick={() => {
                          const next = { ...c, status: s, version: c.version + 1, versions: [{ at: Date.now(), note: `وضعیت: ${s}`, title: c.title }, ...c.versions] };
                          void persist(next);
                        }}
                      >
                        → {STATUS_LABEL[s]}
                      </button>
                    ))}
                </div>
              </li>
            ))}
          </ul>
        </NssCard>
      ))}
    </section>
  );
}

export function StudioSet({ id }: { id?: string }) {
  const { concepts, persist } = useStudio();
  const [name, setName] = useState("");
  const concept = concepts.find((c) => c.id === id) ?? concepts[0];
  if (!concept) {
    return (
      <FrameCard>
        <p className="nss-body">ستّی نیست. اول کانسپت بساز.</p>
      </FrameCard>
    );
  }
  const arch = concept.set.architecture;
  const chosen = concept.set.companions.find((x) => x.id === concept.set.companionId);
  const still = plate(concept);
  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard className="tm-span">
        <p className="nss-label">{PACKAGE_KIND_LABEL[arch.kind]}</p>
        <h3 className="nss-display" style={{ fontSize: 32, lineHeight: 1.1 }}>{arch.name}</h3>
        <p className="nss-body mt-2">{arch.concept}</p>
        <p className="nss-meta mt-4">{arch.form}</p>
        {arch.serial ? <p className="nss-meta mt-2">سریال {arch.serial}{arch.edition ? ` · ${arch.edition.n}/${arch.edition.of}` : ""}</p> : null}
        {arch.dedicateTo ? <p className="nss-meta mt-2">برای {arch.dedicateTo}</p> : null}
      </FrameCard>
      <FrameCard>
        <p className="nss-label">محصول دوم — روایت مشترک</p>
        <ul className="mt-3 space-y-3">
          {concept.set.companions.map((ch) => (
            <li key={ch.id}>
              <button
                type="button"
                className="nss-link text-right"
                data-on={ch.id === concept.set.companionId}
                onClick={() => {
                  const next = {
                    ...concept,
                    set: { ...concept.set, companionId: ch.id },
                    version: concept.version + 1,
                    versions: [{ at: Date.now(), note: "انتخاب همراه ست", title: concept.title }, ...concept.versions],
                  };
                  void persist(next);
                }}
              >
                {COMPANION_LABEL[ch.kind]} · {ch.title}
                {ch.isGold ? " · طلا" : ""}
              </button>
              <p className="nss-body mt-1">{ch.narrative}</p>
              <p className="nss-meta">{ch.specs}</p>
            </li>
          ))}
        </ul>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">معماری باز شدن</p>
        <p className="nss-body mt-3">{arch.opening}</p>
        <p className="nss-meta mt-3">لایه‌ها</p>
        <p className="nss-body">{arch.layers.join(" → ")}</p>
        <p className="nss-meta mt-3">ترتیب مواجهه</p>
        <div className="za-stack">
          {arch.sequence.map((step, i) => (
            <article key={step} className="za-stack-card" style={{ top: 8 + i * 14 }}>
              <img src={still.src} alt="" />
              <div className="za-stack-body">
                <p className="nss-meta">{i + 1} / {arch.sequence.length}</p>
                <p>{step}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="nss-meta mt-3">غافلگیری</p>
        <p className="nss-body">{arch.surprise}</p>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">متریال و پیچیدگی</p>
        <p className="nss-body mt-3">{arch.materials.join(" · ")}</p>
        <p className="nss-meta mt-3">{arch.complexity}</p>
        <p className="nss-label mt-4">زندگی بعد از باز شدن</p>
        <p className="nss-body mt-2">{arch.afterlife}</p>
      </FrameCard>
      <FrameCard>
        <p className="nss-label">گونهٔ ست</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["object", "collectible", "limited", "personal"] as PackageKind[]).map((k) => (
            <button
              key={k}
              type="button"
              className="nss-chip nss-link"
              data-on={arch.kind === k}
              onClick={() => {
                const architecture = { ...concept.set.architecture, kind: k };
                if (k === "limited" || k === "collectible") {
                  architecture.edition ??= { n: 1, of: concept.brief.level === "collector" ? 12 : 40 };
                  architecture.serial ??= `PK-${concept.at.toString(36).toUpperCase()}`;
                }
                const next = {
                  ...concept,
                  set: { ...concept.set, architecture },
                  version: concept.version + 1,
                  versions: [{ at: Date.now(), note: `گونهٔ پکیج: ${k}`, title: concept.title }, ...concept.versions],
                };
                void persist(next);
              }}
            >
              {PACKAGE_KIND_LABEL[k]}
            </button>
          ))}
        </div>
        <Field label="پکیج شخصی برای">
          <SmoothInput value={name} onChange={(e) => setName(e.target.value)} placeholder="نام مشتری" />
        </Field>
        <Button
          className="mt-3"
          type="button"
          onClick={() => {
            const dedicateTo = name.trim();
            if (!dedicateTo) return;
            const next = {
              ...concept,
              set: {
                ...concept.set,
                architecture: { ...concept.set.architecture, kind: "personal" as const, dedicateTo },
              },
              version: concept.version + 1,
              versions: [{ at: Date.now(), note: `پکیج شخصی برای ${dedicateTo}`, title: concept.title }, ...concept.versions],
            };
            void persist(next);
          }}
        >
          ثبت اهدا
        </Button>
        {chosen ? <p className="nss-meta mt-4">ست فعلی: {concept.title} + {chosen.title}</p> : null}
      </FrameCard>
    </div>
  );
}

export function StudioDna() {
  const { dna, setDna } = useStudio();
  const [draft, setDraft] = useState(dna);
  const timer = useRef<number>(0);

  useEffect(() => {
    setDraft(dna);
  }, [dna]);

  function patch(key: "name" | "promise" | "materials" | "silhouette" | "forbidden", value: string) {
    const next = { ...draft, [key]: value };
    setDraft(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setDna(next);
    }, 700);
  }

  return (
    <FrameCard>
      <p className="nss-label">دی‌ان‌ای برند</p>
      <h3 className="nss-display">{draft.name}</h3>
      <Field label="نام">
        <SmoothInput
          value={draft.name}
          onChange={(e) => patch("name", e.target.value)}
        />
      </Field>
      {(["promise", "materials", "silhouette", "forbidden"] as const).map((key) => (
        <Field key={key} label={key === "promise" ? "وعده" : key === "materials" ? "متریال" : key === "silhouette" ? "سیلوئت" : "ممنوع"}>
          <textarea
            className="desk-input min-h-20"
            value={draft[key]}
            onChange={(e) => {
              patch(key, e.target.value);
            }}
          />
        </Field>
      ))}
    </FrameCard>
  );
}

export function StudioCollections() {
  const { collections, setCollections, concepts } = useStudio();
  const [name, setName] = useState("");
  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard>
        <p className="nss-label">کالکشن تازه</p>
        <SmoothInput value={name} onChange={(e) => setName(e.target.value)} placeholder="نام کالکشن" />
        <Button
          className="mt-4"
          type="button"
          onClick={() => {
            const n = name.trim();
            if (!n) return;
            const next = [
              { id: `col-${Date.now().toString(36)}`, name: n, season: "—", note: "", at: Date.now() },
              ...collections,
            ];
            setCollections(next);
            setName("");
          }}
        >
          ثبت
        </Button>
      </FrameCard>
      {collections.map((col, i) => (
        <NssCard key={col.id} tile stamp={<NdStamp index={i + 1} />}>
          <p className="nss-label">{col.season}</p>
          <p className="nss-body">{col.name}</p>
          <p className="nss-meta">{concepts.filter((c) => c.collectionId === col.id).length} کانسپت</p>
          <p className="nss-body mt-2">{col.note}</p>
        </NssCard>
      ))}
    </div>
  );
}

export function StudioPapers() {
  const { concepts, persist } = useStudio();
  if (!concepts.length) {
    return (
      <FrameCard>
        <p className="nss-body">برای صدور گواهی، اول کانسپت بساز.</p>
      </FrameCard>
    );
  }
  return (
    <section className="bmg-grid" data-recipe="board" aria-label="شناسنامه">
      {concepts.map((c, i) => (
        <NssCard key={c.id} tile stamp={<NdStamp index={i + 1} />}>
          <p className="nss-label">گواهی اصالت زرین</p>
          <p className="nss-body">{c.title}</p>
          <p className="nss-meta">
            {TYPE_LABEL[c.brief.productType]} · {KARAT_LABEL[c.specs.karat]} · {CITY_LABEL[c.city]}
          </p>
          <p className="nss-meta mt-2">
            {c.limited ? `لیمیتد ${c.limited.series} · ${c.limited.edition}/${c.limited.of}` : "سری باز"}
          </p>
          {c.passport ? (
            <>
              <p className="nss-display mt-3" style={{ fontSize: 22, lineHeight: 1.2 }}>
                {c.passport.serial}
              </p>
              <p className="nss-meta">
                صادر {new Date(c.passport.issuedAt).toLocaleDateString("fa-IR")}
              </p>
              <p className="nss-body mt-3">گواهی اصالت صادر شده. سریال روی پکیج و شناسنامه یکی است.</p>
              <Link to="/" search={{ desk: "dossier", concept: c.id }} className="nss-link mt-2 inline-block">
                شناسنامه طرح
              </Link>
            </>
          ) : (
            <button
              type="button"
              className="nss-chip nss-link mt-3"
              onClick={() => {
                const serial = `ZR-${c.brief.karat}-${c.at.toString(36).toUpperCase()}`;
                const next: Concept = {
                  ...c,
                  passport: { serial, issuedAt: Date.now() },
                  limited: c.limited ?? { series: c.path, edition: 1, of: c.brief.level === "collector" ? 12 : 50 },
                  set: {
                    ...c.set,
                    architecture: { ...c.set.architecture, serial: c.set.architecture.serial ?? serial },
                  },
                  version: c.version + 1,
                  versions: [{ at: Date.now(), note: `شناسنامه ${serial}`, title: c.title }, ...c.versions],
                };
                void persist(next);
              }}
            >
              صدور شناسنامه
            </button>
          )}
        </NssCard>
      ))}
    </section>
  );
}

export function StudioSheet({ id }: { id?: string }) {
  const { concepts } = useStudio();
  const [copied, setCopied] = useState<"ok" | "err" | null>(null);
  const concept = concepts.find((c) => c.id === id) ?? concepts[0];
  if (!concept) {
    return (
      <FrameCard>
        <p className="nss-body">برای برگه ارائه، اول کانسپت بساز.</p>
        <Link to="/" search={{ desk: "brief", concept: undefined }} className="nss-link mt-3 inline-block">
          کانسپت تازه
        </Link>
      </FrameCard>
    );
  }
  const text = formatSheet(concept);
  const still = plate(concept);
  const chosen = concept.set.companions.find((x) => x.id === concept.set.companionId);
  const arch = concept.set.architecture;

  async function copySheet() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied("ok");
    } catch {
      setCopied("err");
    }
  }

  return (
    <div className="bmg-grid" data-recipe="builder">
      <article className="zarin-sheet tm-span">
        <FrameCard>
          <p className="nss-label">برگه ارائه · زرین</p>
          <div className="relative my-4 h-48 overflow-hidden">
            <img src={still.src} alt={still.alt} className="h-full w-full object-cover" />
            <div className="nss-plate-veil" />
          </div>
          <h3 className="nss-display" style={{ fontSize: 32, lineHeight: 1.1 }}>{concept.title}</h3>
          <p className="nss-meta mt-2">
            {TYPE_LABEL[concept.brief.productType]} · {LEVEL_LABEL[concept.brief.level]} · {CITY_LABEL[concept.city]}
          </p>
          <p className="nss-body mt-3">{concept.description}</p>
          <p className="nss-body mt-3">{concept.story}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <Row k="ابعاد" v={concept.specs.dimensions} />
            <Row k="وزن" v={<><CountFlow value={concept.specs.weightGrams} /> g</>} />
            <Row k="عیار" v={KARAT_LABEL[concept.specs.karat]} />
            <Row k="سبک" v={concept.specs.style} />
            <Row k="اجرت" v={concept.laborEstimate} />
          </dl>
          <p className="nss-label mt-6">ورییشن</p>
          <ul className="mt-2 space-y-1 text-sm">
            {concept.variations.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <p className="nss-label mt-6">ست کامل — نه جعبه</p>
          <p className="nss-body mt-2">{arch.name}</p>
          <p className="nss-body mt-2">{arch.concept}</p>
          <p className="nss-meta mt-2">{arch.form} · {PACKAGE_KIND_LABEL[arch.kind]}</p>
          <ol className="nd-list mt-3" data-nd="leading">
            {arch.sequence.map((step) => (
              <li key={step} className="nd-item">
                <span className="nd-title">{step}</span>
              </li>
            ))}
          </ol>
          {chosen ? (
            <>
              <p className="nss-label mt-6">محصول دوم</p>
              <p className="nss-body mt-2">
                {COMPANION_LABEL[chosen.kind]} · {chosen.title}
                {chosen.isGold ? " · طلا" : ""}
              </p>
              <p className="nss-body mt-2">{chosen.narrative}</p>
            </>
          ) : null}
          {concept.passport ? (
            <p className="nss-display mt-6" style={{ fontSize: 22 }}>{concept.passport.serial}</p>
          ) : (
            <p className="nss-meta mt-6">شناسنامه هنوز صادر نشده — از میز اصالت صادر کن.</p>
          )}
          <div className="zarin-sheet-actions mt-6 flex flex-wrap gap-2">
            <Button type="button" onClick={() => void copySheet()}>
              رونوشت برگه
            </Button>
            <Button type="button" onClick={() => window.print()}>
              چاپ
            </Button>
            <Link to="/" search={{ desk: "set", concept: concept.id }} className="nss-link inline-block px-3 py-2">
              معماری ست
            </Link>
          </div>
          {copied === "ok" ? <p className="nss-meta mt-3">برگه روی کلیپ‌بورد است.</p> : null}
          {copied === "err" ? <p className="nss-meta mt-3 text-down">دسترسی به کلیپ‌بورد داده نشد.</p> : null}
        </FrameCard>
      </article>
    </div>
  );
}
