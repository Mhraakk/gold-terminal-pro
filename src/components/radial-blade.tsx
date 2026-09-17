import { useMemo, type CSSProperties } from "react";

const ARC_MIN = -85;
const ARC_MAX = 85;
const COUNT = 40;

function angleFor(i: number, n: number) {
  if (n <= 1) return 0;
  return ARC_MIN + ((ARC_MAX - ARC_MIN) * i) / (n - 1);
}

export function RadialBladeStage({
  heading = "زرین",
  sub = "Radial Sculpture",
}: {
  heading?: string;
  sub?: string;
}) {
  const blades = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        angle: angleFor(i, COUNT),
        delay: Math.abs(i - (COUNT - 1) / 2) * 0.012,
      })),
    [],
  );

  return (
    <section className="sdp-pane sdp-pane--stage rbs-stage" data-rbs-count={COUNT}>
      <div className="rbs-grain" aria-hidden="true" />
      <div className="rbs-pivot" aria-hidden="true">
        {blades.map((b, i) => (
          <div
            key={i}
            className="rbs-blade"
            style={
              {
                "--rbs-angle": `${b.angle}deg`,
                "--rbs-delay": `${b.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="rbs-copy">
        <div className="rbs-mask">
          <h1 className="rbs-heading">{heading}</h1>
        </div>
        <p className="rbs-sub">{sub}</p>
      </div>
    </section>
  );
}
