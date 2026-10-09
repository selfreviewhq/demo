import { createHash, timingSafeEqual } from "node:crypto";
import type { MiddlewareHandler } from "hono";

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Rejects requests without the right `x-api-key`. Constant-time, so timing can't leak the key. */
export function requireApiKey(expected: string): MiddlewareHandler {
  return async (c, next) => {
    const given = c.req.header("x-api-key") ?? "";
    if (!expected || !timingSafeEqual(digest(given), digest(expected))) {
      return c.json({ error: "unauthorized" }, 401);
    }
    await next();
  };
}
