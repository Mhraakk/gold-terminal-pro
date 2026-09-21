import {
  CITY_LABEL,
  COMPANION_LABEL,
  KARAT_LABEL,
  LEVEL_LABEL,
  PACKAGE_KIND_LABEL,
  STATUS_LABEL,
  TYPE_LABEL,
} from "./catalog.ts";
import type { Concept } from "./types.ts";

/** Presentable dossier — one concept as a complete product, not a mock. */
export function formatSheet(concept: Concept): string {
  const chosen = concept.set.companions.find((x) => x.id === concept.set.companionId);
  const arch = concept.set.architecture;
  const lines = [
    "زرین — برگه ارائه محصول",
    concept.title,
    `${TYPE_LABEL[concept.brief.productType]} · ${LEVEL_LABEL[concept.brief.level]} · ${CITY_LABEL[concept.city]}`,
    `مسیر: ${concept.path}`,
    `وضعیت: ${STATUS_LABEL[concept.status]} · نسخه ${concept.version}`,
    "",
    "— کانسپت —",
    concept.description,
    concept.story,
    `مخاطب: ${concept.audience}`,
    `استفاده: ${concept.usage}`,
    "",
    "— مشخصات فنی —",
    `ابعاد: ${concept.specs.dimensions}`,
    `وزن: ${concept.specs.weightGrams}g`,
    `عیار: ${KARAT_LABEL[concept.specs.karat]}`,
    `سبک: ${concept.specs.style}`,
    `پیچیدگی ساخت: ${concept.specs.complexity}`,
    `اجرت تقریبی: ${concept.laborEstimate}`,
    `هزینه: ${concept.costApprox}`,
    `بهینه وزن: ${concept.weightOpt}`,
    `تولیدپذیری: ${concept.manufacturability}`,
    concept.variations.length ? `ورییشن‌ها: ${concept.variations.join(" · ")}` : "",
    "",
    "— ست محصول (طلا + همراه + پکیج) —",
    arch.name,
    arch.concept,
    `فرم: ${arch.form}`,
    `گونه: ${PACKAGE_KIND_LABEL[arch.kind]}`,
    `باز شدن: ${arch.opening}`,
    `لایه‌ها: ${arch.layers.join(" → ")}`,
    `ترتیب مواجهه: ${arch.sequence.join(" → ")}`,
    `غافلگیری: ${arch.surprise}`,
    `زندگی بعد: ${arch.afterlife}`,
    `متریال: ${arch.materials.join(" · ")}`,
    `پیچیدگی پکیج: ${arch.complexity}`,
  ];
  if (arch.serial) lines.push(`سریال پکیج: ${arch.serial}`);
  if (arch.edition) lines.push(`ادیشن: ${arch.edition.n} از ${arch.edition.of}`);
  if (arch.dedicateTo) lines.push(`اهدا به: ${arch.dedicateTo}`);
  if (chosen) {
    lines.push(
      "",
      "— محصول دوم —",
      `${COMPANION_LABEL[chosen.kind]} · ${chosen.title}${chosen.isGold ? " · طلا" : ""}`,
      chosen.narrative,
      chosen.specs,
    );
  }
  if (concept.passport) {
    lines.push("", "— شناسنامه —", concept.passport.serial);
  }
  if (concept.limited) {
    lines.push(`لیمیتد ${concept.limited.series} · ${concept.limited.edition}/${concept.limited.of}`);
  }
  return lines.filter((line, i, all) => line !== "" || all[i - 1] !== "").join("\n");
}
