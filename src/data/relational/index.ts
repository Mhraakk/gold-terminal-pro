/**
 * Relational layer slice. Auth is off, so there is no user table.
 * Quotes live in the cache adapter; portfolio/alerts persist in the browser.
 */
export const relational = { enabled: false as const, reason: "auth-off local slice" };
