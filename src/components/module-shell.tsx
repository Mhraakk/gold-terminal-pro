import { useRef, type MouseEventHandler, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useModuleFlashlight } from "@/lib/use-module-flashlight";

type Props = {
  children: ReactNode;
  className?: string;
  flush?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
};

export function ModuleShell({ children, className = "", flush = false, onClick }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useModuleFlashlight(ref);

  return (
    <div
      ref={ref}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.currentTarget.click();
              }
            }
          : undefined
      }
      className={cn("bmg-shell", onClick && "w-full cursor-pointer text-right")}
    >
      <div className="bmg-beam" />
      <div className="bmg-aura" />
      <div className={cn("bmg-face", flush && "bmg-face-flush", className)}>{children}</div>
    </div>
  );
}
