import { useEffect, useRef, type ReactNode } from "react";

export function NebulaWebgl({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/nebula-webgl").then((mod) => {
      if (cancelled || !rootRef.current) return;
      try {
        destroy = mod.mountNebulaWebglBackground(rootRef.current).destroy;
      } catch {
        rootRef.current?.classList.add("nw-no-webgl");
      }
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="nw-root">
      <canvas className="nw-canvas" aria-hidden="true" />
      <div className="nw-fallback" aria-hidden="true" />
      <div className="nw-grid" aria-hidden="true" />
      <div className="nw-grain" aria-hidden="true" />
      <div className="nw-veil" aria-hidden="true" />
      <div className="nw-content">
        <span className="im-rail" data-side="start" aria-hidden="true" />
        <span className="im-rail" data-side="end" aria-hidden="true" />
        <span className="im-node" data-corner="tl" aria-hidden="true" />
        <span className="im-node" data-corner="tr" aria-hidden="true" />
        <span className="im-node" data-corner="bl" aria-hidden="true" />
        <span className="im-node" data-corner="br" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}
