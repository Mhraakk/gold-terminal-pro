import { useEffect, useState } from "react";

export function ScatterTitle({ text }: { text: string }) {
  const chars = Array.from(text);
  const center = (chars.length - 1) / 2;
  const [p, setP] = useState(0);

  useEffect(() => {
    const scroller = document.getElementById("desk");
    if (!scroller) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setP(1);
      return;
    }
    const paint = () => {
      setP(Math.min(1, scroller.scrollTop / 160));
    };
    paint();
    scroller.addEventListener("scroll", paint, { passive: true });
    return () => scroller.removeEventListener("scroll", paint);
  }, []);

  return (
    <h3 className="za-scatter nss-display">
      {chars.map((ch, i) => {
        const d = i - center;
        const t = 1 - p;
        return (
          <span
            key={`${ch}-${i}`}
            className={ch === " " ? "is-space" : undefined}
            style={{
              transform: `translate(${d * 22 * t}px, ${Math.abs(d) * 10 * t}px) rotate(${d * 7 * t}deg)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </h3>
  );
}
