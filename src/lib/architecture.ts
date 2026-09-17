/** Declared architecture + Design DNA. UI and gateway read from here. */

export const ARCHITECTURE = {
  frontend: "TanStack Start RTL",
  gateway: "validate · rate-limit · log",
  orchestrator: "plan → tools → evaluate → reflexion",
  rag: "disabled adapter",
  models: "xAI grok-4.5",
  guardrails: "injection · PII · schema",
  memory: "short-term localStorage",
  data: "in-memory cache + TGJU / Gold API",
  llmops: "Dockerfile + eval fixtures",
  cloud: "Vercel",
} as const;

/** One atmosphere owner. Last applied atmosphere skill wins. */
export const DESIGN_SKILLS = [
  { skill: "nebula-webgl-background", role: "atmosphere" as const },
  { skill: "newsreader-slate-shell", role: "frame" as const },
  { skill: "masked-reveal", role: "motion" as const },
  { skill: "number-details", role: "details" as const },
  { skill: "point-cloud-globe", role: "illustration" as const },
  { skill: "progressive-blur", role: "surfaces" as const },
  { skill: "aura-assets", role: "media" as const },
  { skill: "terminal-modernism", role: "illustration" as const },
] as const;

export const DESIGN_DNA = {
  frame: "newsreader-slate-shell (flex, full-bleed, open, 2px radius)",
  field: "#030305",
  accent: "#3B82F6",
  type: "Newsreader 48 + system-sans",
  atmosphere: "nebula-webgl-background" as
    | "nebula-webgl-background"
    | "industrial-minimalism"
    | "perspective-glass-dashboard"
    | "radial-blade-sculpture"
    | "sage-dual-pane"
    | "synthetic-flora-background"
    | "technical-hud"
    | "webgl-laser-background"
    | "corner-lasers"
    | "chromatic-band-background"
    | "off",
  motion: "shader liquid warp + masked-reveal",
  surfaces: "elevated #131315 inside 1px white-gradient shell",
} as const;

export const ARCHITECTURE_LINE =
  "Architecture — Frontend TanStack Start RTL, Gateway TanStack server functions, Orchestrator graph (plan → tools → evaluate), RAG disabled adapter, Models xAI grok-4.5, Guardrails on, Memory short-term localStorage, Data in-memory cache + TGJU/Gold API, LLMOps Dockerfile + eval fixtures, Cloud Vercel";

export const DESIGN_LINE =
  "Design system — Frame newsreader-slate-shell (flex, full-bleed, open, 2px radius), Atmosphere nebula-webgl-background (D2), Motion 150ms + masked-reveal, Surfaces elevated #131315 inside 1px white-gradient shell. Type Newsreader 48 + system-sans";
