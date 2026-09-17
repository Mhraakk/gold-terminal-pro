import { useEffect, useRef, type ReactNode } from "react";

export function SageDualPane({ children }: { children: ReactNode }) {
  return (
    <div className="sdp-root">
      <div className="sdp-haze" aria-hidden="true" />
      <div className="sdp-split">{children}</div>
    </div>
  );
}

export function SageStage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const paneRef = useRef<HTMLElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pane = paneRef.current;
    const target = targetRef.current;
    if (!pane || !target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const maxPx = 12;
    const maxDeg = 1.2;
    const lerp = 0.1;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let rx = 0;
    let ry = 0;
    let cx = 0;
    let cy = 0;
    let crx = 0;
    let cry = 0;

    const loop = () => {
      cx += (tx - cx) * lerp;
      cy += (ty - cy) * lerp;
      crx += (rx - crx) * lerp;
      cry += (ry - cry) * lerp;
      target.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) rotateX(${crx.toFixed(3)}deg) rotateY(${cry.toFixed(3)}deg)`;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = pane.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      tx = nx * maxPx * 2;
      ty = ny * maxPx * 2;
      ry = nx * maxDeg;
      rx = -ny * maxDeg;
    };
    const onLeave = () => {
      tx = ty = rx = ry = 0;
    };
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(loop);
    };

    pane.addEventListener("pointermove", onMove);
    pane.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      pane.removeEventListener("pointermove", onMove);
      pane.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      target.style.transform = "";
    };
  }, [src]);

  return (
    <section ref={paneRef} className="sdp-pane sdp-pane--stage" data-sdp-stage>
      <div ref={targetRef} className="sdp-parallax">
        {src ? (
          <img src={src} alt={alt} width={1600} height={900} />
        ) : (
          <div className="sdp-stage-void" />
        )}
      </div>
    </section>
  );
}
