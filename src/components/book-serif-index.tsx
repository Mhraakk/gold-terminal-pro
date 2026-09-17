import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { AtmosphereHost } from "@/components/atmosphere-host";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { useMaskedReveal } from "@/components/use-masked-reveal";
import type { AssetId } from "@/data/market/types";

export function BsiShell({ children }: { children: ReactNode }) {
  return (
    <>
      <ProgressiveBlur />
      <AtmosphereHost>{children}</AtmosphereHost>
    </>
  );
}

export function BsiIndex({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <ol className={`nd-list ${className}`.trim()} data-nd="leading" aria-label="فهرست" {...rest}>
      {children}
    </ol>
  );
}

export function BsiIndexGroup({ children }: { children: ReactNode }) {
  return <p className="nss-label">{children}</p>;
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
  const className = `sdp-nav-link${active ? " is-active" : ""}`;
  if (desk) {
    return (
      <li>
        <Link
          to="/"
          search={{ desk, asset }}
          className={className}
          aria-current={active ? "page" : undefined}
        >
          {children}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <span className={className} aria-current={active ? "page" : undefined}>
        {children}
      </span>
    </li>
  );
}

export function BsiWell({
  children,
  className = "",
  banner,
  ...rest
}: HTMLAttributes<HTMLElement> & { banner?: ReactNode }) {
  return (
    <section className={`im-well ${className}`.trim()} {...rest}>
      {banner}
      <div className="im-card">{children}</div>
    </section>
  );
}

export function BsiSpread({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <article className={`bsi-spread ${className}`.trim()} {...rest}>
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
  return <p className="nss-meta">{children}</p>;
}

export function BsiDisplay({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const text = typeof children === "string" ? children : "";
  const words = text.split(/\s+/).filter(Boolean);
  useMaskedReveal(ref, text);
  if (!text) return <h1 className="im-heading">{children}</h1>;
  return (
    <h1 ref={ref} className="reveal im-heading">
      {words.map((w, i) => (
        <span className="reveal-word" key={`${i}-${w}`}>
          <span className="reveal-inner">{w}</span>
        </span>
      ))}
    </h1>
  );
}

export function BsiBody({ drop, children }: { drop?: string; children: ReactNode }) {
  return (
    <p className="nss-body">
      {drop ? <span className="bsi-drop">{drop}</span> : null}
      {children}
    </p>
  );
}
