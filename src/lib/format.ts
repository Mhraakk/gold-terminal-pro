const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
const faDec = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 });

export function formatPrice(value: number, decimals = 0): string {
  if (!Number.isFinite(value) || value <= 0) return "—";
  return decimals > 0 ? faDec.format(value) : fa.format(Math.round(value));
}

export function formatSigned(value: number, decimals = 0): string {
  if (!Number.isFinite(value)) return "—";
  const abs = decimals > 0 ? faDec.format(Math.abs(value)) : fa.format(Math.abs(Math.round(value)));
  if (value > 0) return `+${abs}`;
  if (value < 0) return `−${abs}`;
  return abs;
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const n = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 2 }).format(Math.abs(value));
  if (value > 0) return `+${n}٪`;
  if (value < 0) return `−${n}٪`;
  return `${n}٪`;
}

export function tehranNow(): Date {
  return new Date();
}

export function formatTehranTime(date = new Date()): string {
  return date.toLocaleTimeString("fa-IR", { hour12: false, timeZone: "Asia/Tehran" });
}

export function formatTehranDate(date = new Date()): string {
  return date.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" });
}
