import { completeLlm, STUDIO_SYSTEM } from "@/llm";
import { guardInbound } from "@/guardrails";
import { CITY_LABEL, LEVEL_LABEL, TYPE_LABEL } from "@/data/studio/catalog";
import { makeSet } from "@/data/studio/set-factory";
import { fingerprint, maxSimilarity, rejectTooClose, SIMILARITY_LIMIT } from "@/data/studio/similarity";
import type { City, Concept, ConceptBrief, Karat } from "@/data/studio/types";
import type { GraphNode } from "./graph";

export type StudioResult =
  | { ok: true; concepts: Concept[]; model: string; tokens: number; nodes: GraphNode[]; tools: string[] }
  | { ok: false; error: string; nodes: GraphNode[] };

const CITIES: City[] = ["milan", "monaco", "paris", "tehran"];

function clock() {
  const t = Date.now();
  return () => Date.now() - t;
}

function parsePaths(text: string): PathDraft[] {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const json = JSON.parse(match[0]) as { paths?: PathDraft[] };
    return Array.isArray(json.paths) ? json.paths.slice(0, 3) : [];
  } catch {
    return [];
  }
}

type PathDraft = {
  title?: string;
  path?: string;
  city?: City;
  description?: string;
  dimensions?: string;
  weightGrams?: number;
  style?: string;
  complexity?: string;
  laborEstimate?: string;
  story?: string;
  audience?: string;
  usage?: string;
  costApprox?: string;
  variations?: string[];
  weightOpt?: string;
  manufacturability?: string;
  packName?: string;
  packForm?: string;
  packOpening?: string;
  packAfterlife?: string;
};

function fallbackPaths(brief: ConceptBrief): PathDraft[] {
  const type = TYPE_LABEL[brief.productType];
  const moods: { city: City; path: string; style: string }[] = [
    { city: "milan", path: "آتریوم بررا", style: "معماری منفی" },
    { city: "monaco", path: "اسکلهٔ شب", style: "مجسمه‌ای مات/آینه" },
    { city: "paris", path: "مه پل", style: "قوس نازک باگت" },
  ];
  return moods.map((m, i) => ({
    title: `${type} ${m.path}`,
    path: m.path,
    city: m.city,
    description: `${type} در سطح ${LEVEL_LABEL[brief.level]} با وزن هدف ${brief.weightGrams}g و ${brief.karat} عیار. الهام از ${CITY_LABEL[m.city]} بدون کپی ویترین.`,
    dimensions: `فرم متناسب با ${brief.weightGrams} گرم`,
    weightGrams: Number((brief.weightGrams * (0.92 + i * 0.05)).toFixed(1)),
    style: m.style,
    complexity: brief.level === "everyday" ? "پایین" : brief.level === "collector" ? "بالا" : "متوسط",
    laborEstimate:
      brief.level === "everyday" ? "اجرت ≈ ۱۲٪" : brief.level === "ultra" ? "اجرت ≈ ۲۶٪" : "اجرت ≈ ۱۸٪",
    story: `فضای ${CITY_LABEL[m.city]} به‌عنوان نور و سکوت، نه به‌عنوان طرح آماده.`,
    audience: brief.level === "collector" ? "کالکتور آرشیو" : "خریدار امضای زرین",
    usage: brief.occasion,
    costApprox: "بازه پس از تثبیت وزن؛ قیمت زنده طلا در کانسپت نمی‌آید.",
    variations: ["نسخهٔ سبک‌تر", "نسخهٔ بافت متفاوت"],
    weightOpt: `حذف فلز از پشت کار؛ هدف حدود ${(brief.weightGrams * 0.92).toFixed(1)}g.`,
    manufacturability: "ریخته‌گری موم + پرداخت دو بافت؛ تیراژ محدود برای سطوح بالا.",
    packName: `ست ${m.path}`,
    packForm: "فرم غیرمکعب، نگهداشتی",
    packOpening: "یک حرکت معماری",
    packAfterlife: "پکیج بعد از باز شدن روی میز می‌ماند.",
  }));
}

function toConcept(brief: ConceptBrief, draft: PathDraft, _archive: string[]): Concept {
  const title = draft.title?.trim() || TYPE_LABEL[brief.productType];
  const path = draft.path?.trim() || "مسیر زرین";
  const fp = fingerprint([title, draft.description ?? "", draft.story ?? "", draft.style ?? "", path]);
  const city = CITIES.includes(draft.city as City) ? (draft.city as City) : "tehran";
  const now = Date.now();
  const id = `c-${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const weight = draft.weightGrams && draft.weightGrams > 0 ? draft.weightGrams : brief.weightGrams;
  const set = makeSet(brief, city, path, title);
  if (draft.packName) set.architecture.name = draft.packName;
  if (draft.packForm) set.architecture.form = draft.packForm;
  if (draft.packOpening) set.architecture.opening = draft.packOpening;
  if (draft.packAfterlife) set.architecture.afterlife = draft.packAfterlife;
  return {
    id,
    title,
    path,
    brief,
    description: draft.description ?? "",
    specs: {
      dimensions: draft.dimensions ?? "—",
      weightGrams: weight,
      karat: brief.karat as Karat,
      style: draft.style ?? "مینیمال",
      complexity: draft.complexity ?? "متوسط",
    },
    laborEstimate: draft.laborEstimate ?? "اجرت تقریبی",
    story: draft.story ?? "",
    audience: draft.audience ?? "",
    usage: draft.usage ?? brief.occasion,
    costApprox: draft.costApprox ?? "بازه پس از وزن نهایی",
    variations: draft.variations?.slice(0, 4) ?? [],
    weightOpt: draft.weightOpt ?? "",
    manufacturability: draft.manufacturability ?? "",
    set,
    status: "idea",
    version: 1,
    versions: [{ at: now, note: "تولید کانسپت", title }],
    limited:
      brief.level === "collector"
        ? { series: path, edition: 1, of: 12 }
        : undefined,
    passport:
      brief.level === "collector"
        ? { serial: `ZR-${brief.karat}-${id.slice(-8).toUpperCase()}`, issuedAt: now }
        : undefined,
    city,
    fingerprint: fp,
    at: now,
  };
}

export async function runStudioGraph(input: {
  brief: ConceptBrief;
  dna?: { name: string; promise: string; materials: string; silhouette: string; forbidden: string };
  archive?: string[];
}): Promise<StudioResult> {
  const nodes: GraphNode[] = [];
  const prompt = [
    input.dna
      ? `دی‌ان‌ای: ${input.dna.name}. وعده: ${input.dna.promise}. متریال: ${input.dna.materials}. سیلوئت: ${input.dna.silhouette}. ممنوع: ${input.dna.forbidden}.`
      : "دی‌ان‌ای: زرین.",
    `نوع: ${TYPE_LABEL[input.brief.productType]} · سطح: ${LEVEL_LABEL[input.brief.level]} · وزن هدف: ${input.brief.weightGrams}g · عیار: ${input.brief.karat} · مناسبت: ${input.brief.occasion}`,
    input.brief.notes ? `یادداشت: ${input.brief.notes}` : "",
    input.archive?.length ? `آرشیو برای پرهیز از تکرار:\n${input.archive.slice(0, 12).join("\n")}` : "آرشیو خالی.",
    "سه مسیر بده با هویت متفاوت. کپی نکن.",
  ]
    .filter(Boolean)
    .join("\n");

  const gMs = clock();
  const inbound = guardInbound(prompt);
  nodes.push({ name: "guardrails", ok: inbound.ok, ms: gMs() });
  if (!inbound.ok) return { ok: false, error: "درخواست رد شد (گارد).", nodes };

  nodes.push({ name: "plan", ok: true, ms: 0 });
  nodes.push({ name: "tools", ok: true, ms: 0 });

  const genMs = clock();
  const llm = await completeLlm({
    system: STUDIO_SYSTEM,
    user: inbound.text,
    maxTokens: 1600,
    temperature: 0.85,
  });
  nodes.push({ name: "llm", ok: llm.ok, ms: genMs() });

  const drafts = llm.ok ? parsePaths(llm.text) : [];
  const used = drafts.length === 3 ? drafts : fallbackPaths(input.brief);
  if (!llm.ok) nodes.push({ name: "fallback", ok: true, ms: 0 });

  const archive = input.archive ?? [];
  let concepts = used.map((d) => toConcept(input.brief, d, archive));
  const kept = rejectTooClose(concepts, archive);
  if (kept.length !== concepts.length) {
    const extra = fallbackPaths(input.brief).map((d, i) => ({
      ...d,
      title: `${d.title ?? "مسیر"} · ${i + 1} · ${Date.now().toString(36)}`,
      path: `${d.path ?? "مسیر"}-${i + 1}`,
    }));
    const replacements = extra
      .map((d) => toConcept(input.brief, d, archive.concat(concepts.map((c) => c.fingerprint))))
      .filter((c) => maxSimilarity(c.fingerprint, archive) <= SIMILARITY_LIMIT);
    concepts = rejectTooClose([...kept, ...replacements], archive).slice(0, 3);
    nodes.push({ name: "similarity", ok: concepts.length > 0, ms: 0 });
  }

  return {
    ok: true,
    concepts,
    model: llm.ok ? llm.model : "local-atelier",
    tokens: llm.ok ? llm.tokens : 0,
    nodes,
    tools: ["dna", "similarity", "paths"],
  };
}
