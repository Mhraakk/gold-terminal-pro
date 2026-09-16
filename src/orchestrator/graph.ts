import { rag } from "@/rag";
import { knowledge } from "@/knowledge";
import { QUANT_SYSTEM, completeXai } from "@/llm";
import { guardInbound, parseStructured } from "@/guardrails";
import type { ChatTurn } from "@/memory";
import type { AssetId, MarketQuote, MarketStructure, MazanehDesk, Technicals } from "@/data/market/types";
import { evaluateAnalysis } from "./evaluate";
import { planTools } from "./plan";
import { renderToolContext, runTools } from "./tools";

export type GraphNode = { name: string; ok: boolean; ms: number };

export type OrchestratorResult =
  | {
      ok: true;
      text: string;
      structured: ReturnType<typeof parseStructured>;
      model: string;
      guardrail: "pass";
      tokens: number;
      tools: string[];
      nodes: GraphNode[];
    }
  | { ok: false; error: string; guardrail?: string; nodes: GraphNode[] };

function clock() {
  const t = Date.now();
  return () => Date.now() - t;
}

export async function runQuantGraph(input: {
  question: string;
  quote: MarketQuote;
  tech: Technicals;
  structure?: MarketStructure;
  mazaneh?: MazanehDesk;
  memory?: Pick<ChatTurn, "role" | "text">[];
  assetId: AssetId;
}): Promise<OrchestratorResult> {
  const nodes: GraphNode[] = [];

  const gMs = clock();
  const inbound = guardInbound(input.question);
  nodes.push({ name: "guardrails", ok: inbound.ok, ms: gMs() });
  if (!inbound.ok) {
    return { ok: false, error: "درخواست رد شد (گارد).", guardrail: inbound.reason, nodes };
  }

  const pMs = clock();
  const tools = planTools(inbound.text, input.assetId);
  nodes.push({ name: "plan", ok: true, ms: pMs() });

  const tMs = clock();
  const obs = runTools(tools, {
    quote: input.quote,
    tech: input.tech,
    structure: input.structure,
    mazaneh: input.mazaneh,
    memory: input.memory,
    assetId: input.assetId,
  });
  nodes.push({ name: "tools", ok: true, ms: tMs() });

  const user = [
    renderToolContext(obs),
    `لایه دانش: ${knowledge.enabled ? "on" : "disabled"} | RAG: ${rag.enabled ? "on" : "disabled"}`,
    `سؤال: ${inbound.text || "تحلیل ساختار بازار و سناریوی معامله."}`,
    "خروجی را JSON ساخت‌یافته مطابق اسکیما بده، بعد یک خلاصه فارسی کوتاه.",
  ].join("\n");

  const genMs = clock();
  const first = await completeXai({ system: QUANT_SYSTEM, user, maxTokens: 900 });
  nodes.push({ name: "generate", ok: first.ok, ms: genMs() });
  if (!first.ok) return { ok: false, error: first.error, nodes };

  let text = first.text;
  let model = first.model;
  let tokens = first.tokens ?? 0;
  let structured = parseStructured(text);

  const evMs = clock();
  let verdict = evaluateAnalysis(text, structured, input.quote);
  nodes.push({ name: "evaluate", ok: verdict.schemaOk, ms: evMs() });

  if (!verdict.schemaOk) {
    const rxMs = clock();
    const retry = await completeXai({
      system: QUANT_SYSTEM,
      user: `${user}\n\nخروجی قبلی اسکیما را رد کرد. فقط یک JSON معتبر برگردان.\n${text.slice(0, 1200)}`,
      maxTokens: 700,
    });
    nodes.push({ name: "reflexion", ok: retry.ok, ms: rxMs() });
    if (retry.ok) {
      text = retry.text;
      model = retry.model;
      tokens += retry.tokens ?? 0;
      structured = parseStructured(text);
      verdict = evaluateAnalysis(text, structured, input.quote);
    }
  }

  if (verdict.warnings.length) {
    text += `\n\n${verdict.warnings.map((w) => `توجه دسک: ${w}`).join("\n")}`;
  }

  return {
    ok: true,
    text,
    structured,
    model,
    guardrail: "pass",
    tokens,
    tools,
    nodes,
  };
}
