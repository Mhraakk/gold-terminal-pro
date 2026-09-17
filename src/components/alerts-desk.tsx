import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FrameCard } from "@/components/frame";
import { ASSETS } from "@/data/market/assets";
import type { AssetId, MarketQuote } from "@/data/market/types";
import { formatPrice } from "@/lib/format";
import { loadAlerts, saveAlerts, type PriceAlert } from "@/lib/desk-store";

export function AlertsDesk({ quotes }: { quotes: MarketQuote[] }) {
  const [items, setItems] = useState<PriceAlert[]>([]);
  const [assetId, setAssetId] = useState<AssetId>("COIN_EMAMI");
  const [price, setPrice] = useState("");
  const [direction, setDirection] = useState<"above" | "below">("above");
  const live = useMemo(() => Object.fromEntries(quotes.map((q) => [q.id, q])), [quotes]);

  useEffect(() => {
    setItems(loadAlerts());
  }, []);

  function add() {
    const p = Number(price);
    if (!Number.isFinite(p) || p <= 0) return;
    const next = [
      ...items,
      { id: crypto.randomUUID(), assetId, direction, price: p, createdAt: Date.now(), fired: false },
    ];
    setItems(next);
    saveAlerts(next);
    setPrice("");
  }

  const watched = items.map((a) => {
    const px = live[a.assetId]?.price ?? 0;
    const hit = px > 0 && (a.direction === "above" ? px >= a.price : px <= a.price);
    return { ...a, hit, live: px };
  });

  return (
    <FrameCard className="p-4">
      <p className="label-tech">ALERTS</p>
      <h3 className="mt-1 mb-4 text-lg font-light">هشدار قیمت</h3>
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value as AssetId)}
          className="desk-input"
          aria-label="دارایی"
        >
          {ASSETS.map((a) => (
            <option key={a.id} value={a.id} className="bg-ink">
              {a.persianName}
            </option>
          ))}
        </select>
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as "above" | "below")}
          className="desk-input"
          aria-label="جهت"
        >
          <option value="above" className="bg-ink">
            بالای
          </option>
          <option value="below" className="bg-ink">
            زیر
          </option>
        </select>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="سطح"
          className="desk-input"
          aria-label="سطح قیمت"
        />
        <Button variant="primary" onClick={add}>
          ثبت هشدار
        </Button>
      </div>
      {watched.length === 0 ? (
        <p className="text-sm text-muted">هشداری نیست. برخورد با سطح زنده علامت می‌خورد.</p>
      ) : (
        <ul className="space-y-2">
          {watched.map((a) => {
            const meta = ASSETS.find((x) => x.id === a.assetId);
            return (
              <li key={a.id} className="well flex items-center justify-between p-3 text-sm">
                <span>
                  {meta?.persianName} {a.direction === "above" ? "≥" : "≤"} {formatPrice(a.price)}
                </span>
                <span className={a.hit ? "text-gold" : "text-muted"}>{a.hit ? "برخورد" : formatPrice(a.live)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </FrameCard>
  );
}
