import type { HTMLAttributes, ReactNode } from "react";
import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { AtmosphereHost } from "@/components/atmosphere-host";
import { NdItem, NdList } from "@/components/number-details";
import { useMaskedReveal } from "@/components/use-masked-reveal";
import { useSectionReveal } from "@/components/use-section-reveal";

export function BsiShell({ children }: { children: ReactNode }) {
  return <AtmosphereHost>{children}</AtmosphereHost>;
}

export function BsiIndex({ children, className = "", ...rest }: HTMLAttributes<HTMLElement>) {
  return (
    <NdList className={className} variant="leading" aria-label="فهرست" {...rest}>
      {children}
    </NdList>
  );
}

export function BsiIndexGroup({ children }: { children: ReactNode }) {
  return <p className="nss-label">{children}</p>;
}

export function BsiIndexItem({
  children,
  active = false,
  desk,
}: {
  children: ReactNode;
  active?: boolean;
  desk?: string;
}) {
  const className = `sdp-nav-link nd-title${active ? " is-active" : ""}`;
  if (desk) {
    return (
      <NdItem current={active}>
        <Link
          to="/"
          search={{ desk } as { desk: "board" }}
          className={className}
          aria-current={active ? "page" : undefined}
        >
          {children}
        </Link>
      </NdItem>
    );
  }
  return (
    <NdItem current={active}>
      <span className={className} aria-current={active ? "page" : undefined}>
        {children}
      </span>
    </NdItem>
  );
}

export function BsiWell({
  children,
  className = "",
  banner,
  ...rest
}: HTMLAttributes<HTMLElement> & { banner?: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useSectionReveal(ref);
  return (
    <section ref={ref} className={`nss-section ${className}`.trim()} {...rest}>
      {banner}
      <div className="nss-shell" data-nss-reveal>
        <div className="nss-face">{children}</div>
      </div>
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
  if (!text) return <h1 className="nss-display">{children}</h1>;
  return (
    <h1 ref={ref} className="reveal nss-display">
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
