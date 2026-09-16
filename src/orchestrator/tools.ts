import type { ChatTurn } from "@/memory";import type { AssetId, MarketQuote, MarketStructure, MazanehDesk, Technicals } from "@/data/market/types";
import type { ToolName } from "./plan";

export type ToolObservation = {
  used: ToolName[];
  lines: string[];
};

export function halfKelly(winProb: number, rr: number): number {
  if (rr <= 0) return 0;
  const edge = winProb - (1 - winProb) / rr;
  return Math.max(0, Math.min(0.25, edge / 2));
}

export function runTools(
  tools: ToolName[],
  input: {
    quote: MarketQuote;
    tech: Technicals;
    structure?: MarketStructure;
    mazaneh?: MazanehDesk;
    memory?: Pick<ChatTurn, "role" | "text">[];
    assetId: AssetId;
  },
): ToolObservation {
  const lines: string[] = [];
  const q = input.quote;
  const st = input.structure;

  if (tools.includes("quote")) {
    lines.push(
      `دارایی: ${q.persianName} (${q.symbol})`,
      `قیمت زنده: ${q.price} ${q.unit}`,
      `تغییر: ${q.changePercent}% | high ${q.high} | low ${q.low}`,
      `منبع: ${q.source} | تازگی: ${q.freshness}`,
      `RSI ${input.tech.rsi} | EMA20 ${input.tech.ema20.toFixed(2)} | EMA50 ${input.tech.ema50.toFixed(2)} | ATR ${input.tech.atr.toFixed(2)} | مومنتوم ${input.tech.momentum}`,
    );
  }

  if (tools.includes("structure")) {
    lines.push(
      st
        ? `ساختار: ${st.trend} | BOS ${st.bos} | CHOCH ${st.choch} | FVG باز ${st.fvgs.length} | OB فعال ${st.orderBlocks.filter((o) => o.status === "active").length}`
        : "ساختار: نامشخص",
    );
  }

  if (tools.includes("mazaneh") && input.mazaneh) {
    const m = input.mazaneh;
    lines.push(
      `مظنه: حکم ${m.verdict} | اونس ${m.ounceUsd} | دلار ${m.usdToman} | ۱۸ تئوریک ${m.theoretical18k} | ۱۸ زنده ${m.live18k} | اسپرد ${m.spreadPercent}%`,
      m.note,
    );
  }

  if (tools.includes("kelly")) {
    const win =
      input.tech.momentum === "bullish" || input.tech.momentum === "bearish" ? 0.55 : 0.5;
    const rr = 1.6;
    const frac = halfKelly(win, rr);
    lines.push(
      `Kelly نیمه‌اندازهٔ پیش‌فرض (از مومنتوم/R:R فرضی ${rr}): ${frac.toFixed(3)} از کتاب محلی — جایگزین قیمت زنده نیست.`,
    );
  }

  if (tools.includes("memory") && input.memory?.length) {
    const recent = input.memory.slice(-6).map((t) => `${t.role === "user" ? "کاربر" : "کوانت"}: ${t.text.slice(0, 280)}`);
    lines.push("حافظهٔ کوتاه‌مدت:", ...recent);
  }

  return { used: tools, lines };
}

export function renderToolContext(obs: ToolObservation): string {
  return obs.lines.join("\n");
}
