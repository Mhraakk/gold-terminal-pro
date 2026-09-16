import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeFn } from "@/lib/market-fn";
import { readChat, writeChat, type ChatTurn } from "@/memory";
import type { AssetId } from "@/data/market/types";

export function QuantDesk({ assetId, assetName }: { assetId: AssetId; assetName: string }) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTurns(readChat());
  }, []);

  async function run(mode: "structure" | "chat") {
    const question = mode === "chat" ? draft.trim() : `تحلیل ساختار ${assetName}`;
    if (mode === "chat" && !question) return;
    setBusy(true);
    setError(null);
    const next: ChatTurn[] = [...turns, { role: "user", text: question, at: Date.now() }];
    setTurns(next);
    writeChat(next);
    try {
      const result = await analyzeFn({ data: { assetId, question, mode } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
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
    <div className="panel l-bracket flex min-h-96 flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="label-tech">QUANT DESK</p>
          <h3 className="mt-1 text-lg font-light">کوانت زرین</h3>
        </div>
        <Button variant="primary" onClick={() => void run("structure")} disabled={busy}>
          <Sparkles className="size-4" />
          {busy ? "در حال استدلال…" : "تحلیل ساختار"}
        </Button>
      </div>
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
          className="min-h-11 flex-1 rounded-sm bg-transparent px-3 text-sm text-fg shadow-border placeholder:text-muted"
        />
        <Button type="submit" disabled={busy}>
          بپرس
        </Button>
      </form>
    </div>
  );
}
