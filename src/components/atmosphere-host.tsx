import type { ReactNode } from "react";
import { ChromaticBand } from "@/components/chromatic-band";
import { CornerLasers } from "@/components/corner-lasers";
import { DESIGN_DNA } from "@/lib/architecture";

/** One atmosphere per viewport. Reads DESIGN_DNA so a new skill swap is a registry change. */
export function AtmosphereHost({ children }: { children: ReactNode }) {
  switch (DESIGN_DNA.atmosphere) {
    case "corner-lasers":
      return <CornerLasers accent={DESIGN_DNA.accent}>{children}</CornerLasers>;
    case "chromatic-band-background":
      return <ChromaticBand>{children}</ChromaticBand>;
    default:
      return <>{children}</>;
  }
}
