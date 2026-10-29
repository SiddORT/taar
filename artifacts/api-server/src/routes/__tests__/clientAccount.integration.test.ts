/**
 * Real PostgreSQL concurrency/expiry tests, isolated in a disposable schema.
 * No existing client rows or public schema objects are modified. SMTP is mocked.
 */
import { beforeAll, afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";
import { readFile } from "node:fs/promises";

const harness = vi.hoisted(() => ({
  schema: `client_portal_test_${process.pid}_${Math.floor(Math.random() * 1e8)}`,
  send: vi.fn(async (_message: any): Promise<{ accepted: string[]; rejected: string[] }> => ({ accepted: ["client@example.invalid"], rejected: [] })),
}));
vi.mock("nodemailer", () => ({ default: { createTransport: () => ({ sendMail: harness.send }) } }));
vi.mock("@workspace/db", async original => {
  const actual = await original<any>();
  const connect = async () => {
    const cx = await actual.pool.connect();
    await cx.query(`SET search_path TO "${harness.schema}"`);
    return cx;
  };
  const wrapped = {
    connect,
    query: async (...args: any[]) => {
      const cx = await connect();
      try { return await cx.query(...args); } finally { cx.release(); }
    },
  };
  const { drizzle } = await import("drizzle-orm/node-postgres");
  return { ...actual, pool: wrapped, db: drizzle(wrapped as any, { schema: actual }), originalPool: actual.pool };
});
import { pool } from "@workspace/db";
import clientAuth from "../clientAuth";
import clientAccess from "../clientAccess";
import clientOrders from "../clientAccountOrders";
import publicPortal from "../clientPortal";
import { portalStates, throttle } from "../../lib/clientAccounts";
import { requireAuth } from "../../middlewares/requireAuth";
import { signToken } from "../../lib/auth";
import { digest, temporaryPassword } from "../../lib/clientAccountSecurity";

const ORIGIN = "https://portal.example.invalid";
const PASSWORD = "Strong-client-password-2026";
const app = express();
app.use(express.json());
app.use("/api", clientAuth, clientAccess, clientOrders, publicPortal);
app.get("/api/employee-only", requireAuth, (_req, res) => res.json({ ok: true }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => res.status(500).json({ error: err.message }));
let staff: string;
let ordinary: string;
const post = (path: string, body: any = {}, token = staff) => request(app).post(`/api${path}`).set("Origin", ORIGIN).set("Authorization", `Bearer ${token}`).send(body);
const login = (email = "client@example.invalid", password = PASSWORD) => post("/client-auth/login", { email, password }, "");
const cookie = (r: any) => (r.headers["set-cookie"] ?? []).map((c: string) => c.split(";")[0]).join("; ");
const get = (path: string, session: string) => request(app).get(`/api${path}`).set("Cookie", session);
const setupToken = () => new URL(harness.send.mock.calls.at(-1)![0].text.match(/https:\/\/[^\s]+/)[0]).hash.slice("#token=".length);
async function issue(id = 1) { return post(`/clients/${id}/portal-access`, { method: "invitation" }); }
async function setup(id = 1) {
  expect((await issue(id)).status).toBe(200);
  const token = setupToken();
  expect((await post("/client-auth/set-password", { token, password: PASSWORD }, "")).status).toBe(200);
  return token;
}
async function seedOrder(kind = "swatch", clientId = 1, deleted = false) {
  return pool.query(`INSERT INTO ${kind === "swatch" ? "swatch_orders" : "style_orders"}
    (id,client_id,order_code,${kind === "swatch" ? "swatch_name" : "style_name"},is_deleted)
    VALUES($1,$2,$3,'Visible order',$4)`, [clientId, String(clientId), `ORDER-${clientId}`, deleted]);
}

beforeAll(async () => {
  vi.stubEnv("CLIENT_PORTAL_ORIGIN", ORIGIN);
  vi.stubEnv("EMAIL_USER", "sender@example.invalid");
  vi.stubEnv("EMAIL_PASS", "test-placeholder");
  vi.stubEnv("NODE_ENV", "test");
  const actual = await import("@workspace/db") as any;
  await actual.originalPool.query(`CREATE SCHEMA "${harness.schema}"`);
  await pool.query(`
    CREATE TABLE clients(id serial PRIMARY KEY,email text NOT NULL,brand_name text DEFAULT 'Example client',
      is_active boolean NOT NULL DEFAULT true,is_deleted boolean NOT NULL DEFAULT false,updated_by text);
    CREATE TABLE users(id integer PRIMARY KEY,role text,is_active boolean DEFAULT true,is_deleted boolean DEFAULT false);
    CREATE TABLE roles(id integer PRIMARY KEY,name text,is_deleted boolean DEFAULT false);
    CREATE TABLE role_permissions(id serial PRIMARY KEY,role_id integer,permission text,is_deleted boolean DEFAULT false,deleted_at timestamptz);
    CREATE TABLE swatch_orders(id integer PRIMARY KEY,client_id text,order_code text,swatch_name text,
      description text,delivery_date text,order_status text DEFAULT 'Draft',is_deleted boolean DEFAULT false);
    CREATE TABLE style_orders(id integer PRIMARY KEY,client_id text,order_code text,style_name text,
      description text,delivery_date text,order_status text DEFAULT 'Draft',is_deleted boolean DEFAULT false);
    CREATE TABLE client_links(id serial PRIMARY KEY,swatch_order_id integer,style_order_id integer,client_id integer,
      portal_title text,hidden_images jsonb DEFAULT '[]',closed_threads jsonb DEFAULT '[]',
      token text,is_published boolean DEFAULT false,is_deleted boolean DEFAULT false,created_at timestamptz DEFAULT now());
    CREATE TABLE artworks(id integer PRIMARY KEY,swatch_order_id integer,artwork_code text,artwork_name text,feedback_status text,
      wip_images jsonb DEFAULT '[]',final_images jsonb DEFAULT '[]',is_deleted boolean DEFAULT false);
    CREATE TABLE style_order_artworks(id integer PRIMARY KEY,style_order_id integer,artwork_code text,artwork_name text,
      wip_images jsonb DEFAULT '[]',final_images jsonb DEFAULT '[]',is_deleted boolean DEFAULT false);
    CREATE TABLE client_feedback(id serial PRIMARY KEY,client_link_id integer,artwork_id integer,decision text,is_deleted boolean DEFAULT false,created_at timestamptz DEFAULT now());
    CREATE TABLE client_messages(id serial PRIMARY KEY,client_link_id integer,artwork_id integer,sender text,message text,attachment jsonb,is_deleted boolean DEFAULT false,created_at timestamptz DEFAULT now());
  `);
  const migration = await readFile(new URL("../../../../../lib/db/migrations/0026_sudden_texas_twister.sql", import.meta.url), "utf8");
  await pool.query(migration.replaceAll('"public".', `"${harness.schema}".`));
  const normalizedEmailCheck = await readFile(new URL("../../../../../lib/db/migrations/0027_clammy_oracle.sql", import.meta.url), "utf8");
  await pool.query(normalizedEmailCheck);
  // The legacy shared-link reader selects every column. Supply its remaining
  // nullable presentation columns without copying any public data or sequences.
  for (const table of ["client_links", "swatch_orders", "artworks", "client_feedback", "client_messages"]) {
    const { rows: missing } = await pool.query(`SELECT column_name,udt_name FROM information_schema.columns p
      WHERE p.table_schema='public' AND p.table_name=$1 AND NOT EXISTS(
        SELECT 1 FROM information_schema.columns t WHERE t.table_schema=$2 AND t.table_name=p.table_name AND t.column_name=p.column_name)`, [table, harness.schema]);
    for (const col of missing) {
      // Identifiers come from PostgreSQL metadata; reject anything unexpected.
      if (!/^[a-z_][a-z_0-9]*$/.test(col.column_name) || !/^[a-z_][a-z_0-9]*$/.test(col.udt_name)) throw new Error("Unexpected fixture column");
      await pool.query(`ALTER TABLE "${table}" ADD COLUMN "${col.column_name}" "${col.udt_name}"`);
    }
  }
  staff = signToken({ userId: 1, email: "staff@example.invalid", role: "admin" });
  ordinary = signToken({ userId: 2, email: "reader@example.invalid", role: "reader" });
}, 30000);

beforeEach(async () => {
  harness.send.mockClear();
  harness.send.mockResolvedValue({ accepted: ["client@example.invalid"], rejected: [] });
  await pool.query(`TRUNCATE client_sessions,client_credentials,client_accounts,client_auth_limits,clients,
    users,roles,role_permissions,swatch_orders,style_orders,client_links,artworks,style_order_artworks,client_feedback,client_messages RESTART IDENTITY CASCADE;
    INSERT INTO clients(id,email) VALUES(1,'client@example.invalid'),(2,'other@example.invalid');
    INSERT INTO users(id,role) VALUES(1,'admin'),(2,'reader');
    INSERT INTO roles(id,name) VALUES(1,'admin'),(2,'reader');`);
});
afterAll(async () => {
  const actual = await import("@workspace/db") as any;
  await actual.originalPool.query(`DROP SCHEMA IF EXISTS "${harness.schema}" CASCADE`);
  await actual.originalPool.end();
  vi.unstubAllEnvs();
});

describe("client account eligibility and staff management", () => {
  it.each(["swatch", "style"])("requires one non-deleted %s order, regardless of status", async kind => {
    expect((await issue()).status).toBe(409);
    await seedOrder(kind, 1, true);
    expect((await issue()).status).toBe(409);
    await pool.query(`UPDATE ${kind}_orders SET is_deleted=false`);
    expect((await issue()).status).toBe(200);
    expect((await portalStates([1, 2])).get(1)).toMatchObject({ eligible: true, state: "pending" });
    expect((await portalStates([1, 2])).get(2)).toMatchObject({ eligible: false, enabled: false });
  });
  it("denies all staff actions without live client edit permission", async () => {
    await seedOrder();
    for (const suffix of ["", "/disable", "/temporary-password"]) {
      expect((await post(`/clients/1/portal-access${suffix}`, { method: "invitation" }, ordinary)).status).toBe(403);
    }
    await pool.query("INSERT INTO role_permissions(role_id,permission) VALUES(2,'masters:clients:add_edit')");
    expect((await post("/clients/1/portal-access", { method: "invitation" }, ordinary)).status).toBe(200);
    await pool.query("UPDATE role_permissions SET is_deleted=true");
    expect((await post("/clients/1/portal-access/disable", {}, ordinary)).status).toBe(403);
    await pool.query("UPDATE users SET is_active=false WHERE id=1");
    expect((await issue()).status).toBe(403);
  });
  it("rejects ambiguous normalized emails without changing either client identity", async () => {
    await seedOrder();
    await pool.query("UPDATE clients SET email=' CLIENT@example.invalid ' WHERE id=2");
    expect((await issue()).status).toBe(409);
    expect((await pool.query("SELECT * FROM client_accounts")).rows).toHaveLength(0);
    expect(harness.send).not.toHaveBeenCalled();
  });
  it("generates drafts without persisting access or sending mail", async () => {
    await seedOrder();
    const draft = await post("/clients/1/portal-access/temporary-password");
    expect(draft.body.password).toMatch(/^[A-Za-z0-9_-]{24}$/);
    expect((await pool.query("SELECT * FROM client_accounts")).rows).toHaveLength(0);
    expect(harness.send).not.toHaveBeenCalled();
  });
  it("rejects SMTP recipients not accepted by the mail server", async () => {
    await seedOrder();
    harness.send.mockResolvedValueOnce({ accepted: [], rejected: ["client@example.invalid"] });
    expect((await issue()).status).toBe(502);
    expect((await portalStates([1])).get(1).enabled).toBe(false);
  });
  it("reports SMTP failure, invalidates credentials and retries without duplicate accounts", async () => {
    await seedOrder();
    harness.send.mockRejectedValueOnce(new Error("SMTP unavailable"));
    expect((await issue()).status).toBe(502);
    expect((await portalStates([1])).get(1)).toMatchObject({ state: "delivery_failed", enabled: false });
    const failed = (await pool.query("SELECT consumed_at FROM client_credentials")).rows[0];
    expect(failed.consumed_at).not.toBeNull();
    expect((await issue()).status).toBe(200);
    expect((await pool.query("SELECT id FROM client_accounts")).rows).toHaveLength(1);
  });
  it("embeds trusted URL, branding and 24-hour expiry; never uses request Host", async () => {
    await seedOrder();
    expect((await post("/clients/1/portal-access", { method: "invitation" }).set("Host", "attacker.invalid")).status).toBe(200);
    const mail = harness.send.mock.calls[0][0];
    expect(mail.text).toContain(`${ORIGIN}/client/set-password#token=`);
    expect(mail.text).toContain("24 hours");
    expect(mail.html).toContain("TAAR — YOUR DESIGN BUSINESS, CONNECTED");
    expect(mail.html).toContain("cid:taar-brand-logo");
    expect(mail.text).not.toContain("attacker.invalid");
    const token = setupToken();
    expect((await pool.query("SELECT token_hash FROM client_credentials")).rows[0].token_hash).toBe(digest(token));
  });
});

describe("one-time setup, login, restrictions and revocation", () => {
  beforeEach(async () => { await seedOrder(); });
  it("consumes an invitation once, including concurrent redemptions", async () => {
    await issue();
    const token = setupToken();
    const results = await Promise.all([1, 2].map(() => post("/client-auth/set-password", { token, password: PASSWORD }, "")));
    expect(results.map(r => r.status).sort()).toEqual([200, 400]);
    expect((await login()).status).toBe(200);
    expect((await post("/client-auth/set-password", { token, password: PASSWORD }, "")).status).toBe(400);
  });
  it("expires setup links and invalidates them on resend", async () => {
    await issue(); const old = setupToken();
    await issue(); const latest = setupToken();
    expect((await post("/client-auth/set-password", { token: old, password: PASSWORD }, "")).status).toBe(400);
    await pool.query("UPDATE client_credentials SET expires_at=now()-interval '1 second' WHERE consumed_at IS NULL");
    expect((await post("/client-auth/set-password", { token: latest, password: PASSWORD }, "")).status).toBe(400);
  });
  it("restricts temporary login to mandatory change, then revokes the restricted session", async () => {
    const temp = temporaryPassword();
    expect((await post("/clients/1/portal-access", { method: "temporary", temporaryPassword: temp })).status).toBe(200);
    expect(harness.send.mock.calls[0][0].text).toContain(temp);
    const signed = await login(undefined, temp); const session = cookie(signed);
    expect(signed.body.mustChangePassword).toBe(true);
    expect((await get("/client-auth/orders", session)).status).toBe(403);
    expect((await post("/client-auth/change-password", { password: temp }, "").set("Cookie", session)).status).toBe(400);
    const changed = await post("/client-auth/change-password", { password: PASSWORD }, "").set("Cookie", session);
    expect(changed.status).toBe(200);
    expect((await get("/client-auth/me", session)).status).toBe(401);
    expect((await get("/client-auth/orders", cookie(changed))).status).toBe(200);
    expect((await login(undefined, temp)).status).toBe(401);
    expect((await login()).status).toBe(200);
    const account = (await pool.query("SELECT password_hash,must_change_password FROM client_accounts")).rows[0];
    expect(account.password_hash).not.toContain(PASSWORD);
    expect(account.must_change_password).toBe(false);
  });
  it("expires temporary passwords and existing restricted sessions after 24 hours", async () => {
    const temp = temporaryPassword();
    await post("/clients/1/portal-access", { method: "temporary", temporaryPassword: temp });
    const session = cookie(await login(undefined, temp));
    await pool.query("UPDATE client_accounts SET temporary_expires_at=now()-interval '1 second'");
    expect((await login(undefined, temp)).status).toBe(401);
    expect((await get("/client-auth/me", session)).status).toBe(401);
  });
  it("supports refresh and logout, and does not accept employee tokens or expose employee APIs", async () => {
    await setup();
    const signed = await login(); const session = cookie(signed);
    expect(signed.headers["set-cookie"][0]).toContain("HttpOnly");
    expect(signed.headers["set-cookie"][0]).toContain("SameSite=Strict");
    expect((await get("/client-auth/me", session)).body.client.email).toBe("client@example.invalid");
    expect((await get("/client-auth/me", session)).status).toBe(200);
    expect((await request(app).get("/api/client-auth/me").set("Authorization", `Bearer ${staff}`)).status).toBe(401);
    expect((await get("/employee-only", session)).status).toBe(401);
    expect((await request(app).get("/api/employee-only").set("Authorization", `Bearer ${staff}`)).status).toBe(200);
    expect((await post("/client-auth/logout", {}, "").set("Cookie", session)).status).toBe(200);
    expect((await get("/client-auth/me", session)).status).toBe(401);
  });
  it("revokes live sessions and pending setup immediately on disable", async () => {
    await setup(); const session = cookie(await login());
    expect((await post("/clients/1/portal-access/disable")).status).toBe(200);
    expect((await get("/client-auth/me", session)).status).toBe(401);
    expect((await login()).status).toBe(401);
    await issue(); const token = setupToken();
    await post("/clients/1/portal-access/disable");
    expect((await post("/client-auth/set-password", { token, password: PASSWORD }, "")).status).toBe(400);
  });
  it.each(["email='changed@example.invalid'", "is_active=false", "is_deleted=true"])("revokes on client changes: %s", async mutation => {
    await setup(); const session = cookie(await login());
    await pool.query(`UPDATE clients SET ${mutation} WHERE id=1`);
    expect((await get("/client-auth/me", session)).status).toBe(401);
    expect((await login()).status).toBe(401);
    expect((await pool.query("SELECT enabled FROM client_accounts")).rows[0].enabled).toBe(false);
  });
  it("replacements revoke active sessions and old temporary credentials", async () => {
    const old = temporaryPassword();
    await post("/clients/1/portal-access", { method: "temporary", temporaryPassword: old });
    const session = cookie(await login(undefined, old));
    await issue();
    expect((await get("/client-auth/me", session)).status).toBe(401);
    expect((await login(undefined, old)).status).toBe(401);
  });
  it("requires explicit re-invitation after an email change, without restoring old sessions", async () => {
    await setup(); const oldSession = cookie(await login());
    await pool.query("UPDATE clients SET email='new@example.invalid' WHERE id=1");
    expect((await login("new@example.invalid")).status).toBe(401);
    await setup();
    expect((await login("new@example.invalid")).status).toBe(200);
    expect((await get("/client-auth/me", oldSession)).status).toBe(401);
    expect((await login()).status).toBe(401);
  });
  it("rejects foreign origins and throttles login, with atomic persistent counters", async () => {
    await setup();
    expect((await request(app).post("/api/client-auth/login").set("Origin", "https://evil.invalid").send({ email: "client@example.invalid", password: PASSWORD })).status).toBe(403);
    for (let i = 0; i < 10; i++) expect((await login(undefined, "incorrect")).status).toBe(401);
    expect((await login()).status).toBe(429);
    const outcomes = await Promise.allSettled(Array.from({ length: 5 }, () => throttle("concurrent", 2)));
    expect(outcomes.filter(o => o.status === "fulfilled")).toHaveLength(2);
  });
});

describe("recovery and scoped published content", () => {
  beforeEach(async () => { await seedOrder(); await setup(); });
  it("returns generic recovery, issues 15-minute single-use links and revokes sessions on reset", async () => {
    const session = cookie(await login());
    const known = await post("/client-auth/forgot-password", { email: "client@example.invalid" }, "");
    const token = setupToken();
    expect(harness.send.mock.calls.at(-1)![0].text).toContain("15 minutes");
    const unknown = await post("/client-auth/forgot-password", { email: "unknown@example.invalid" }, "");
    expect(known.body).toEqual(unknown.body);
    expect((await post("/client-auth/set-password", { token, password: "Replacement-password-2026" }, "")).status).toBe(200);
    expect((await get("/client-auth/me", session)).status).toBe(401);
    expect((await post("/client-auth/set-password", { token, password: PASSWORD }, "")).status).toBe(400);
  });
  it("expires recovery links, invalidates resends, and reports failures only to staff", async () => {
    await post("/client-auth/forgot-password", { email: "client@example.invalid" }, "");
    const old = setupToken();
    await post("/client-auth/forgot-password", { email: "client@example.invalid" }, "");
    const latest = setupToken();
    expect((await post("/client-auth/set-password", { token: old, password: PASSWORD }, "")).status).toBe(400);
    await pool.query("UPDATE client_credentials SET expires_at=now()-interval '1 second' WHERE kind='recovery'");
    expect((await post("/client-auth/set-password", { token: latest, password: PASSWORD }, "")).status).toBe(400);
    harness.send.mockRejectedValueOnce(new Error("SMTP failure"));
    expect((await post("/client-auth/forgot-password", { email: "client@example.invalid" }, "")).status).toBe(200);
    expect((await portalStates([1])).get(1).deliveryStatus).toBe("failed");
  });
  it("lists only owned published orders and enforces ownership, deletion and image hiding on detail", async () => {
    await seedOrder("style", 2);
    await pool.query(`INSERT INTO client_links(id,swatch_order_id,client_id,token,is_published,hidden_images)
      VALUES(1,1,1,'public-client-link',true,'[{"artworkId":1,"imageType":"wip","imageIndex":0}]');
      INSERT INTO client_links(id,style_order_id,client_id,token,is_published) VALUES(2,2,2,'other-public-link',true);
      INSERT INTO artworks(id,swatch_order_id,artwork_code,artwork_name,wip_images,final_images)
      VALUES(1,1,'ART1','Artwork','[{"data":"hidden-image"}]','[{"data":"visible-image"}]');`);
    const session = cookie(await login());
    expect((await get("/client-auth/orders", session)).body.data.map((o: any) => o.id)).toEqual([1]);
    const detail = await get("/client-auth/orders/1", session);
    expect(detail.status).toBe(200);
    expect(detail.body.data.artworks[0].wipImages).toEqual([]);
    expect(detail.body.data.artworks[0].finalImages).toHaveLength(1);
    expect(detail.body.data.link.token).toBeUndefined();
    expect((await get("/client-auth/orders/2", session)).status).toBe(404);
    await pool.query("UPDATE client_links SET is_published=false WHERE id=1");
    expect((await get("/client-auth/orders/1", session)).status).toBe(404);
    await pool.query("UPDATE client_links SET is_published=true,is_deleted=true WHERE id=1");
    expect((await get("/client-auth/orders", session)).body.data).toEqual([]);
    await pool.query("UPDATE client_links SET is_deleted=false WHERE id=1; UPDATE swatch_orders SET is_deleted=true");
    expect((await get("/client-auth/orders/1", session)).status).toBe(404);
  });
  it("preserves published shared-link reads after disabling account login", async () => {
    await pool.query("INSERT INTO client_links(swatch_order_id,client_id,token,is_published) VALUES(1,1,'public-client-link',true)");
    await post("/clients/1/portal-access/disable");
    expect((await request(app).get("/api/client-portal/public-client-link")).status).toBe(200);
  });
});
