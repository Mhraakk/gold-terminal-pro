import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ModuleShell } from "@/components/module-shell";
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
}: HTMLAttributes<HTMLDivElement> & { selected?: boolean; children?: ReactNode }) {
  return <ModuleShell className={className}>{children}</ModuleShell>;
}

export function FrameButton({
  className,
  children,
  onClick,
}: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <ModuleShell className={className} onClick={onClick} flush>
      {children}
    </ModuleShell>
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
