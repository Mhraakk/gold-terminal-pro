import { useEffect, useRef, type ReactNode } from "react";

export function SyntheticFlora({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/synthetic-flora").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountSyntheticFloraBackground(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="sf-root fg-canvas">
      <canvas className="sf-canvas" aria-hidden="true" />
      <div className="sf-veil" aria-hidden="true" />
      <div className="sf-content">
        <main className="th-main">{children}</main>
      </div>
    </div>
  );
}
