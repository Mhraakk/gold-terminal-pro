const PATTERNS = [
  /ignore (all|any|previous|prior) instructions/i,
  /you are now/i,
  /system prompt/i,
  /reveal (your )?(hidden )?prompt/i,
  /دستورات قبلی را نادیده/i,
];

export function detectInjection(text: string): boolean {
  return PATTERNS.some((p) => p.test(text));
}
