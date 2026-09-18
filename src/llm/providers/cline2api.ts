/**
 * OpenAI-compatible client for pingmike2/cline2api-workers
 * (Cloudflare Worker / Vercel Edge → Cline free models).
 * Upstream: https://github.com/pingmike2/cline2api-workers
 */

const DEFAULT_MODEL = "cline-free/deepseek-v4.1-flash";

export type LlmResult =
  | { ok: true; text: string; model: string; tokens: number }
  | { ok: false; error: string };

function baseUrl(): string | undefined {
  return process.env.CLINE2API_BASE_URL?.trim()?.replace(/\/$/, "");
}

function apiKey(): string | undefined {
  return process.env.CLINE2API_API_KEY?.trim();
}

function model(): string {
  return process.env.CLINE2API_MODEL?.trim() || DEFAULT_MODEL;
}

export function isCline2ApiConfigured(): boolean {
  return Boolean(baseUrl() && apiKey());
}

export async function completeCline2Api(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<LlmResult> {
  const root = baseUrl();
  const key = apiKey();
  if (!root || !key) {
    return {
      ok: false,
      error: "CLINE2API_BASE_URL / CLINE2API_API_KEY not set",
    };
  }

  const res = await fetch(`${root}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model(),
      temperature: 0.2,
      max_tokens: opts.maxTokens ?? 900,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    return {
      ok: false,
      error: `cline2api HTTP ${res.status}: ${body.slice(0, 240)}`,
    };
  }

  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
    model?: string;
  };

  return {
    ok: true,
    text: body.choices?.[0]?.message?.content ?? "",
    model: body.model ?? model(),
    tokens: body.usage?.total_tokens ?? 0,
  };
}
