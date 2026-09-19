import { useEffect, useRef } from "react";

export function PointCloudGlobe({
  density = 22,
  hint = "DRAG TO ROTATE",
  className = "",
  autoRotate = true,
}: {
  density?: number;
  hint?: string;
  className?: string;
  autoRotate?: boolean;
}) {
  const shellRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/point-cloud-globe").then((mod) => {
      if (cancelled || !canvasRef.current || !shellRef.current) return;
      destroy = mod.mountPointCloudGlobe({
        canvas: canvasRef.current,
        shell: shellRef.current,
        density,
        autoRotate,
      }).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, [density, autoRotate]);

  return (
    <figure ref={shellRef} className={`pcg-shell ${className}`.trim()} aria-label="Point cloud globe">
      <div className="pcg-halo" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className="pcg-canvas"
        role="img"
        aria-label="Orthographic point-cloud earth"
      />
      <div className="pcg-loading">LOADING</div>
      <figcaption className="pcg-hint">{hint}</figcaption>
    </figure>
  );
}
