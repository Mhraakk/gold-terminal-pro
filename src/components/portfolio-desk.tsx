import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FrameCard } from "@/components/frame";
import { ASSETS } from "@/data/market/assets";
import type { AssetId, MarketQuote } from "@/data/market/types";
import { formatPrice, formatSigned } from "@/lib/format";
import { loadPositions, savePositions, type Position } from "@/lib/desk-store";

export function PortfolioDesk({ quotes }: { quotes: MarketQuote[] }) {
  const [items, setItems] = useState<Position[]>([]);
  const [assetId, setAssetId] = useState<AssetId>("GOLD_18K");
  const [qty, setQty] = useState("1");
  const [entry, setEntry] = useState("");

  useEffect(() => {
    setItems(loadPositions());
  }, []);

  const live = useMemo(() => Object.fromEntries(quotes.map((q) => [q.id, q])), [quotes]);

  function add() {
    const q = Number(qty);
    const e = Number(entry) || live[assetId]?.price || 0;
    if (!Number.isFinite(q) || q <= 0 || e <= 0) return;
    const next = [
      ...items,
      { id: crypto.randomUUID(), assetId, side: "buy" as const, qty: q, entry: e, note: "", at: Date.now() },
    ];
    setItems(next);
    savePositions(next);
    setQty("1");
    setEntry("");
  }

  function remove(id: string) {
    const next = items.filter((p) => p.id !== id);
    setItems(next);
    savePositions(next);
  }

  const pnl = items.reduce((sum, p) => {
    const px = live[p.assetId]?.price ?? 0;
    return sum + (px - p.entry) * p.qty;
  }, 0);

  return (
    <FrameCard className="p-4">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="label-tech">BOOK</p>
          <h3 className="mt-1 text-lg font-light">دفتر پوزیشن</h3>
        </div>
        <p className="num text-sm text-muted">
          PnL باز: <span className={pnl >= 0 ? "text-up" : "text-down"}>{formatSigned(pnl)}</span>
        </p>
      </div>
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <select
          value={assetId}
          onChange={(e) => setAssetId(e.target.value as AssetId)}
          className="desk-input"
        >
          {ASSETS.map((a) => (
            <option key={a.id} value={a.id} className="bg-ink">
              {a.persianName}
            </option>
          ))}
        </select>
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="مقدار"
          className="desk-input"
        />
        <input
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="ورود (خالی = قیمت زنده)"
          className="desk-input"
        />
        <Button variant="primary" onClick={add}>
          ثبت
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">پوزیشنی نیست. روی این دستگاه ذخیره می‌شود.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => {
            const px = live[p.assetId]?.price ?? 0;
            const delta = (px - p.entry) * p.qty;
            const meta = ASSETS.find((a) => a.id === p.assetId);
            return (
              <li key={p.id} className="well flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <p>{meta?.persianName}</p>
                  <p className="num text-muted">
                    {p.qty} × {formatPrice(p.entry)} → {formatPrice(px)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={delta >= 0 ? "num text-up" : "num text-down"}>{formatSigned(delta)}</span>
                  <Button variant="danger" onClick={() => remove(p.id)}>
                    حذف
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </FrameCard>
  );
}
