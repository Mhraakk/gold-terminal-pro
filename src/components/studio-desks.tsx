import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FrameCard } from "@/components/frame";
import { NdStamp } from "@/components/number-details";
import { NssCard } from "@/components/nss-card";
import { PointCloudGlobe } from "@/components/point-cloud-globe";
import { Button } from "@/components/ui/button";
import { AURA_STILLS } from "@/data/aura";
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
import { maxSimilarity } from "@/data/studio/similarity";
import type { BrandDna, Collection, Concept, ConceptBrief, ConceptStatus, Karat, LuxuryLevel, PackageKind, ProductType } from "@/data/studio/types";
import { KARATS, LUXURY_LEVELS, PRODUCT_TYPES } from "@/data/studio/types";
import {
  cancelStudioJobFn,
  enqueueStudioJobFn,
  listStudioFn,
  saveStudioCollectionsFn,
  saveStudioConceptFn,
  saveStudioDnaFn,
  tickStudioJobFn,
} from "@/lib/studio-fn";
import { SEED_DNA } from "@/data/studio/seed";
import { stageLabel, type JobSnapshot } from "@/lib/studio-jobs";
import { MAX_JOB_TICKS } from "@/lib/studio-pipeline";
import { studioClientError } from "@/lib/studio-error";

function plate(concept: Concept) {
  if (concept.brief.productType === "ring") return AURA_STILLS.ring;
  if (concept.brief.productType === "watch") return AURA_STILLS.desk;
  return AURA_STILLS.card;
}

function useStudio() {
  const [concepts, setConceptsState] = useState<Concept[]>([]);
  const [dna, setDnaState] = useState<BrandDna>(SEED_DNA);
  const [collections, setCollectionsState] = useState<Collection[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    listStudioFn()
      .then((r) => {
        if (!live) return;
        setConceptsState(r.concepts);
        setDnaState(r.dna);
        setCollectionsState(r.collections);
      })
      .catch((e: unknown) => {
        if (!live) return;
        setError(studioClientError(e, "خواندن آرشیو شکست خورد."));
      });
    return () => {
      live = false;
    };
  }, []);

  async function persist(concept: Concept) {
    setConceptsState((prev) => {
      const i = prev.findIndex((c) => c.id === concept.id);
      if (i < 0) return [concept, ...prev];
      const next = [...prev];
      next[i] = concept;
      return next;
    });
    await saveStudioConceptFn({ data: { concept } });
  }

  function setConcepts(next: Concept[]) {
    setConceptsState(next);
  }

  function setDna(next: BrandDna) {
    setDnaState(next);
    void saveStudioDnaFn({ data: { dna: next } });
  }

  function setCollections(next: Collection[]) {
    setCollectionsState(next);
    void saveStudioCollectionsFn({ data: { collections: next } });
  }

  return { concepts, setConcepts, persist, dna, setDna, collections, setCollections, error };
}

export function StudioBoard() {
  const { concepts, error } = useStudio();
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
    <section className="bmg-grid" data-recipe="board" aria-label="داشبورد آتلیه">
      {error ? (
        <p className="nss-meta tm-span">
          {error}{" "}
          {error === "ورود لازم است." ? (
            <a href="/login" className="nss-link">ورود آتلیه</a>
          ) : null}
        </p>
      ) : null}
      <PointCloudGlobe className="pcg-shell--bleed tg-span" hint="DRAG TO ROTATE" />
      {tiles.map((t, i) => (
        <Link key={t.status} to="/" search={{ desk: "production", concept: undefined }} className="nss-link block">
          <NssCard tile stamp={<NdStamp index={i + 1} />}>
            <p className="nss-label">{STATUS_LABEL[t.status]}</p>
            <p className="nss-display">{t.n}</p>
            <p className="nss-meta">کانسپت</p>
          </NssCard>
        </Link>
      ))}
      {concepts.slice(0, 4).map((c, i) => (
        <ConceptTile key={c.id} concept={c} index={i + 5} />
      ))}
    </section>
  );
}

function ConceptTile({ concept, index }: { concept: Concept; index: number }) {
  const still = plate(concept);
  return (
    <Link to="/" search={{ desk: "dossier", concept: concept.id }} className="nss-link block">
      <NssCard tile stamp={<NdStamp index={index} />}>
        <div className="relative h-32">
          <img src={still.src} alt={still.alt} width={1600} height={900} className="h-full w-full object-cover" />
          <div className="nss-plate-veil" />
        </div>
        <p className="nss-label">{TYPE_LABEL[concept.brief.productType]} · {LEVEL_LABEL[concept.brief.level]}</p>
        <p className="nss-body">{concept.title}</p>
        <p className="nss-meta">{STATUS_LABEL[concept.status]} · {CITY_LABEL[concept.city]}</p>
      </NssCard>
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

  async function generate() {
    setBusy(true);
    setError(null);
    setJob(null);
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
      setJobId(created.jobId);
      for (let i = 0; i < MAX_JOB_TICKS; i += 1) {
        const tick = await tickStudioJobFn({ data: { jobId: created.jobId } });
        if (!tick.ok) {
          setError(tick.error);
          break;
        }
        setJob(tick.job);
        if (
          tick.job.status === "succeeded" ||
          tick.job.status === "partial" ||
          tick.job.status === "failed" ||
          tick.job.status === "cancelled"
        ) {
          if (tick.job.error) setError(tick.job.error);
          const list = await listStudioFn();
          setConcepts(list.concepts);
          break;
        }
        if (i === MAX_JOB_TICKS - 1) {
          setError("جاب بیش از حد طول کشید و متوقف شد.");
        }
      }
    } catch (e) {
      setError(studioClientError(e, "جاب شکست خورد. دوباره بزن."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard>
        <p className="nss-label">BRIEF</p>
        <h3 className="nss-display" style={{ fontSize: 32, lineHeight: 1.1 }}>کانسپت تازه</h3>
        <p className="nss-body">نوع، سطح لوکس، وزن، عیار، مناسبت. سه مسیر خلاق با هویت متفاوت.</p>
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
            <input
              className="desk-input"
              type="number"
              min={0.4}
              max={80}
              step={0.1}
              value={brief.weightGrams}
              onChange={(e) => setBrief({ ...brief, weightGrams: Number(e.target.value) })}
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
        <Button className="mt-6" type="button" onClick={() => void generate()} disabled={busy}>
          {busy ? "در حال تولید…" : "سه مسیر بساز"}
        </Button>
        {busy && jobId ? (
          <button
            type="button"
            className="nss-chip nss-link mt-3"
            onClick={() => void cancelStudioJobFn({ data: { jobId } })}
          >
            لغو جاب
          </button>
        ) : null}
        {job ? (
          <p className="nss-meta mt-3">
            {stageLabel(job.stage)} · {job.status}
            {job.resultCount ? ` · ${job.resultCount} مسیر` : ""}
          </p>
        ) : null}
        {error ? <p className="mt-3 text-sm text-down">{error}</p> : null}
      </FrameCard>
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

export function StudioAtelier() {
  const { concepts } = useStudio();
  return (
    <section className="bmg-grid" data-recipe="board" aria-label="آتلیه">
      {concepts.map((c, i) => (
        <ConceptTile key={c.id} concept={c} index={i + 1} />
      ))}
    </section>
  );
}

export function StudioDossier({ id }: { id?: string }) {
  const { concepts, persist } = useStudio();
  const concept = concepts.find((c) => c.id === id) ?? concepts[0];
  if (!concept) {
    return (
      <FrameCard>
        <p className="nss-body">کانسپتی نیست. اول یک مسیر بساز.</p>
      </FrameCard>
    );
  }
  const still = plate(concept);
  const twins = concepts.filter((c) => c.id !== concept.id);
  const near = maxSimilarity(concept.fingerprint, twins.map((c) => c.fingerprint));
  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard className="tm-span">
        <div className="relative mb-4 h-48 overflow-hidden">
          <img src={still.src} alt={still.alt} className="h-full w-full object-cover" />
          <div className="nss-plate-veil" />
        </div>
        <p className="nss-label">{concept.path} · {CITY_LABEL[concept.city]}</p>
        <h3 className="nss-display" style={{ fontSize: 32, lineHeight: 1.1 }}>{concept.title}</h3>
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
      </FrameCard>
      <FrameCard>
        <p className="nss-label">مشخصات</p>
        <dl className="mt-3 space-y-2 text-sm">
          <Row k="ابعاد" v={concept.specs.dimensions} />
          <Row k="وزن" v={`${concept.specs.weightGrams} g`} />
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

function Row({ k, v }: { k: string; v: string }) {
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
        <ol className="nd-list mt-2" data-nd="leading">
          {arch.sequence.map((step) => (
            <li key={step} className="nd-item">
              <span className="nd-title">{step}</span>
            </li>
          ))}
        </ol>
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
          <input className="desk-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="نام مشتری" />
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
  return (
    <FrameCard>
      <p className="nss-label">BRAND DNA</p>
      <h3 className="nss-display" style={{ fontSize: 32, lineHeight: 1.1 }}>{dna.name}</h3>
      {(["promise", "materials", "silhouette", "forbidden"] as const).map((key) => (
        <Field key={key} label={key === "promise" ? "وعده" : key === "materials" ? "متریال" : key === "silhouette" ? "سیلوئت" : "ممنوع"}>
          <textarea
            className="desk-input min-h-20"
            value={dna[key]}
            onChange={(e) => {
              setDna({ ...dna, [key]: e.target.value });
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
        <input className="desk-input mt-3" value={name} onChange={(e) => setName(e.target.value)} placeholder="نام کالکشن" />
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
  return (
    <section className="bmg-grid" data-recipe="board" aria-label="شناسنامه">
      {concepts.map((c, i) => (
        <NssCard key={c.id} tile stamp={<NdStamp index={i + 1} />}>
          <p className="nss-label">{c.limited ? `${c.limited.series} ${c.limited.edition}/${c.limited.of}` : "سری باز"}</p>
          <p className="nss-body">{c.title}</p>
          <p className="nss-meta">{c.passport ? c.passport.serial : "بدون گواهی"}</p>
          {!c.passport ? (
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
          ) : (
            <p className="nss-body mt-3">گواهی اصالت صادر شده.</p>
          )}
        </NssCard>
      ))}
    </section>
  );
}
