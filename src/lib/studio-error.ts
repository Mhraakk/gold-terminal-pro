/** Map server/auth failures to stable Persian UI copy. */
export function studioClientError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  if (err.message === "Unauthorized") return "ورود لازم است.";
  if (
    err.message.includes("VITE_AUTH_ENABLED=false") &&
    err.message.includes("DATABASE_URL")
  ) {
    return "ورود خاموش است ولی دیتابیس پروداکشن وصل است — VITE_AUTH_ENABLED را true کنید و ری‌دیپلوی کنید.";
  }
  return fallback;
}
