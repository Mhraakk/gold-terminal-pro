import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { stillForType } from "@/data/atelier-stills";
import type { Concept } from "@/data/studio/types";

export function HoverExpand({ concepts }: { concepts: Concept[] }) {
  const [on, setOn] = useState(0);

  return (
    <div
      className="za-expand"
      onMouseLeave={() => setOn(0)}
      aria-label="گالری کانسپت"
    >
      {concepts.map((c, i) => {
        const still = stillForType(c.brief.productType);
        const active = on === i;
        return (
          <Link
            key={c.id}
            to="/"
            search={{ desk: "dossier", concept: c.id }}
            className={active ? "is-on" : undefined}
            onMouseEnter={() => setOn(i)}
            onFocus={() => setOn(i)}
          >
            <img src={still.src} alt={still.alt} />
            {active ? <span className="za-expand-meta">{c.title}</span> : null}
          </Link>
        );
      })}
    </div>
  );
}
