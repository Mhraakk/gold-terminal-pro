import { useEffect, useRef, type ReactNode } from "react";

/** Atmosphere only. The desk itself stays flat so the studio is usable on a phone. */
export function PerspectiveGlass({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/pgd-terrain").then((mod) => {
      if (cancelled || !canvasRef.current) return;
      destroy = mod.mountTerrain(canvasRef.current);
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div className="pgd-root">
      <div className="pgd-rays" aria-hidden="true">
        <span className="pgd-ray pgd-ray-a" />
        <span className="pgd-ray pgd-ray-b" />
        <span className="pgd-ray pgd-ray-c" />
      </div>
      <canvas ref={canvasRef} className="pgd-canvas" aria-hidden="true" />
      <div className="pgd-veil" aria-hidden="true" />
      <div className="pgd-perspective">
        <div className="pgd-plane">{children}</div>
      </div>
    </div>
  );
}
