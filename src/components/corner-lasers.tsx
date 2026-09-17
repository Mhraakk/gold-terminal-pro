import { useEffect, useRef } from "react";

export function CornerLasers({
  accent = "#b08948",
  children,
}: {
  accent?: string;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/corner-lasers").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountCornerLasers(rootRef.current, {
        accent,
        corner: [0.12, 0.18],
        count: 3,
      });
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [accent]);

  return (
    <section ref={rootRef} className="cl-root" style={{ ["--cl-accent" as string]: accent }}>
      <canvas className="cl-canvas" aria-hidden="true" />
      <div className="cl-beam-fallback" aria-hidden="true" />
      <div className="cl-veil" aria-hidden="true" />
      <div className="cl-content">{children}</div>
    </section>
  );
}
