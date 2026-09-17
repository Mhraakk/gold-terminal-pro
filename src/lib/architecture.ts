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
  { skill: "industrial-minimalism", role: "atmosphere" as const },
  { skill: "industrial-minimalism", role: "frame" as const },
  { skill: "masked-reveal", role: "motion" as const },
  { skill: "number-details", role: "details" as const },
  { skill: "point-cloud-globe", role: "illustration" as const },
  { skill: "progressive-blur", role: "surfaces" as const },
  { skill: "aura-assets", role: "media" as const },
  { skill: "terminal-modernism", role: "illustration" as const },
] as const;

export const DESIGN_DNA = {
  frame: "industrial-minimalism rails + 1.5px nodes",
  field: "#050507",
  accent: "#e8e8ea",
  type: "Inter 300 tight tracking · 12px uppercase labels",
  atmosphere: "industrial-minimalism" as
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
  motion: "masked-reveal + plane breath",
  surfaces: "#050507 + 100px shadow + white-alpha glass",
} as const;

export const ARCHITECTURE_LINE =
  "Architecture — Frontend TanStack Start RTL, Gateway TanStack server functions, Orchestrator graph (plan → tools → evaluate), RAG disabled adapter, Models xAI grok-4.5, Guardrails on, Memory short-term localStorage, Data in-memory cache + TGJU/Gold API, LLMOps Dockerfile + eval fixtures, Cloud Vercel";

export const DESIGN_LINE =
  "Design system — Frame industrial-minimalism rails + 1.5px nodes, Atmosphere stacked-plane field (30deg FOV), Motion masked-reveal + plane breath, Surfaces #050507 + 100px shadow + white-alpha glass";
