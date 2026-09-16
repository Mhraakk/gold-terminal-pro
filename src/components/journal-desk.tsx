import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FrameCard } from "@/components/frame";
import { ASSETS } from "@/data/market/assets";
import type { AssetId } from "@/data/market/types";
import { formatTehranShort } from "@/lib/format";
import { loadJournal, saveJournal, type JournalEntry } from "@/lib/desk-store";

export function JournalDesk() {
  const [items, setItems] = useState<JournalEntry[]>([]);
  const [assetId, setAssetId] = useState<AssetId>("MELTED_GOLD");
  const [text, setText] = useState("");

  useEffect(() => {
    setItems(loadJournal());
  }, []);

  function add() {
    const body = text.trim();
    if (!body) return;
    const next = [{ id: crypto.randomUUID(), assetId, text: body, at: Date.now() }, ...items].slice(0, 80);
    setItems(next);
    saveJournal(next);
    setText("");
  }

  function remove(id: string) {
    const next = items.filter((e) => e.id !== id);
    setItems(next);
    saveJournal(next);
  }

  return (
    <FrameCard className="p-4">
      <p className="label-tech">JOURNAL</p>
      <h3 className="mt-1 mb-4 text-lg font-light">ژورنال معامله</h3>
      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
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
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="یادداشت ساختار، ورود، خطا"
          className="desk-input"
        />
        <Button variant="primary" onClick={add}>
          ثبت
        </Button>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">ژورنال خالی است. روی این دستگاه ذخیره می‌شود.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((e) => {
            const meta = ASSETS.find((a) => a.id === e.assetId);
            return (
              <li key={e.id} className="well flex items-start justify-between gap-3 p-3 text-sm">
                <div>
                  <p className="label-tech">
                    {meta?.persianName} · {formatTehranShort(new Date(e.at))}
                  </p>
                  <p className="mt-1">{e.text}</p>
                </div>
                <Button variant="danger" onClick={() => remove(e.id)}>
                  حذف
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </FrameCard>
  );
}
