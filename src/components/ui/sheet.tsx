import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { cn } from "@/lib/cn";

export const Sheet = ({
  shouldScaleBackground = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) => (
  <DrawerPrimitive.Root
    shouldScaleBackground={shouldScaleBackground}
    {...props}
  />
);
Sheet.displayName = "Sheet";

export const SheetTrigger = DrawerPrimitive.Trigger;
export const SheetPortal = DrawerPrimitive.Portal;
export const SheetClose = DrawerPrimitive.Close;

export const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Overlay>
>(function SheetOverlay({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Overlay
      ref={ref}
      className={cn("fixed inset-0 z-50 bg-ink/80", className)}
      {...props}
    />
  );
});

type SheetSide = "top" | "bottom" | "start" | "end";

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content> & {
    side?: SheetSide;
  }
>(function SheetContent({ className, children, side = "end", ...props }, ref) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed z-50 flex h-auto flex-col bg-panel text-fg shadow-[0_0_0_1px_rgb(212_175_55/0.35)]",
          side === "bottom" && "inset-x-0 bottom-0 mt-24 max-h-[90vh]",
          side === "top" && "inset-x-0 top-0 mb-24 max-h-[90vh]",
          side === "end" &&
            "inset-y-0 end-0 w-[min(100%,24rem)] border-s border-guide",
          side === "start" &&
            "inset-y-0 start-0 w-[min(100%,24rem)] border-e border-guide",
          className,
        )}
        {...props}
      >
        {side === "bottom" || side === "top" ? (
          <div className="mx-auto mt-4 h-1.5 w-12 shrink-0 rounded-full bg-guide" />
        ) : null}
        {children}
      </DrawerPrimitive.Content>
    </SheetPortal>
  );
});

export function SheetHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid gap-1.5 p-4 text-start", className)}
      {...props}
    />
  );
}

export function SheetFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

export const SheetTitle = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold text-fg", className)}
      {...props}
    />
  );
});

export const SheetDescription = React.forwardRef<
  React.ElementRef<typeof DrawerPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <DrawerPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted", className)}
      {...props}
    />
  );
});
