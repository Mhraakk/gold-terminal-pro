import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap-boot";

export function PerspectiveGlass({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const plane = root.querySelector(".pgd-plane");
    const stage = root.querySelector(".pgd-perspective");
    if (!(plane instanceof HTMLElement) || !(stage instanceof HTMLElement)) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(plane, { rotateX: 0, rotateY: 0, rotateZ: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        plane,
        { rotateX: 38, rotateY: -12, rotateZ: 18, scale: 0.95 },
        {
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: stage,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="pgd-root">
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
