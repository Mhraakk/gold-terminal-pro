import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SolarCpu({ className = "" }: { className?: string }) {
  return (
    <svg
      className={cn("nss-icon", className)}
      viewBox="0 0 24 24"
      width={14}
      height={14}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="8" height="8" rx="1" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2M7 7l1.2 1.2M15.8 15.8 17 17M17 7l-1.2 1.2M7 17l1.2-1.2" />
    </svg>
  );
}

export function NssCard({
  className,
  children,
  tile = false,
  stamp,
  ...rest
}: HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  tile?: boolean;
  stamp?: ReactNode;
}) {
  const span = typeof className === "string" && className.includes("tm-span");
  return (
    <div className={cn("nss-shell nd-host", span && "tm-span")} data-nss-reveal>
      <div className={cn("nss-face nd-host", tile && "nss-face--tile")}>
        {stamp}
        <div className={className} {...rest}>
          {children}
        </div>
      </div>
    </div>
  );
}
