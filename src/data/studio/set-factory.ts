import { CITY_LABEL, TYPE_LABEL } from "./catalog.ts";
import type { City, Companion, ConceptBrief, PackageArchitecture, ProductSet } from "./types.ts";

function id(prefix: string, n: number) {
  return `${prefix}-${n}`;
}

export function companionsFor(brief: ConceptBrief, city: City, path: string): Companion[] {
  const type = TYPE_LABEL[brief.productType];
  const place = CITY_LABEL[city];
  return [
    {
      id: id("ch", 1),
      kind: "charm",
      title: `چارم ${path}`,
      isGold: true,
      narrative: `همان خط منفی ${type} در مقیاس مینیاتوری؛ با داستان ${place} یکی است، نه آویز تبلیغاتی.`,
      specs: `طلا ${brief.karat} عیار · ۰.۶–۰.۹g · بست مخفی`,
    },
    {
      id: id("ch", 2),
      kind: "art",
      title: `سنگ افق ${place}`,
      isGold: false,
      narrative: `قطعهٔ سنگی/شیشه‌ای با همان شیب سیلوئت ${type}؛ روی میز می‌ماند وقتی طلا پوشیده می‌شود.`,
      specs: "حجم کف دست · سطح مات روبه‌روی نوار براق",
    },
    {
      id: id("ch", 3),
      kind: "relic",
      title: `کارت نقش ${path}`,
      isGold: false,
      narrative: `نقشه یا برش معماری همان فضا؛ کلکسیونر سند روایت را نگه می‌دارد نه کاتالوگ برند.`,
      specs: "فلز نازک یا کاغذ آرشیوی · شمارهٔ پشت",
    },
    {
      id: id("ch", 4),
      kind: "surprise",
      title: "نامهٔ وزن",
      isGold: false,
      narrative: `غافلگیری شخصی: وزن نهایی و یک جمله از داستان ${path} برای همان خریدار.`,
      specs: "کاغذ نخی · مرکب · فقط یک نسخه",
    },
  ];
}

export function architectureFor(city: City, path: string, title: string): PackageArchitecture {
  const place = CITY_LABEL[city];
  const forms: Record<City, PackageArchitecture> = {
    monaco: {
      name: `اسکلهٔ ${path}`,
      concept: `پکیج یک اسکلهٔ رومیزی است نه جعبه. ${title} روی افق می‌نشیند؛ بعد از باز شدن، اسکله جاقلمی یا پایهٔ حلقه می‌ماند.`,
      form: " منشور افقی با شیب یک‌طرفه، شبیه اسکله نه مکعب",
      opening: "کشوی افقی از سمت آب؛ یک حرکت، بدون در لولایی",
      materials: ["چوب بلوط سوخته", "برنج خام", "ابریشم دودی"],
      layers: ["پوستهٔ اسکله", "بستر افق", "حفرهٔ چارم", "کف نامه"],
      sequence: ["دیدن افق بسته", "کشیدن موج", "رسیدن به طلا", "کشف همراه در حفرهٔ دوم", "نامه زیر کف"],
      surprise: "کف بعد از برداشتن طلا کمی فرو می‌رود و همراه پیدا می‌شود.",
      afterlife: "اسکله روی میز کار می‌ماند؛ حلقه شب‌ها روی همان شیب برمی‌گردد.",
      complexity: "متوسط — فرز چوب + کشوی دقیق + دو حفره",
      kind: "object",
    },
    milan: {
      name: `آتریوم ${path}`,
      concept: `پکیج حیاطی است که نور از شکاف ۲mm رد می‌شود. جعبه بعداً قاب عکس یا جاانگشتری دیواری است.`,
      form: "دو صفحهٔ موازی با فاصلهٔ معماری، نه درب کلاسیک",
      opening: "جدا کردن صفحات عمودی مثل در حیاط",
      materials: ["سنگ مصنوعی مات", "برنج", "مغناطیس پنهان"],
      layers: ["صفحهٔ بیرونی", "هوای منفی", "تعلیق طلا", "نشست همراه"],
      sequence: ["دیدن شکاف نور", "باز شدن هوا", "طلا معلق", "همراه در سایهٔ پایین"],
      surprise: "همراه تا وقتی صفحات کاملاً جدا نشوند دیده نمی‌شود.",
      afterlife: "صفحات روی دیوار پیچ می‌شوند؛ شکاف نور می‌ماند.",
      complexity: "بالا — تلورانس ۲mm و مغناطیس",
      kind: "object",
    },
    paris: {
      name: `مه ${path}`,
      concept: `شیشهٔ مات که بالا می‌آید؛ پکیج بعداً محفظهٔ سند و سنجاق است.`,
      form: "استوانهٔ کوتاه شیشه‌ای با سقف متحرک",
      opening: "بالا آمدن سقف با اصطکاک کنترل‌شده",
      materials: ["شیشهٔ مات", "موم شماره", "فلز نازک"],
      layers: ["مه بیرونی", "افق کاغذ", "طلا", "محفظهٔ همراه"],
      sequence: ["دیدن مه", "صعود سقف", "افق", "طلا", "موم و همراه"],
      surprise: "موم شماره فقط بعد از برداشتن طلا لمس می‌شود.",
      afterlife: "استوانه ویترین رومیزی سند اصالت می‌ماند.",
      complexity: "بالا — شیشه و تلورانس اصطکاک",
      kind: "limited",
    },
    tehran: {
      name: `شبکهٔ ${path}`,
      concept: `یک لایهٔ سریع که بعداً جعبهٔ کارت ویزیت یا سینی کلید است.`,
      form: "جلد باریک تاشو، نه مکعب جواهر",
      opening: "تا شدن یک‌باره مثل پاکت معماری",
      materials: ["مقوای فشرده مشکی", "روبان باریک", "فلز گوشه"],
      layers: ["جلد", "طلا", "همراه در لت دوم"],
      sequence: ["باز کردن لت", "طلا", "لت دوم همراه"],
      surprise: "لت دوم قفل نرم دارد؛ همراه جدا از طلا می‌رسد.",
      afterlife: "جلد روی میز، جای کارت.",
      complexity: "پایین — تیراژپذیر با گوشهٔ فلزی",
      kind: "object",
    },
  };
  return { ...forms[city], concept: forms[city].concept.replace("PLACE", place) };
}

export function makeSet(brief: ConceptBrief, city: City, path: string, title: string): ProductSet {
  const companions = companionsFor(brief, city, path);
  return {
    companions,
    companionId: companions[0].id,
    architecture: architectureFor(city, path, title),
  };
}
