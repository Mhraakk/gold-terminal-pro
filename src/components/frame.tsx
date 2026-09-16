import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
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
  selected,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { selected?: boolean; children?: ReactNode }) {
  return (
    <div
      className={cn("frame-card frame-brackets", className)}
      data-state={selected ? "selected" : undefined}
      {...rest}
    >
      <Brackets />
      {children}
    </div>
  );
}

export function FrameButton({
  selected,
  className,
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type={type}
      className={cn("frame-card frame-brackets text-right", className)}
      data-state={selected ? "selected" : undefined}
      {...rest}
    >
      <Brackets />
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
  return (
    <div className={cn("fg-shell cl-host fg-brackets", className)} data-inset="outside">
      <ContainerLinesMarks />
      <Brackets />
      {children}
    </div>
  );
}
