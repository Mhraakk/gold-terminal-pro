import { useEffect, useState } from "react";

const R = 18;
const C = 2 * Math.PI * R;

export function ScrollRing() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const scroller = document.getElementById("desk");
    if (!scroller) return;
    const paint = () => {
      const span = scroller.scrollHeight - scroller.clientHeight;
      setP(span <= 0 ? 1 : Math.min(1, Math.max(0, scroller.scrollTop / span)));
    };
    paint();
    scroller.addEventListener("scroll", paint, { passive: true });
    return () => scroller.removeEventListener("scroll", paint);
  }, []);

  return (
    <div className="za-ring" aria-hidden title={`${Math.round(p * 100)}٪`}>
      <svg viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={R} fill="none" stroke="currentColor" strokeWidth="3" opacity="0.25" />
        <circle
          cx="24"
          cy="24"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
          transform="rotate(-90 24 24)"
        />
      </svg>
    </div>
  );
}
