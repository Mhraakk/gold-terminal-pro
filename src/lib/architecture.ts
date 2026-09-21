/** Declared architecture + Design DNA. UI and gateway read from here. */

export const ARCHITECTURE = {
  frontend: "TanStack Start RTL",
  gateway: "validate · rate-limit · log",
  orchestrator: "plan → tools → evaluate → reflexion",
  rag: "disabled adapter",
  models: "xAI grok-4.5",
  guardrails: "injection · PII · schema",
  memory: "org-scoped concepts + job queue",
  data: "Neon/PGLite org isolation",
  llmops: "Dockerfile + eval fixtures",
  cloud: "Vercel",
} as const;

/** One atmosphere owner. Last applied atmosphere skill wins. */
export const DESIGN_SKILLS = [
  { skill: "perspective-glass-dashboard", role: "atmosphere" as const },
  { skill: "newsreader-slate-shell", role: "frame" as const },
  { skill: "masked-reveal", role: "motion" as const },
  { skill: "number-details", role: "details" as const },
  { skill: "point-cloud-globe", role: "illustration" as const },
  { skill: "progressive-blur", role: "surfaces" as const },
  { skill: "aura-assets", role: "media" as const },
  { skill: "terminal-modernism", role: "illustration" as const },
] as const;

export const DESIGN_DNA = {
  frame: "perspective-glass-dashboard + Gradient Shell",
  field: "#09090B",
  accent: "#FF5A1F",
  type: "system-sans 500 tight",
  atmosphere: "perspective-glass-dashboard" as
    | "perspective-glass-dashboard"
    | "nebula-webgl-background"
    | "industrial-minimalism"
    | "radial-blade-sculpture"
    | "sage-dual-pane"
    | "synthetic-flora-background"
    | "technical-hud"
    | "webgl-laser-background"
    | "corner-lasers"
    | "chromatic-band-background"
    | "off",
  motion: "plane scrub + masked-reveal",
  surfaces: "#18181B glass + #FF5A1F signal",
} as const;

export const ARCHITECTURE_LINE =
  "Architecture — Frontend TanStack Start RTL, Gateway TanStack server functions, Orchestrator graph (plan → tools → evaluate), RAG similarity adapter, Models xAI grok-4.5 (swappable), Guardrails on, Memory device-local concepts, Data localStore, LLMOps Dockerfile + eval fixtures, Cloud Vercel";

export const DESIGN_LINE =
  "Design system — Frame perspective-glass-dashboard + Gradient Shell, Atmosphere Three.js wireframe terrain 40% + God Rays, Motion plane scrub + masked-reveal, Surfaces #18181B glass + #FF5A1F signal";
