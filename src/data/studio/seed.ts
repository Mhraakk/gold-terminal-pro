import { fingerprint } from "./similarity";
import { makeSet } from "./set-factory";
import { taggedId } from "./tag";
import type { BrandDna, Collection, Concept } from "./types";

export const SEED_DNA: BrandDna = {
  name: "زرین",
  promise: "طلای معاصر با سکوت لوکس؛ الهام از میلان، موناکو و پاریس، بدون کپی. پکیج بخشی از محصول است نه ظرف.",
  materials: "طلای زرد ۱۸–۲۲، الماس باگت کم‌شمار، اونیکس مات، مینای مشکی.",
  silhouette: "خط منفی زیاد، حجم مجسمه‌ای، بست پنهان، سطح آیینه‌ای در برابر بافت شن.",
  forbidden: "لوگوی بزرگ، نگین رنگین انبوه، فرم ترند تیک‌تاک، کپی از خانهٔ معروف، جعبهٔ مکعب ویترینی بی‌روایت.",
  cities: ["milan", "monaco", "paris", "tehran"],
};

export const SEED_COLLECTIONS: Collection[] = [
  {
    id: "col-nocturne",
    name: "نوکتیورن",
    season: "پاییز",
    note: "شب‌های موناکو؛ طلای خاموش و خط افق.",
    at: Date.now() - 86400000 * 12,
  },
  {
    id: "col-atelier",
    name: "آتلیه میلان",
    season: "بهار",
    note: "کارگاه بررا؛ حجم مجسمه، بست پنهان.",
    at: Date.now() - 86400000 * 40,
  },
];

function c(partial: Omit<Concept, "fingerprint" | "set">): Concept {
  return {
    ...partial,
    set: makeSet(partial.brief, partial.city, partial.path, partial.title),
    fingerprint: fingerprint([partial.title, partial.description, partial.story, partial.specs.style, partial.path]),
  };
}

export const SEED_CONCEPTS: Concept[] = [
  c({
    id: "c-lido",
    title: "انگشتر لیدو",
    path: "خط ساحل موناکو",
    brief: {
      productType: "ring",
      level: "signature",
      weightGrams: 6.2,
      karat: 18,
      occasion: "سالگرد",
      notes: "بدون نگین مرکزی",
    },
    description: "حلقهٔ مجسمه‌ای با شیب داخلی مثل اسکله؛ سطح نیمه‌مات روبه‌روی نوار آینه.",
    specs: {
      dimensions: "قطر داخلی ۱۶.۵mm · پهنا ۴.۸mm · ضخامت ۲.۱mm",
      weightGrams: 6.2,
      karat: 18,
      style: "مجسمه‌ای مینیمال",
      complexity: "متوسط — فرز ۵محوره + پولیش دو بافت",
    },
    laborEstimate: "اجرت تقریبی ۱۸٪ روی مظنهٔ گرم",
    story: "الهام از اسکلهٔ لیدو در غروب، نه از جواهرات ویترین مونت‌کارلو.",
    audience: "زن و مرد ۳۲–۵۰، خریدار امضای برند نه ترند.",
    usage: "روزمره لوکس و شام رسمی؛ با پیراهن مشکی یا کت ناوگان.",
    costApprox: "طلا + اجرت + جعبه ≈ بازهٔ متوسط امضا",
    variations: ["نسخهٔ ۲۱ عیار سنگین‌تر", "نسخهٔ اونیکس اینله"],
    weightOpt: "حذف فلز از شانهٔ داخلی؛ هدف ۵.۸g بدون از دست دادن حجم بصری.",
    manufacturability: "قابل ریخته‌گری موم؛ پرداخت دو بافت نیاز به جیگ اختصاصی.",
    collectionId: "col-nocturne",
    status: "approved",
    version: 2,
    versions: [
      { at: Date.now() - 86400000, note: "تأیید آتلیه", title: "انگشتر لیدو" },
      { at: Date.now() - 86400000 * 3, note: "نسخهٔ اول", title: "انگشتر لیدو" },
    ],
    city: "monaco",
    at: Date.now() - 86400000 * 3,
  }),
  c({
    id: "c-brera",
    title: "گوشواره بررا",
    path: "آتریوم میلان",
    brief: {
      productType: "earring",
      level: "ultra",
      weightGrams: 9.4,
      karat: 18,
      occasion: "فرش قرمز",
      notes: "آویز معماری",
    },
    description: "آویز دو صفحهٔ طلا با فاصلهٔ ۲mm؛ نور از شکاف می‌گذرد.",
    specs: {
      dimensions: "طول ۳۸mm · عرض ۱۱mm · شکاف ۲mm",
      weightGrams: 9.4,
      karat: 18,
      style: "معماری منفی",
      complexity: "بالا — لحیم مخفی + تعادل وزن گوش",
    },
    laborEstimate: "اجرت تقریبی ۲۶٪",
    story: "حیاط بررا در ظهر؛ سایهٔ ستون، نه نمای دووم.",
    audience: "کلکسیونر رویداد، استایلیست فرش.",
    usage: "شام و نمایش؛ با گردن لخت.",
    costApprox: "بازهٔ لاین بسیار لاکچری",
    variations: ["نسخهٔ تک‌گوش", "نسخهٔ کوتاه روزمره"],
    weightOpt: "صفحهٔ پشتی ۰.۶mm؛ هدف ۸.1g.",
    manufacturability: "نیاز به جیگ فاصله و کنترل پیچش.",
    collectionId: "col-atelier",
    status: "packaging",
    version: 3,
    versions: [{ at: Date.now() - 86400000 * 2, note: "ورود به پکیجینگ", title: "گوشواره بررا" }],
    city: "milan",
    at: Date.now() - 86400000 * 8,
  }),
  c({
    id: "c-seine",
    title: "سنجاق سن",
    path: "پل پاریس",
    brief: {
      productType: "brooch",
      level: "collector",
      weightGrams: 14,
      karat: 22,
      occasion: "کالکشن فصل",
      notes: "سری محدود ۱۲",
    },
    description: "قوس طلای ۲۲ با یک باگت؛ قفل مخفی پشت پل.",
    specs: {
      dimensions: "دهانه ۴۶mm · ارتفاع ۹mm",
      weightGrams: 14,
      karat: 22,
      style: "مجسمهٔ پوشیدنی",
      complexity: "بالا — قفل اختصاصی",
    },
    laborEstimate: "اجرت تقریبی ۳۴٪",
    story: "قوس پل در مه صبح؛ کپی از جواهر پاریسی نیست.",
    audience: "کالکتور، آرشیو شخصی.",
    usage: "کت رسمی؛ سنجاق تنها روی یقه.",
    costApprox: "ادیشن محدود؛ قیمت پس از تأیید وزن نهایی",
    variations: ["نسخهٔ ۱۸ عیار روزمره — رد شده برای حفظ ادیشن"],
    weightOpt: "قوس توخالی کنترل‌شده؛ کف ۱۳.2g.",
    manufacturability: "قفل نیاز به قالب فولادی؛ تیراژ ۱۲ منطقی است.",
    collectionId: "col-nocturne",
    status: "production",
    version: 1,
    versions: [{ at: Date.now() - 86400000 * 5, note: "ورود به تولید", title: "سنجاق سن" }],
    limited: { series: "PONT", edition: 3, of: 12 },
    city: "paris",
    at: Date.now() - 86400000 * 5,
  }),
  c({
    id: "c-darb",
    title: "دستبند دربند",
    path: "شب تهران",
    brief: {
      productType: "bracelet",
      level: "everyday",
      weightGrams: 11,
      karat: 18,
      occasion: "روزمره",
      notes: "قفل نرم برای کار روزانه",
    },
    description: "نوار منعطف با یک شکست معماری؛ مناسب میز کار.",
    specs: {
      dimensions: "محیط ۱۶.۵cm · پهنا ۷mm",
      weightGrams: 11,
      karat: 18,
      style: "مینیمال روزمره",
      complexity: "پایین — لولا و فنر استاندارد",
    },
    laborEstimate: "اجرت تقریبی ۱۲٪",
    story: "شب دربند از دور؛ چراغ نه لوگو.",
    audience: "حرفه‌ای شهری، هدیهٔ سبک.",
    usage: "هر روز؛ زیر آستین پیراهن.",
    costApprox: "بازهٔ روزمره لوکس",
    variations: ["نسخهٔ باریک ۹g"],
    weightOpt: "نوار توخالی در پشت مچ.",
    manufacturability: "تیراژ بالا ممکن است.",
    status: "idea",
    version: 1,
    versions: [{ at: Date.now() - 86400000, note: "ثبت ایده", title: "دستبند دربند" }],
    city: "tehran",
    at: Date.now() - 86400000,
  }),
];

export function taggedSeed(userId: string) {
  return {
    concepts: SEED_CONCEPTS.map((c) => ({
      ...c,
      id: taggedId(c.id, userId),
      collectionId: c.collectionId ? taggedId(c.collectionId, userId) : undefined,
    })),
    collections: SEED_COLLECTIONS.map((col) => ({
      ...col,
      id: taggedId(col.id, userId),
    })),
  };
}
