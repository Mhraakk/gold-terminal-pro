import { useEffect, useState } from "react";

export function LoopTicker({ items, delay = 1800 }: { items: string[]; delay?: number }) {
  const [i, setI] = useState(0);
  const list = items.filter(Boolean);

  useEffect(() => {
    if (list.length < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % list.length), delay);
    return () => window.clearInterval(id);
  }, [delay, list.length]);

  if (list.length === 0) return null;

  const text = list[i % list.length];

  return (
    <p className="za-loop" aria-live="polite">
      <span key={text + i} className="za-loop-item">{text}</span>
    </p>
  );
}
