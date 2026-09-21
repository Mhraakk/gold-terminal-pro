import { useEffect, useRef } from "react";

export function ScrollStroke() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const scroller = document.getElementById("desk");
    const path = pathRef.current;
    if (!scroller || !path) return;
    const paint = () => {
      const span = scroller.scrollHeight - scroller.clientHeight;
      const p = span <= 0 ? 1 : Math.min(1, Math.max(0, scroller.scrollTop / span));
      path.style.strokeDashoffset = String(1 - p);
    };
    paint();
    scroller.addEventListener("scroll", paint, { passive: true });
    return () => scroller.removeEventListener("scroll", paint);
  }, []);

  return (
    <svg className="za-stroke" viewBox="0 0 40 640" aria-hidden focusable="false">
      <path
        ref={pathRef}
        pathLength={1}
        d="M22 8C28 70 8 120 18 180C28 240 32 280 14 340C-2 400 30 450 24 520C20 570 16 610 20 632"
      />
    </svg>
  );
}
