import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { filterArchive, matchesQuery } from "./archive.ts";
import { makeSet } from "./set-factory.ts";
import type { Concept } from "./types.ts";

function sample(partial: Partial<Concept> & Pick<Concept, "id" | "title" | "status">): Concept {
  const brief = partial.brief ?? {
    productType: "ring" as const,
    level: "signature" as const,
    weightGrams: 6,
    karat: 18 as const,
    occasion: "سالگرد",
    notes: "",
  };
  const title = partial.title;
  const city = partial.city ?? "monaco";
  const path = partial.path ?? "لیدو";
  return {
    description: "حلقهٔ مجسمه‌ای اسکله",
    specs: {
      dimensions: "۱۶mm",
      weightGrams: 6,
      karat: 18,
      style: "مجسمه‌ای مینیمال",
      complexity: "متوسط",
    },
    laborEstimate: "۱۸٪",
    story: "غروب اسکلهٔ موناکو",
    audience: "امضای برند",
    usage: "شام",
    costApprox: "بازه متوسط",
    variations: [],
    weightOpt: "",
    manufacturability: "",
    set: makeSet(brief, city, path, title),
    version: 1,
    versions: [],
    fingerprint: "انگشتر لیدو اسکله موناکو",
    at: 1,
    path,
    brief,
    city,
    ...partial,
    title,
  };
}

describe("archive filter", () => {
  const rows = [
    sample({ id: "a", title: "انگشتر لیدو", status: "approved", path: "لیدو" }),
    sample({
      id: "b",
      title: "گوشواره بررا",
      status: "idea",
      path: "بررا",
      city: "milan",
      description: "حجم منفی حیاط بررا",
      story: "نور شکاف ۲mm آتریوم میلان",
      brief: {
        productType: "earring",
        level: "ultra",
        weightGrams: 4,
        karat: 18,
        occasion: "شام",
        notes: "",
      },
      fingerprint: "گوشواره بررا میلان آتریوم",
    }),
  ];

  it("filters by status and type from the dashboard buckets", () => {
    assert.equal(filterArchive(rows, { status: "approved" }).length, 1);
    assert.equal(filterArchive(rows, { type: "earring" })[0]?.id, "b");
    assert.equal(filterArchive(rows, { level: "signature" })[0]?.id, "a");
  });

  it("finds a concept by Persian phrase, not only exact title", () => {
    const hit = filterArchive(rows, { q: "اسکله" });
    assert.equal(hit.length, 1);
    assert.equal(hit[0]?.id, "a");
    assert.equal(matchesQuery(rows[0]!, "لیدو"), true);
    assert.equal(filterArchive(rows, { q: "xyz-no-hit" }).length, 0);
  });
});
