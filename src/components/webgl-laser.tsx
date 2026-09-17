import { useEffect, useRef } from "react";

export function WebglLaser({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/webgl-laser").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountWebglLaser(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="wll-root fg-canvas">
      <canvas className="wll-canvas" aria-hidden="true" />
      <div className="wll-dots" aria-hidden="true" />
      <div className="wll-beam-fallback" aria-hidden="true" />
      <div className="wll-veil" aria-hidden="true" />
      <div className="wll-content">{children}</div>
    </div>
  );
}
