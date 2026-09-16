import { useEffect, useRef } from "react";

export function AmberAura({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/amber-aura").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountAmberAuraBackground(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="aa-root">
      <canvas className="aa-canvas" aria-hidden="true" />
      <div className="aa-fallback" aria-hidden="true" />
      <div className="aa-veil" aria-hidden="true" />
      <div className="aa-content">{children}</div>
    </div>
  );
}
