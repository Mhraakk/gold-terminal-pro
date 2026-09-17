import { FrameCard } from "@/components/frame";
import { ARCHITECTURE, DESIGN_DNA, DESIGN_LINE, DESIGN_SKILLS } from "@/lib/architecture";
import type { MarketSnapshot } from "@/data/market/types";

const LAYERS: { label: string; value: string }[] = [
  { label: "Frontend", value: ARCHITECTURE.frontend },
  { label: "Gateway", value: ARCHITECTURE.gateway },
  { label: "Orchestrator", value: ARCHITECTURE.orchestrator },
  { label: "RAG", value: ARCHITECTURE.rag },
  { label: "Models", value: ARCHITECTURE.models },
  { label: "Guardrails", value: ARCHITECTURE.guardrails },
  { label: "Memory", value: ARCHITECTURE.memory },
  { label: "Data", value: ARCHITECTURE.data },
  { label: "LLMOps", value: ARCHITECTURE.llmops },
  { label: "Cloud", value: ARCHITECTURE.cloud },
];

export function SourcesDesk({ snap }: { snap: MarketSnapshot }) {
  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard className="p-4">
        <p className="label-tech">DATA TRUTH</p>
        <h3 className="mt-1 mb-4 text-lg font-light">صحت داده</h3>
        <ul className="space-y-3">
          {snap.sources.map((s) => (
            <li key={s.name} className="well flex items-center justify-between p-3 text-sm">
              <span>{s.name}</span>
              <span className={s.ok ? "text-up" : "text-down"}>{s.detail}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          رقم ساختگی به‌عنوان قیمت زنده نشان داده نمی‌شود. اگر منبع قطع باشد کارت «قطع» می‌شود. کندل‌های ترمینال
          ساختار کمکی‌اند و برچسب می‌خورند.
        </p>
      </FrameCard>
      <FrameCard className="p-4">
        <p className="label-tech">ARCHITECTURE</p>
        <h3 className="mt-1 mb-4 text-lg font-light">لایه‌های سیستم</h3>
        <ul className="space-y-2">
          {LAYERS.map((row) => (
            <li key={row.label} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="label-tech">{row.label}</span>
              <span className="text-muted">{row.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 label-tech text-gold">DESIGN DNA</p>
        <p className="mt-2 text-sm text-muted">{DESIGN_LINE}</p>
        <ul className="mt-4 space-y-2">
          {DESIGN_SKILLS.map((row) => (
            <li key={row.skill} className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="label-tech">{row.role}</span>
              <span className="text-muted">{row.skill}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          {DESIGN_DNA.frame} · {DESIGN_DNA.atmosphere} · {DESIGN_DNA.surfaces}
        </p>
      </FrameCard>
    </div>
  );
}
