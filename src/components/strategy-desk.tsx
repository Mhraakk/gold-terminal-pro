import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FrameCard } from "@/components/frame";
import { ASSETS } from "@/data/market/assets";
import type { AssetId, MarketQuote } from "@/data/market/types";
import { formatPct, formatPrice } from "@/lib/format";
import { loadRules, saveRules, type StrategyRule } from "@/lib/desk-store";

export function StrategyDesk({ quotes }: { quotes: MarketQuote[] }) {
  const [items, setItems] = useState<StrategyRule[]>([]);
  const [assetId, setAssetId] = useState<AssetId>("GOLD_18K");
  const [field, setField] = useState<StrategyRule["field"]>("changePercent");
  const [op, setOp] = useState<StrategyRule["op"]>("above");
  const [value, setValue] = useState("1");
  const [note, setNote] = useState("ورود آزمایشی");
  const live = useMemo(() => Object.fromEntries(quotes.map((q) => [q.id, q])), [quotes]);

  useEffect(() => {
    setItems(loadRules());
  }, []);

  function add() {
    const v = Number(value);
    if (!Number.isFinite(v)) return;
    const next = [...items, { id: crypto.randomUUID(), assetId, field, op, value: v, note }];
    setItems(next);
    saveRules(next);
  }

  function remove(id: string) {
    const next = items.filter((r) => r.id !== id);
    setItems(next);
    saveRules(next);
  }

  return (
    <FrameCard className="p-4">
      <p className="label-tech">RULE ENGINE</p>
      <h3 className="mt-1 mb-4 text-lg font-light">سازندهٔ استراتژی</h3>
      <p className="mb-4 text-xs text-muted">قواعد روی چاپ زنده ارزیابی می‌شوند و روی همین دستگاه می‌مانند.</p>
      <div className="mb-4 grid gap-2 sm:grid-cols-5">
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
        <select
          value={field}
          onChange={(e) => setField(e.target.value as StrategyRule["field"])}
          className="desk-input"
        >
          <option value="changePercent" className="bg-ink">
            تغییر ٪
          </option>
          <option value="price" className="bg-ink">
            قیمت
          </option>
        </select>
        <select
          value={op}
          onChange={(e) => setOp(e.target.value as StrategyRule["op"])}
          className="desk-input"
        >
          <option value="above" className="bg-ink">
            بالای
          </option>
          <option value="below" className="bg-ink">
            زیر
          </option>
        </select>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="desk-input"
        />
        <Button variant="primary" onClick={add}>
          افزودن
        </Button>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="یادداشت قانون"
        className="desk-input mb-4"
      />
      {items.length === 0 ? (
        <p className="text-sm text-muted">قانونی نیست.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => {
            const q = live[r.assetId];
            const px = r.field === "price" ? (q?.price ?? 0) : (q?.changePercent ?? 0);
            const hit = q && q.price > 0 && (r.op === "above" ? px >= r.value : px <= r.value);
            const meta = ASSETS.find((a) => a.id === r.assetId);
            return (
              <li key={r.id} className="well flex items-center justify-between gap-3 p-3 text-sm">
                <div>
                  <p>
                    {meta?.persianName} {r.field === "price" ? "قیمت" : "تغییر"} {r.op === "above" ? "≥" : "≤"}{" "}
                    {r.field === "price" ? formatPrice(r.value) : formatPct(r.value)}
                  </p>
                  <p className="text-xs text-muted">{r.note}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={hit ? "text-gold" : "text-muted"}>{hit ? "فعال" : "خاموش"}</span>
                  <Button variant="danger" onClick={() => remove(r.id)}>
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
