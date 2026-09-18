import * as React from "react";
import { cn } from "@/lib/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-24 w-full bg-panel px-3 py-2 text-sm text-fg shadow-[0_0_0_1px_rgb(212_175_55/0.22)]",
        "placeholder:text-muted",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_rgb(212_175_55/0.55)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
});
