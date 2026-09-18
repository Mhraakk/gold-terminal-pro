import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full bg-panel px-3 py-2 text-sm text-fg shadow-[0_0_0_1px_rgb(212_175_55/0.22)]",
        "placeholder:text-muted",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_rgb(212_175_55/0.55)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      {...props}
    />
  );
});
