import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function TextRoll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("za-roll", className)}>
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}
