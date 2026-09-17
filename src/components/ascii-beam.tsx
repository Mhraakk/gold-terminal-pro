import { useEffect, useRef } from "react";

export function AsciiBeam({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/ascii-beam").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountAsciiBeam(rootRef.current);
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="ab-root fg-canvas">
      <canvas className="ab-canvas" aria-hidden="true" />
      <div className="ab-veil" aria-hidden="true" />
      <div className="ab-content">{children}</div>
    </div>
  );
}
