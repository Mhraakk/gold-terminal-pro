import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost" | "danger";

export function Button({
  className,
  variant = "ghost",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm transition-colors duration-200 disabled:opacity-40",
        variant === "primary" && "bg-gold text-ink font-semibold",
        variant === "ghost" && "text-gold shadow-border hover:shadow-border-hover",
        variant === "danger" && "text-down shadow-border",
        className,
      )}
      {...props}
    />
  );
}
