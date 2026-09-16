const PII = [
  /\b\d{16}\b/,
  /\b09\d{9}\b/,
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
];

export function redactPii(text: string): string {
  let out = text;
  for (const p of PII) out = out.replace(p, "[redacted]");
  return out;
}
