import { useEffect, useRef, type ReactNode } from "react";

export function PerspectiveGlass({ children }: { children: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const plane = planeRef.current;
    if (!plane) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      plane.style.transform = "none";
      return;
    }
    const start = "rotateX(38deg) rotateY(-12deg) rotateZ(18deg) scale(0.95)";
    const end = "rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)";
    const apply = () => {
      const max = Math.max(window.innerHeight * 0.6, 1);
      const t = Math.min(Math.max(window.scrollY / max, 0), 1);
      plane.style.transform = t >= 1 ? end : start;
      if (t > 0 && t < 1) {
        const x = 38 * (1 - t);
        const y = -12 * (1 - t);
        const z = 18 * (1 - t);
        const s = 0.95 + 0.05 * t;
        plane.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg) scale(${s})`;
      }
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => window.removeEventListener("scroll", apply);
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
        <div ref={planeRef} className="pgd-plane">
          {children}
        </div>
      </div>
    </div>
  );
}
