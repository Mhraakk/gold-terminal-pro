/** Observability slice. Gateway logs requestId, latency, model, guardrail verdict. */
export const otel = { enabled: false as const, sink: "console-json" };
