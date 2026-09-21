import { useEffect, useMemo, useState } from "react";
import { useLoop } from "@/hooks/use-loop";

const LINES = [
  "طلا، بدون تکرار",
  "ست کامل، نه جعبه",
  "چهار سطح لوکس",
  "میلان · موناکو · پاریس",
] as const;

export function ZarinLoop() {
  const { key } = useLoop(2400);
  const items = useMemo(() => LINES, []);
  const current = items[key % items.length] ?? items[0];
  const [leaving, setLeaving] = useState<string | null>(null);

  useEffect(() => {
    if (key === 0) return;
    const prev = items[(key - 1) % items.length] ?? null;
    setLeaving(prev);
    const timer = window.setTimeout(() => setLeaving(null), 300);
    return () => window.clearTimeout(timer);
  }, [items, key]);

  return (
    <h1 className="nss-display zarin-loop" aria-live="polite">
      {leaving ? (
        <span className="zarin-loop-item is-exit" aria-hidden="true">
          {leaving}
        </span>
      ) : null}
      <span key={key} className="zarin-loop-item">
        {current}
      </span>
    </h1>
  );
}
