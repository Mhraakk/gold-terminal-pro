/** Memory layer. Short-term chat window lives in the browser; session is request-scoped. */
export const memory = {
  shortTerm: { enabled: true as const, store: "localStorage" },
  longTerm: { enabled: false as const },
  session: { enabled: true as const, store: "request" },
  artifacts: { enabled: false as const },
};

const KEY = "zarin-terminal-memory-v1";

export type ChatTurn = { role: "user" | "assistant"; text: string; at: number };

export function readChat(): ChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ChatTurn[];
    return Array.isArray(parsed) ? parsed.slice(-24) : [];
  } catch {
    return [];
  }
}

export function writeChat(turns: ChatTurn[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(turns.slice(-24)));
}
