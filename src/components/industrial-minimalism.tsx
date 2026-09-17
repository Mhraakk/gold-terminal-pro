import { useEffect, useRef, type ReactNode } from "react";

export function IndustrialMinimalism({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/industrial-minimalism").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountIndustrialMinimalism(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="im-stage" data-shell="page">
      <canvas className="im-canvas" id="gl" aria-hidden="true" />
      <span className="im-rail" data-side="start" aria-hidden="true" />
      <span className="im-rail" data-side="end" aria-hidden="true" />
      <span className="im-node" data-corner="tl" aria-hidden="true" />
      <span className="im-node" data-corner="tr" aria-hidden="true" />
      <span className="im-node" data-corner="bl" aria-hidden="true" />
      <span className="im-node" data-corner="br" aria-hidden="true" />
      <div className="im-glass" aria-hidden="true" />
      <div className="im-content">{children}</div>
    </div>
  );
}
