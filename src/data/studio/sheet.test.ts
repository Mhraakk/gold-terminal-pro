import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatSheet } from "./sheet.ts";
import { makeSet } from "./set-factory.ts";
import type { Concept } from "./types.ts";

function sample(): Concept {
  const brief = {
    productType: "ring" as const,
    level: "signature" as const,
    weightGrams: 6.2,
    karat: 18 as const,
    occasion: "سالگرد",
    notes: "بدون نگین مرکزی",
  };
  const set = makeSet(brief, "monaco", "خط ساحل موناکو", "انگشتر لیدو");
  return {
    id: "c-lido",
    title: "انگشتر لیدو",
    path: "خط ساحل موناکو",
    brief,
    description: "حلقهٔ مجسمه‌ای با شیب داخلی مثل اسکله.",
    specs: {
      dimensions: "قطر داخلی ۱۶.۵mm",
      weightGrams: 6.2,
      karat: 18,
      style: "مجسمه‌ای مینیمال",
      complexity: "متوسط",
    },
    laborEstimate: "اجرت تقریبی ۱۸٪",
    story: "الهام از اسکلهٔ لیدو در غروب.",
    audience: "خریدار امضای برند",
    usage: "روزمره لوکس",
    costApprox: "بازهٔ متوسط امضا",
    variations: ["نسخهٔ ۲۱ عیار"],
    weightOpt: "هدف ۵.۸g",
    manufacturability: "ریخته‌گری موم",
    set,
    status: "approved",
    version: 2,
    versions: [{ at: 1, note: "تأیید", title: "انگشتر لیدو" }],
    city: "monaco",
    fingerprint: "lido",
    at: 1,
  };
}

describe("presentable sheet", () => {
  it("emits a complete product, not an empty box", () => {
    const text = formatSheet(sample());
    assert.match(text, /انگشتر لیدو/);
    assert.match(text, /مشخصات فنی/);
    assert.match(text, /ست محصول/);
    assert.match(text, /محصول دوم/);
    assert.match(text, /ترتیب مواجهه/);
    assert.match(text, /6\.2g/);
    assert.ok(!text.includes("undefined"));
    assert.ok(!text.includes("[object Object]"));
  });

  it("includes dedication and serial when present", () => {
    const base = sample();
    const text = formatSheet({
      ...base,
      passport: { serial: "ZR-18-TEST", issuedAt: 1 },
      set: {
        ...base.set,
        architecture: {
          ...base.set.architecture,
          kind: "personal",
          serial: "PK-TEST",
          dedicateTo: "مهتاب",
        },
      },
    });
    assert.match(text, /ZR-18-TEST/);
    assert.match(text, /مهتاب/);
    assert.match(text, /PK-TEST/);
  });
});

describe("set factory", () => {
  it("builds four narrative companions with one gold charm", () => {
    const set = makeSet(
      { productType: "ring", level: "ultra", weightGrams: 8, karat: 21, occasion: "عروسی", notes: "" },
      "paris",
      "مه پل",
      "انگشتر مه پل",
    );
    assert.equal(set.companions.length, 4);
    assert.equal(set.companions.filter((c) => c.isGold).length, 1);
    assert.equal(set.companionId, set.companions[0]?.id);
    assert.ok(set.architecture.sequence.length >= 3);
    assert.ok(set.architecture.afterlife.length > 8);
  });

  it("gives each city a distinct keep-worthy form", () => {
    const brief = {
      productType: "necklace" as const,
      level: "collector" as const,
      weightGrams: 12,
      karat: 18 as const,
      occasion: "کالکشن فصل",
      notes: "",
    };
    const monaco = makeSet(brief, "monaco", "اسکله", "عنوان");
    const milan = makeSet(brief, "milan", "آتریوم", "عنوان");
    const paris = makeSet(brief, "paris", "مه", "عنوان");
    const tehran = makeSet(brief, "tehran", "شبکه", "عنوان");
    const forms = new Set([monaco, milan, paris, tehran].map((s) => s.architecture.form));
    assert.equal(forms.size, 4);
  });
});
