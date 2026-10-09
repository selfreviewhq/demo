import { Hono } from "hono";
import { requireApiKey } from "./auth";
import { LinkStore } from "./links";
import { parseTargetUrl } from "./validate";

export function createApp(store = new LinkStore(), apiKey = process.env.API_KEY ?? "") {
  const app = new Hono();

  app.post("/links", requireApiKey(apiKey), async (c) => {
    const body = await c.req.json().catch(() => null);
    const target = parseTargetUrl(body?.url);
    if (!target) return c.json({ error: "url must be an http(s) URL" }, 400);
    const link = store.create(target);
    return c.json({ slug: link.slug }, 201);
  });

  app.get("/links/:slug/stats", requireApiKey(apiKey), (c) => {
    const link = store.get(c.req.param("slug"));
    if (!link) return c.json({ error: "not found" }, 404);
    return c.json({ slug: link.slug, visits: link.visits, createdAt: link.createdAt });
  });

  app.get("/:slug", (c) => {
    const link = store.visit(c.req.param("slug"));
    if (!link) return c.text("not found", 404);
    return c.redirect(link.target, 302);
  });

  return app;
}

if (import.meta.main) {
  if (!process.env.API_KEY) throw new Error("API_KEY is required");
  Bun.serve({ port: Number(process.env.PORT ?? 3000), fetch: createApp().fetch });
}
