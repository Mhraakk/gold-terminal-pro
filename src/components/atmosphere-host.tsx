import type { ReactNode } from "react";
import { ChromaticBand } from "@/components/chromatic-band";
import { CornerLasers } from "@/components/corner-lasers";
import { IndustrialMinimalism } from "@/components/industrial-minimalism";
import { PerspectiveGlass } from "@/components/perspective-glass";
import { SageDualPane } from "@/components/sage-dual-pane";
import { SyntheticFlora } from "@/components/synthetic-flora";
import { TechnicalHud } from "@/components/technical-hud";
import { WebglLaser } from "@/components/webgl-laser";
import { DESIGN_DNA } from "@/lib/architecture";

/** One atmosphere per viewport. Reads DESIGN_DNA so a new skill swap is a registry change. */
export function AtmosphereHost({ children }: { children: ReactNode }) {
  switch (DESIGN_DNA.atmosphere) {
    case "industrial-minimalism":
      return <IndustrialMinimalism>{children}</IndustrialMinimalism>;
    case "perspective-glass-dashboard":
      return <PerspectiveGlass>{children}</PerspectiveGlass>;
    case "radial-blade-sculpture":
      return (
        <div className="sdp-root">
          <div className="sdp-split">{children}</div>
        </div>
      );
    case "sage-dual-pane":
      return <SageDualPane>{children}</SageDualPane>;
    case "synthetic-flora-background":
      return <SyntheticFlora>{children}</SyntheticFlora>;
    case "technical-hud":
      return <TechnicalHud>{children}</TechnicalHud>;
    case "webgl-laser-background":
      return <WebglLaser>{children}</WebglLaser>;
    case "corner-lasers":
      return <CornerLasers accent={DESIGN_DNA.accent}>{children}</CornerLasers>;
    case "chromatic-band-background":
      return <ChromaticBand>{children}</ChromaticBand>;
    default:
      return <>{children}</>;
  }
}
