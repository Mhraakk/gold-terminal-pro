import type { AssetId } from "@/data/market/types";

const CDN = "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets";

/** Live Aura hits (gold / jewelry / coin / luxury). Direct CDN, _1600w verified 200. */
export const AURA_STILLS = {
  ring: {
    label: "Abstract Gold Statement Ring on Stone Block",
    alt: "انگشتر طلا روی سنگ تیره",
    src: `${CDN}/b7513e73-303d-4137-a944-ff8663a680bf_1600w.webp`,
  },
  desk: {
    label: "Dark Minimal UI Dashboard Cards with Gold Accents",
    alt: "داشبورد تیره با لهجه طلایی",
    src: `${CDN}/3ff0f777-6fef-48b9-81ec-9c3949d95efa_1600w.webp`,
  },
  coin: {
    label: "Macro Close-up of Bitcoin Coin on Circuit Board",
    alt: "سکه طلا روی مدار",
    src: `${CDN}/c7056afb-8056-4c0a-a971-ca6ca27f9e62_1600w.jpg`,
  },
  vault: {
    label: "Bitcoin coins stacked in frosted cube vault",
    alt: "چیدمان سکه طلا در مکعب",
    src: `${CDN}/ab9f7901-2e36-4b88-96ab-7fa7121f17f6_1600w.jpg`,
  },
  card: {
    label: "Luxury black credit card on glowing fluid wave",
    alt: "کارت لوکس سیاه روی موج نور",
    src: `${CDN}/6d030941-0aa9-425b-908f-655b1984c946_1600w.jpg`,
  },
} as const;

const BY_ASSET: Record<AssetId, keyof typeof AURA_STILLS> = {
  MELTED_GOLD: "ring",
  MESGHAL: "ring",
  GOLD_18K: "ring",
  GOLD_24K: "desk",
  GOLD_GRAM: "desk",
  COIN_EMAMI: "coin",
  COIN_HALF: "coin",
  COIN_QUARTER: "coin",
  COIN_GERAMI: "vault",
  USDIRT: "card",
  USDTIRT: "card",
  XAUUSD: "vault",
};

export function stillForAsset(id: AssetId) {
  return AURA_STILLS[BY_ASSET[id]];
}
