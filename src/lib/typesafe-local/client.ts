import type { SystemOneRequest, SystemOneResponse } from "./types";

export const DEFAULT_TYPESAFE_LOCAL_URL = "http://127.0.0.1:8000";

export class TypesafeLocalError extends Error {
  readonly status?: number;
  readonly body?: string;

  constructor(message: string, opts?: { status?: number; body?: string }) {
    super(message);
    this.name = "TypesafeLocalError";
    this.status = opts?.status;
    this.body = opts?.body;
  }
}

function resolveBaseUrl(baseUrl?: string): string {
  const fromEnv =
    typeof process !== "undefined"
      ? process.env.TYPESAFE_LOCAL_URL?.trim()
      : undefined;
  return (baseUrl || fromEnv || DEFAULT_TYPESAFE_LOCAL_URL).replace(/\/$/, "");
}

/** GET /health - returns null when the local server is down. */
export async function typesafeLocalHealth(
  baseUrl?: string,
): Promise<{ ok: boolean; model?: string } | null> {
  const root = resolveBaseUrl(baseUrl);
  try {
    const res = await fetch(`${root}/health`, {
      signal: AbortSignal.timeout(3_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as { ok: boolean; model?: string };
  } catch {
    return null;
  }
}

/**
 * POST /v1/systemone - typed questions -> calibrated probabilities.
 * Server-side only (local MLX process). Throws TypesafeLocalError if unreachable.
 */
export async function askSystemOne(
  request: SystemOneRequest,
  opts?: { baseUrl?: string; signal?: AbortSignal },
): Promise<SystemOneResponse> {
  const root = resolveBaseUrl(opts?.baseUrl);
  let res: Response;
  try {
    res = await fetch(`${root}/v1/systemone`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
      signal: opts?.signal ?? AbortSignal.timeout(120_000),
    });
  } catch (err) {
    throw new TypesafeLocalError(
      `typesafe-local unreachable at ${root}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  const text = await res.text();
  if (!res.ok) {
    throw new TypesafeLocalError(
      `typesafe-local ${res.status}: ${text.slice(0, 400)}`,
      { status: res.status, body: text },
    );
  }

  try {
    return JSON.parse(text) as SystemOneResponse;
  } catch {
    throw new TypesafeLocalError("typesafe-local returned non-JSON", {
      status: res.status,
      body: text.slice(0, 400),
    });
  }
}

export function isTypesafeLocalConfigured(): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env.TYPESAFE_LOCAL_URL?.trim();
  return Boolean(v);
}
