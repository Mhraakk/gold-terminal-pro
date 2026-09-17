import { useEffect, useRef, type ReactNode } from "react";

export function TechnicalHud({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let destroy: (() => void) | undefined;
    let cancelled = false;
    void import("@/lib/atmosphere/technical-hud").then((mod) => {
      if (cancelled || !rootRef.current) return;
      destroy = mod.mountTechnicalHud(rootRef.current).destroy;
    });
    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return (
    <div ref={rootRef} className="th-root fg-canvas">
      <canvas className="th-canvas" aria-hidden="true" />
      <div className="th-noise" aria-hidden="true" />
      <div className="th-hatch" aria-hidden="true" />
      <div className="th-veil" aria-hidden="true" />
      <main className="th-main">{children}</main>
    </div>
  );
}

export function ThBtn({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={`th-btn group ${className}`.trim()} {...props}>
      <span className="th-btn__label">{children}</span>
      <span className="th-btn__icon" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </span>
    </button>
  );
}
