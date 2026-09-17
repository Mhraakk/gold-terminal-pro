import { useEffect, useRef } from "react";
import type { LngLat } from "@/lib/tactical-globe";

export function TacticalGlobe({
  dots,
  density = 1,
  meta = "Global Sync",
  status = "Live",
  className = "",
  autoRotate = true,
}: {
  dots?: LngLat[];
  density?: number;
  meta?: string;
  status?: string;
  className?: string;
  autoRotate?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/tactical-globe").then((mod) => {
      if (cancelled || !canvasRef.current) return;
      destroy = mod.mountTacticalGlobe({
        canvas: canvasRef.current,
        dots,
        density,
        autoRotate,
      }).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [dots, density, autoRotate]);

  return (
    <figure className={`tg-shell ${className}`.trim()} aria-label={meta}>
      <span className="tg-bracket" data-corner="tl" />
      <span className="tg-bracket" data-corner="tr" />
      <span className="tg-bracket" data-corner="bl" />
      <span className="tg-bracket" data-corner="br" />
      <figcaption className="tg-meta">{meta}</figcaption>
      {status ? <div className="tg-status">{status}</div> : null}
      <canvas
        ref={canvasRef}
        className="tg-canvas"
        role="img"
        aria-label="Orthographic world outline"
      />
    </figure>
  );
}
