import { useEffect, useState } from "react";
import { FrameCard } from "@/components/frame";
import { ThBtn } from "@/components/technical-hud";
import { Button } from "@/components/ui/button";
import { analyzeFn } from "@/lib/market-fn";
import { formatPrice } from "@/lib/format";
import { readChat, writeChat, type ChatTurn } from "@/memory";
import type { StructuredAnalysis } from "@/guardrails";
import type { AssetId } from "@/data/market/types";
import type { GraphNode } from "@/orchestrator";

export function QuantDesk({ assetId, assetName }: { assetId: AssetId; assetName: string }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<StructuredAnalysis | null>(null);
  const [trace, setTrace] = useState<{ tools: string[]; nodes: GraphNode[]; model: string; tokens: number } | null>(
    null,
  );

  useEffect(() => {
    setTurns(readChat());
  }, []);

  async function run(mode: "structure" | "chat") {
    const question = mode === "chat" ? draft.trim() : `تحلیل ساختار ${assetName} با SMC و سناریوی معامله`;
    if (mode === "chat" && !question) return;
    setBusy(true);
    setError(null);
    const next: ChatTurn[] = [...turns, { role: "user", text: question, at: Date.now() }];
    setTurns(next);
    writeChat(next);
    try {
      const result = await analyzeFn({
        data: {
          assetId,
          question,
          mode,
          memory: next.slice(-6).map((t) => ({ role: t.role, text: t.text.slice(0, 500) })),
        },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.structured) setSetup(result.structured);
      setTrace({
        tools: result.tools,
        nodes: result.nodes,
        model: result.model,
        tokens: result.tokens,
      });
      const reply = result.structured?.detailedAnalysisMarkdown ?? result.text;
      const done = [...next, { role: "assistant" as const, text: reply, at: Date.now() }];
      setTurns(done);
      writeChat(done);
      setDraft("");
    } catch {
      setError("کوانت پاسخ نداد. دوباره بزن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bmg-grid" data-recipe="builder">
      <FrameCard className="flex min-h-96 flex-col p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label-tech">QUANT DESK · GROK-4.5</p>
            <h3 className="mt-1 text-lg font-light">کوانت زرین</h3>
          </div>
          <ThBtn onClick={() => void run("structure")} disabled={busy}>
            {busy ? "در حال استدلال…" : "تحلیل ساختار"}
          </ThBtn>
        </div>
        {trace ? (
          <p className="label-tech mb-3 text-gold">
            {trace.nodes.map((n) => n.name).join(" → ")} · {trace.tools.join(" · ")} · {trace.model}
            {trace.tokens ? ` · ${trace.tokens} tok` : ""}
          </p>
        ) : null}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {turns.length === 0 ? (
            <p className="text-sm text-muted">
              تحلیل فقط با درخواست تو اجرا می‌شود. خروجی فارسی است، عددها از قیمت زنده می‌آیند، نه از تخیل.
            </p>
          ) : (
            turns.map((t) => (
              <article
                key={t.at + t.role}
                className={t.role === "user" ? "text-sm text-gold" : "whitespace-pre-wrap text-sm leading-relaxed text-fg"}
              >
                {t.text}
              </article>
            ))
          )}
        </div>
        {error ? <p className="mt-3 text-sm text-down">{error}</p> : null}
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run("chat");
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`سؤال دربارهٔ ${assetName}`}
            className="desk-input flex-1"
            aria-label="سؤال کوانت"
          />
          <Button type="submit" disabled={busy}>
            بپرس
          </Button>
        </form>
      </FrameCard>
      {setup ? <SetupCard setup={setup} /> : null}
    </div>
  );
}

function SetupCard({ setup }: { setup: StructuredAnalysis }) {
  const t = setup.tradeSetup;
  return (
    <FrameCard className="p-5">
      <p className="label-tech">SETUP · {setup.trend}</p>
      <h3 className="mt-1 text-lg font-light">{setup.marketPhase}</h3>
      <p className="mt-2 text-sm text-muted">اعتماد {Math.round(setup.confidenceScore)} از ۱۰۰</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Cell label="ورود" value={formatPrice(t.entry, 2)} />
        <Cell label="حد ضرر" value={formatPrice(t.stopLoss, 2)} />
        <Cell label="TP1" value={formatPrice(t.takeProfit1, 2)} />
        <Cell label="TP2" value={formatPrice(t.takeProfit2, 2)} />
        <Cell label="R:R" value={String(t.riskRewardRatio)} />
      </dl>
      <div className="mt-4 space-y-2 text-sm leading-relaxed text-muted">
        <p>
          <span className="text-fg">اصلی:</span> {setup.scenarios.primary}
        </p>
        <p>
          <span className="text-fg">جایگزین:</span> {setup.scenarios.alternative}
        </p>
        <p>
          <span className="text-fg">ابطال:</span> {setup.scenarios.invalidation}
        </p>
      </div>
    </FrameCard>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="well p-3">
      <dt className="label-tech">{label}</dt>
      <dd className="num mt-1 text-sm">{value}</dd>
    </div>
  );
}
