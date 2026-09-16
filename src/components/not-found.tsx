import { Link } from "@tanstack/react-router";
import { AmberAura } from "@/components/amber-aura";
import { FrameCard, Shell } from "@/components/frame";

export function AppNotFound() {
  return (
    <AmberAura>
      <Shell className="flex min-h-dvh flex-col items-center justify-center py-16">
        <FrameCard className="max-w-md p-8 text-center">
          <p className="label-tech text-gold">404</p>
          <h1 className="mt-2 text-2xl font-light">این میز در ترمینال نیست</h1>
          <p className="mt-3 text-sm text-muted">آدرس اشتباه است یا میز برداشته شده.</p>
          <Link
            to="/"
            search={{ desk: "markets" }}
            className="mt-6 inline-flex min-h-11 items-center justify-center bg-gold px-4 text-sm font-semibold text-ink"
          >
            بازگشت به بازار
          </Link>
        </FrameCard>
      </Shell>
    </AmberAura>
  );
}
