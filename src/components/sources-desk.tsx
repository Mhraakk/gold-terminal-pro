import type { MarketSnapshot } from "@/data/market/types";

export function SourcesDesk({ snap }: { snap: MarketSnapshot }) {
  return (
    <div className="panel l-bracket p-4">
      <p className="label-tech">DATA TRUTH</p>
      <h3 className="mt-1 mb-4 text-lg font-light">صحت داده</h3>
      <ul className="space-y-3">
        {snap.sources.map((s) => (
          <li key={s.name} className="flex items-center justify-between shadow-border p-3 text-sm">
            <span>{s.name}</span>
            <span className={s.ok ? "text-up" : "text-down"}>{s.ok ? s.detail : s.detail}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        رقم ساختگی به‌عنوان قیمت زنده نشان داده نمی‌شود. اگر منبع قطع باشد کارت «قطع» می‌شود. کندل‌های ترمینال
        ساختار کمکی‌اند و برچسب می‌خورند.
      </p>
    </div>
  );
}
