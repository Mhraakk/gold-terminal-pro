import { useEffect, useRef } from "react";

export function ChromaticBand({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/chromatic-band").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountChromaticBandBackground(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="cb-root fg-canvas">
      <canvas className="cb-canvas" id="bg-canvas" aria-hidden="true" />
      <div className="cb-hatch" aria-hidden="true" />
      <div className="cb-grain" aria-hidden="true" />
      <div className="cb-atmosphere" aria-hidden="true" />
      <div className="cb-veil" aria-hidden="true" />
      <div className="cb-content">{children}</div>
    </div>
  );
}
