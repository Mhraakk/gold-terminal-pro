import type { City, CompanionKind, ConceptStatus, Karat, LuxuryLevel, PackageKind, ProductType } from "./types";

export const LEVEL_LABEL: Record<LuxuryLevel, string> = {
  everyday: "استفاده روزمره لوکس",
  signature: "امضای برند",
  ultra: "لاین بسیار لاکچری",
  collector: "کالکتورز ادیشن",
};

export const TYPE_LABEL: Record<ProductType, string> = {
  ring: "انگشتر",
  necklace: "گردنبند",
  earring: "گوشواره",
  bracelet: "دستبند",
  set: "سرویس",
  brooch: "سنجاق",
  watch: "ساعت طلا",
  object: "شیء دکوراتیو",
  bridal: "ست عروسی",
};

export const STATUS_LABEL: Record<ConceptStatus, string> = {
  idea: "ایده",
  approved: "تأیید شده",
  production: "در تولید",
  packaging: "ست پکیج",
};

export const CITY_LABEL: Record<City, string> = {
  milan: "میلان",
  monaco: "موناکو",
  paris: "پاریس",
  tehran: "تهران",
};

export const KARAT_LABEL: Record<Karat, string> = {
  18: "۱۸ عیار",
  21: "۲۱ عیار",
  22: "۲۲ عیار",
  24: "۲۴ عیار",
};

export const COMPANION_LABEL: Record<CompanionKind, string> = {
  charm: "چارم طلا",
  art: "آبجکت هنری",
  relic: "قطعهٔ کلکسیونی داستان",
  surprise: "سورپرایز شخصی",
};

export const PACKAGE_KIND_LABEL: Record<PackageKind, string> = {
  object: "شیء نگهداشتی",
  collectible: "پکیج کالکت‌ابل",
  limited: "لیمیتد سریال",
  personal: "پکیج شخصی",
};

export const OCCASIONS = [
  "روزمره",
  "نامزدی",
  "عروسی",
  "سالگرد",
  "هدیهٔ شرکتی",
  "فرش قرمز",
  "رمضان / عید",
  "کالکشن فصل",
];
