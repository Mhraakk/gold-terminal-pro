import type { HTMLAttributes, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { AtmosphereHost } from "@/components/atmosphere-host";
import type { AssetId } from "@/data/market/types";

type Accent = "gold" | "oxblood" | "bronze";

const ACCENT: Record<Accent, string> = {
  gold: "#b08948",
  oxblood: "#6e1f24",
  bronze: "#8a5a2a",
};

function ShellMarks() {
  return (
    <>
      <span className="cl-rail" data-side="start" aria-hidden="true" />
      <span className="cl-rail" data-side="end" aria-hidden="true" />
      <span className="cl-sq" data-corner="tl" aria-hidden="true" />
      <span className="cl-sq" data-corner="tr" aria-hidden="true" />
      <span className="cl-sq" data-corner="bl" aria-hidden="true" />
      <span className="cl-sq" data-corner="br" aria-hidden="true" />
      <span data-bracket="tl" />
      <span data-bracket="tr" />
      <span data-bracket="bl" />
      <span data-bracket="br" />
    </>
  );
}

export function BsiShell({
  children,
  accent = "gold",
  antiquity = 0.55,
  realism = 0.8,
  overlay = 1,
  density = 0.55,
  drift = false,
  className = "",
  style,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  accent?: Accent;
  antiquity?: number;
  realism?: number;
  overlay?: number;
  density?: number;
  drift?: boolean;
}) {
  return (
    <AtmosphereHost>
      <div
        className={`bsi-shell frame-shell frame-brackets cl-host ${className}`.trim()}
        data-drift={drift ? "on" : undefined}
        style={{
          ["--bsi-accent" as string]: ACCENT[accent],
          ["--bsi-antiquity" as string]: String(antiquity),
          ["--bsi-realism" as string]: String(realism),
          ["--bsi-overlay" as string]: String(overlay),
          ["--bsi-density" as string]: String(density),
          ...style,
        }}
        {...rest}
      >
        <ShellMarks />
        {children}
      </div>
    </AtmosphereHost>
  );
}

export function BsiIndex({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <aside
      className={`bsi-index frame-card frame-brackets ${className}`.trim()}
      aria-label="فهرست"
      {...rest}
    >
      <span data-bracket="tl" />
      <span data-bracket="tr" />
      <span data-bracket="bl" />
      <span data-bracket="br" />
      <div className="frame-disc" aria-hidden="true">
        <span className="frame-disc-mark">ز</span>
      </div>
      {children}
    </aside>
  );
}

export function BsiIndexGroup({ children }: { children: ReactNode }) {
  return <p className="bsi-index-group">{children}</p>;
}

export function BsiIndexItem({
  children,
  active = false,
  desk,
  asset,
}: {
  children: ReactNode;
  active?: boolean;
  desk?:
    | "markets"
    | "terminal"
    | "quant"
    | "forecast"
    | "hunter"
    | "stats"
    | "book"
    | "alerts"
    | "strategy"
    | "truth";
  asset?: AssetId;
}) {
  const className = `bsi-index-item${active ? " is-active" : ""}`;
  if (desk) {
    return (
      <Link
        to="/"
        search={{ desk, asset }}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        {children}
      </Link>
    );
  }
  return (
    <span className={className} aria-current={active ? "page" : undefined}>
      {children}
    </span>
  );
}

export function BsiWell({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <main className={`bsi-well ${className}`.trim()} {...rest}>
      {children}
    </main>
  );
}

export function BsiSpread({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <article className={`bsi-spread ${className}`.trim()} {...rest}>
      <div className="bsi-fiber" aria-hidden="true" />
      {children}
    </article>
  );
}

export function BsiPage({
  side = "recto",
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement> & { side?: "verso" | "recto" }) {
  return (
    <div className={`bsi-page bsi-page--${side} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function BsiCrease() {
  return <div className="bsi-crease" aria-hidden="true" />;
}

export function BsiFolio({ children }: { children: ReactNode }) {
  return <p className="bsi-folio">{children}</p>;
}

export function BsiDisplay({ children }: { children: ReactNode }) {
  return <h1 className="bsi-display">{children}</h1>;
}

export function BsiBody({ drop, children }: { drop?: string; children: ReactNode }) {
  return (
    <p className="bsi-body">
      {drop ? <span className="bsi-drop">{drop}</span> : null}
      {children}
    </p>
  );
}
