export function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[^\d.-]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

export function rialToToman(rial: number): number {
  return rial / 10;
}

export function freshnessFromTs(ts: string | null, fetchedAt: number): "live" | "delayed" | "stale" {
  if (!ts) return "delayed";
  const iso = ts.includes("T") ? ts : ts.replace(" ", "T");
  const tehran = Date.parse(iso + "+03:30");
  const utc = Date.parse(iso + "Z");
  const t = Number.isFinite(tehran) ? tehran : utc;
  if (!Number.isFinite(t)) return "delayed";
  const age = fetchedAt - t;
  if (age < 15 * 60_000) return "live";
  // Tehran bazaar prints often freeze after close; treat same-session as delayed.
  if (age < 18 * 60 * 60_000) return "delayed";
  return "stale";
}
