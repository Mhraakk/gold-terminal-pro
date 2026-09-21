const ENDPOINT = "https://api.x.ai/v1/chat/completions";
const MODEL = "grok-4.5";
const TIMEOUT_MS = 6000;

export async function completeXai(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<
  | { ok: true; text: string; model: string; tokens: number }
  | { ok: false; error: string }
> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return { ok: false, error: "AI is not available in this environment" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      signal: ctrl.signal,
      body: JSON.stringify({
        model: MODEL,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 900,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
    });

    if (!res.ok) return { ok: false, error: `xAI API error ${res.status}` };

    const body = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
      usage?: { total_tokens?: number };
    };
    return {
      ok: true,
      text: body.choices?.[0]?.message?.content ?? "",
      model: MODEL,
      tokens: body.usage?.total_tokens ?? 0,
    };
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    return { ok: false, error: aborted ? "xAI timeout" : "xAI request failed" };
  } finally {
    clearTimeout(timer);
  }
}
