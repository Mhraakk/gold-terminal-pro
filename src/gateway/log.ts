export interface GatewayLog {
  requestId: string;
  route: string;
  ok: boolean;
  latencyMs: number;
  model?: string;
  tokens?: number;
  guardrail?: string;
  detail?: string;
}

export function newRequestId(): string {
  return `gt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function logGateway(entry: GatewayLog): void {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  if (entry.ok) console.info(line);
  else console.warn(line);
}
