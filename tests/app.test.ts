import { describe, expect, test } from "bun:test";
import { createApp } from "../src/index";
import { parseTargetUrl } from "../src/validate";

const app = createApp(undefined, "test-key");
const auth = { "x-api-key": "test-key", "content-type": "application/json" };

describe("links", () => {
  test("create, redirect, count visits", async () => {
    const created = await app.request("/links", { method: "POST", headers: auth, body: JSON.stringify({ url: "https://railway.com" }) });
    expect(created.status).toBe(201);
    const { slug } = await created.json();

    const redirect = await app.request(`/${slug}`);
    expect(redirect.status).toBe(302);
    expect(redirect.headers.get("location")).toBe("https://railway.com/");

    const stats = await app.request(`/links/${slug}/stats`, { headers: auth });
    expect((await stats.json()).visits).toBe(1);
  });

  test("rejects a missing or wrong API key", async () => {
    const res = await app.request("/links", { method: "POST", headers: { "x-api-key": "nope" }, body: "{}" });
    expect(res.status).toBe(401);
  });
});

describe("parseTargetUrl", () => {
  test("allows http(s) only", () => {
    expect(parseTargetUrl("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(parseTargetUrl("javascript:alert(1)")).toBeNull();
    expect(parseTargetUrl("not a url")).toBeNull();
  });
});
