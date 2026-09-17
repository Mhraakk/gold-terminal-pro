import { useEffect, useRef } from "react";
import { pauseAtmosphere, resumeAtmosphere } from "@/lib/atmosphere/lock";

export function TerminalModernism({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    pauseAtmosphere();
    const root = rootRef.current;
    if (!root) {
      resumeAtmosphere();
      return;
    }
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/terminal-modernism").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountTerminalModernism(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
      resumeAtmosphere();
    };
  }, []);

  return (
    <div ref={rootRef} className={`tm-stage ${className}`.trim()} data-tm-root>
      <canvas className="tm-canvas" data-tm-canvas aria-hidden="true" />
      <div className="tm-grid-veil" aria-hidden="true" />
      <span className="tm-label" data-anchor="core">
        CORE
      </span>
      <span className="tm-label" data-anchor="node-03">
        NODE-03
      </span>
      <span className="tm-label" data-anchor="uplink">
        UPLINK
      </span>
      <div className="tm-meta">
        SYS <b>LIVE</b> · ISO · CYAN-00E5FF
      </div>
    </div>
  );
}
