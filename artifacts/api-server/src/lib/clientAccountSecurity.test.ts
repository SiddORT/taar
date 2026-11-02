import express from "express";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applicationOrigin, clientOriginGuard } from "./clientAccountSecurity";

const canonical = "https://portal.example.com";
const preview = "https://preview.example.com";
const app = express();
app.use(clientOriginGuard);
app.all("/probe", (_req, res) => res.json({ ok: true }));

function post(origin?: string, contentType = "application/json") {
  const req = request(app).post("/probe").set("Content-Type", contentType);
  if (origin !== undefined) req.set("Origin", origin);
  return req.send("{}");
}

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("CLIENT_PORTAL_ORIGIN", canonical);
  vi.stubEnv("CLIENT_PORTAL_DEV_ORIGINS", preview);
});
afterEach(() => vi.unstubAllEnvs());

describe("client portal origin guard", () => {
  it("accepts the canonical origin", async () => {
    expect((await post(canonical)).status).toBe(200);
  });

  it("accepts only explicitly configured preview origins in development", async () => {
    expect((await post(preview)).status).toBe(200);
    expect((await post("https://another-preview.example.com")).status).toBe(403);
    expect((await post(`${preview}.evil.example`)).status).toBe(403);
  });

  it("supports a comma-separated preview allowlist without changing email origins", async () => {
    vi.stubEnv("CLIENT_PORTAL_DEV_ORIGINS", ` ${preview}, https://second.example.com/ , `);
    expect((await post("https://second.example.com")).status).toBe(200);
    expect(applicationOrigin()).toBe(canonical);
  });

  it("ignores preview allowances in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await post(preview)).status).toBe(403);
    expect((await post(canonical)).status).toBe(200);
  });

  it("does not enable preview allowances in other environments", async () => {
    vi.stubEnv("NODE_ENV", "test");
    expect((await post(preview)).status).toBe(403);
  });

  it.each([undefined, "null", "https://untrusted.example.com", "http://portal.example.com"])(
    "rejects an absent or untrusted origin: %s",
    async origin => {
      expect((await post(origin)).status).toBe(403);
    },
  );

  it("continues requiring JSON content even for a trusted preview", async () => {
    expect((await post(preview, "text/plain")).status).toBe(403);
  });

  it.each(["https://preview.example.com/path", "https://user:pass@preview.example.com", "not-a-url", "*"])(
    "fails closed for invalid preview configuration: %s",
    async value => {
      vi.stubEnv("CLIENT_PORTAL_DEV_ORIGINS", value);
      expect((await post(canonical)).status).toBe(503);
    },
  );

  it("requires the canonical origin even with a configured preview", async () => {
    vi.stubEnv("CLIENT_PORTAL_ORIGIN", "");
    expect((await post(preview)).status).toBe(503);
  });

  it("keeps safe reads available and uncached", async () => {
    const res = await request(app).get("/probe");
    expect(res.status).toBe(200);
    expect(res.headers["cache-control"]).toBe("no-store");
    expect(res.headers["referrer-policy"]).toBe("no-referrer");
  });
});
