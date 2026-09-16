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
        "inline-flex min-h-11 items-center justify-center gap-2 px-4 text-sm transition-colors duration-200 disabled:opacity-40",
        variant === "primary" && "bg-gold text-ink font-semibold",
        variant === "ghost" && "text-gold shadow-[0_0_0_1px_rgb(212_175_55/0.28)] hover:shadow-[0_0_0_1px_rgb(212_175_55/0.55)]",
        variant === "danger" && "text-down shadow-[0_0_0_1px_rgb(239_68_68/0.35)]",
        className,
      )}
      {...props}
    />
  );
}
