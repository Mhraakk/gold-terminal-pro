import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type Axis = "x" | "y";

export function SeamlessMarquee({
  items,
  pxPerSecond = 36,
  gap = 48,
  axis = "x",
  fade = true,
  reverse = false,
  showPause = true,
  className = "",
}: {
  items: { id: string; node: ReactNode }[];
  pxPerSecond?: number;
  gap?: number;
  axis?: Axis;
  fade?: boolean;
  reverse?: boolean;
  showPause?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [copies, setCopies] = useState(2);
  const [duration, setDuration] = useState(30);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const source = setRef.current;
    if (!root || !source) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const measure = () => {
      if (reduce.matches) {
        setCopies(1);
        return;
      }
      const rootSize = axis === "y" ? root.clientHeight : root.clientWidth;
      const setSize =
        axis === "y" ? source.getBoundingClientRect().height : source.getBoundingClientRect().width;
      if (setSize <= 0) return;
      const next = Math.max(2, Math.ceil((rootSize * 2) / setSize));
      setCopies(next);
      setDuration(Math.max(setSize / pxPerSecond, 8));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(source);
    reduce.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      reduce.removeEventListener("change", measure);
    };
  }, [axis, items, pxPerSecond]);

  const copyIndex = useMemo(() => Array.from({ length: copies }, (_, i) => i), [copies]);

  return (
    <div
      ref={rootRef}
      className={["mq-root", paused ? "is-paused" : "", className].filter(Boolean).join(" ")}
      data-axis={axis === "y" ? "y" : undefined}
      data-fade={fade ? "1" : undefined}
      data-reverse={reverse ? "1" : undefined}
      style={
        {
          "--mq-gap": `${gap}px`,
          "--mq-duration": `${duration}s`,
          "--mq-copies": String(Math.max(copies, 2)),
        } as React.CSSProperties
      }
    >
      {showPause && copies > 1 ? (
        <button
          className="mq-pause"
          type="button"
          aria-pressed={paused}
          onClick={() => setPaused((v) => !v)}
        >
          {paused ? "ادامه" : "توقف"}
        </button>
      ) : null}
      <div className="mq-track">
        {copyIndex.map((copy) => (
          <div
            key={`mq-copy-${copy}`}
            className="mq-set"
            ref={copy === 0 ? setRef : undefined}
            aria-hidden={copy > 0}
            inert={copy > 0 ? true : undefined}
          >
            {items.map((item) => (
              <div className="mq-item" key={`${copy}-${item.id}`}>
                {item.node}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
