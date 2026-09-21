import type { ProductType } from "@/data/studio/types";

export const ATELIER_STILLS: Record<ProductType, { src: string; alt: string }> = {
  ring: { src: "/atelier/ring.jpg", alt: "انگشتر طلا روی سنگ تیره" },
  necklace: { src: "/atelier/necklace.jpg", alt: "گردنبند طلا" },
  earring: { src: "/atelier/earring.jpg", alt: "گوشواره طلا" },
  bracelet: { src: "/atelier/bracelet.jpg", alt: "دستبند طلا" },
  set: { src: "/atelier/necklace.jpg", alt: "سرویس طلا" },
  brooch: { src: "/atelier/object.jpg", alt: "سنجاق طلا" },
  watch: { src: "/atelier/watch.jpg", alt: "ساعت طلا" },
  object: { src: "/atelier/object.jpg", alt: "شیء طلا" },
  bridal: { src: "/atelier/ring.jpg", alt: "ست عروسی طلا" },
};

export function stillForType(type: ProductType) {
  return ATELIER_STILLS[type] ?? ATELIER_STILLS.ring;
}
