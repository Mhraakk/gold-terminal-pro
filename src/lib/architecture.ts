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
  { skill: "book-serif-index", role: "frame" as const },
  { skill: "container-lines", role: "frame" as const },
  { skill: "border-gradients", role: "frame" as const },
  { skill: "bounded-module-grid", role: "tiles" as const },
  { skill: "aura-assets", role: "media" as const },
  { skill: "beautiful-shadows", role: "surfaces" as const },
  { skill: "corner-lasers", role: "atmosphere" as const },
] as const;

export const DESIGN_DNA = {
  frame: "book-serif-index + container-lines + border-gradients",
  field: "#050505",
  accent: "#b08948",
  type: "Newsreader + Noto Naskh Arabic + IBM Plex Mono · Geist 300 on modules",
  atmosphere: "corner-lasers" as "corner-lasers" | "chromatic-band-background" | "off",
  motion: "corner emitter pulse + pointer flashlight",
  surfaces: "opaque folio · bounded-module-grid · aura plates · beautiful-shadows on gold controls",
} as const;

export const ARCHITECTURE_LINE =
  "Architecture — Frontend TanStack Start RTL, Gateway TanStack server functions, Orchestrator graph (plan → tools → evaluate), RAG disabled adapter, Models xAI grok-4.5, Guardrails on, Memory short-term localStorage, Data in-memory cache + TGJU/Gold API, LLMOps Dockerfile + eval fixtures, Cloud Vercel";

export const DESIGN_LINE =
  "Design system — Frame book-serif-index + container-lines + border-gradients, Atmosphere corner-lasers, Motion corner emitter pulse + pointer flashlight, Surfaces bounded-module-grid + aura-assets + beautiful-shadows";
