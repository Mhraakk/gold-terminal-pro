import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { NssCard } from "@/components/nss-card";
import { cn } from "@/lib/cn";

export function Brackets() {
  return (
    <>
      <span data-bracket="tl" />
      <span data-bracket="tr" />
      <span data-bracket="bl" />
      <span data-bracket="br" />
    </>
  );
}

export function ContainerLinesMarks() {
  return (
    <>
      <span className="cl-rail" data-side="start" />
      <span className="cl-rail" data-side="end" />
      <span className="cl-sq" data-corner="tl" />
      <span className="cl-sq" data-corner="tr" />
      <span className="cl-sq" data-corner="bl" />
      <span className="cl-sq" data-corner="br" />
    </>
  );
}

export function FrameCard({
  className,
  children,
  tile = false,
}: HTMLAttributes<HTMLDivElement> & { selected?: boolean; tile?: boolean; children?: ReactNode }) {
  return (
    <NssCard className={className} tile={tile}>
      {children}
    </NssCard>
  );
}

export function FrameButton({
  className,
  children,
  onClick,
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button type="button" className={cn("nss-chip nss-link", className)} onClick={onClick}>
      {children}
    </button>
  );
}

export function Shell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("nss-page", className)}>{children}</div>;
}
