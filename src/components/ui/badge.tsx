import { cn } from "@/lib/cn";

type Variant = "default" | "gold" | "up" | "down" | "muted";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wide",
        variant === "default" &&
          "bg-panel text-fg shadow-[0_0_0_1px_rgb(212_175_55/0.28)]",
        variant === "gold" && "bg-gold-soft text-gold",
        variant === "up" && "bg-up/10 text-up",
        variant === "down" && "bg-down/10 text-down",
        variant === "muted" && "bg-panel text-muted",
        className,
      )}
      {...props}
    />
  );
}
