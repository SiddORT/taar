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
import clientLinks from "../clientLinks";
import { portalStates, throttle } from "../../lib/clientAccounts";
import { requireAuth } from "../../middlewares/requireAuth";
import { signToken } from "../../lib/auth";
import { digest, temporaryPassword } from "../../lib/clientAccountSecurity";

const ORIGIN = "https://portal.example.invalid";
const PASSWORD = "Strong-client-password-2026";
const app = express();
app.use(express.json());
app.use("/api", clientAuth, clientAccess, clientOrders, publicPortal, clientLinks);
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
  const conversations = await readFile(new URL("../../../../../lib/db/migrations/0028_workable_lady_deathstrike.sql", import.meta.url), "utf8");
  await pool.query(conversations);
  await pool.query(`
    CREATE TABLE style_order_products(id integer PRIMARY KEY,style_order_id integer,product_name text,
      product_status text DEFAULT 'Draft',fabric_name text,ref_images jsonb DEFAULT '[]',is_deleted boolean DEFAULT false);
    CREATE TABLE invoices(id integer PRIMARY KEY,invoice_no text,invoice_date text,due_date text,
      client_id integer,invoice_direction text DEFAULT 'Client',invoice_status text DEFAULT 'Generated',
      swatch_order_id integer,style_order_id integer,reference_type text,reference_id text,
      currency_code text DEFAULT 'INR',exchange_rate_snapshot numeric DEFAULT 1,total_amount numeric DEFAULT 0);
    ALTER TABLE invoices ADD is_deleted boolean DEFAULT false;
    CREATE TABLE invoice_payments(id integer PRIMARY KEY,invoice_id integer,base_currency_amount numeric,
      payment_status text DEFAULT 'Completed',is_deleted boolean DEFAULT false);
    CREATE TABLE credit_debit_notes(id integer PRIMARY KEY,invoice_id integer,base_currency_amount numeric,
      note_type text DEFAULT 'Credit Note',reference_type text DEFAULT 'Client Invoice',status text DEFAULT 'Applied',is_deleted boolean DEFAULT false);
    CREATE TABLE order_shipping_details(id integer PRIMARY KEY,reference_type text,reference_id integer,shipment_status text DEFAULT 'Pending',
      tracking_number text,tracking_url text,shipment_date date,expected_delivery_date date,actual_delivery_date date,is_deleted boolean DEFAULT false);
    CREATE TABLE packing_lists(id integer PRIMARY KEY,client_id integer,shipment_id integer,is_deleted boolean DEFAULT false);
    CREATE TABLE packing_packages(id integer PRIMARY KEY,packing_list_id integer,is_deleted boolean DEFAULT false);
    CREATE TABLE packing_package_items(id integer PRIMARY KEY,package_id integer,order_type text,order_id integer,
      quantity numeric,item_source text DEFAULT 'order',is_deleted boolean DEFAULT false);
  `);
  // The legacy shared-link reader selects every column. Supply its remaining
  // nullable presentation columns without copying any public data or sequences.
  for (const table of ["client_links", "swatch_orders", "style_orders", "artworks", "style_order_artworks", "client_feedback", "client_messages"]) {
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
    users,roles,role_permissions,swatch_orders,style_orders,client_links,artworks,style_order_artworks,client_feedback,client_messages,
    style_order_products,invoices,invoice_payments,credit_debit_notes,order_shipping_details,packing_lists,packing_packages,packing_package_items RESTART IDENTITY CASCADE;
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

describe("organized client order workspace", () => {
  let session: string;
  const message = (link: number, body: any) => request(app).post(`/api/client-auth/orders/${link}/messages`)
    .set("Origin", ORIGIN).set("Cookie", session).send(body);
  const decision = (link: number, body: any) => request(app).post(`/api/client-auth/orders/${link}/feedback`)
    .set("Origin", ORIGIN).set("Cookie", session).send(body);
  beforeEach(async () => {
    await seedOrder();
    await seedOrder("style");
    await pool.query(`INSERT INTO client_links(id,swatch_order_id,token,is_published) VALUES(1,1,'swatch-link',true);
      INSERT INTO client_links(id,style_order_id,token,is_published) VALUES(2,1,'style-link',true);
      INSERT INTO style_order_products(id,style_order_id,product_name) VALUES(1,1,'Jacket'),(2,1,'Trousers');
      INSERT INTO artworks(id,swatch_order_id,artwork_code,artwork_name) VALUES(1,1,'AW-1','Swatch embroidery');
      INSERT INTO style_order_artworks(id,style_order_id,style_order_product_id,artwork_code,artwork_name,feedback_status)
        VALUES(1,1,1,'SA-1','Style embroidery','Pending');`);
    await setup();
    session = cookie(await login());
  });
  it("deduplicates shared orders and invoices, separates uninvoiced orders, and reads canonical mixed-currency balances", async () => {
    await pool.query(`INSERT INTO client_links(id,swatch_order_id,token,is_published) VALUES(3,1,'duplicate-link',true);
      INSERT INTO invoices(id,invoice_no,invoice_date,client_id,swatch_order_id,reference_type,reference_id,currency_code,exchange_rate_snapshot,total_amount)
      VALUES(1,'USD-1','2026-10-01',1,1,'Swatch','ORDER-1','USD',80,100),
      (2,'INR-2','2026-10-01',1,NULL,'Swatch','1','INR',1,200),
      (3,'INR-3','2026-10-01',1,NULL,'Swatch','ORDER-1','INR',1,50);
      INSERT INTO invoice_payments(id,invoice_id,base_currency_amount,payment_status,is_deleted)
        VALUES(1,1,2400,'Completed',false),(2,1,800,'Pending',false),(3,1,1600,'Completed',true),
          (4,2,200,'Completed',false);
      INSERT INTO credit_debit_notes(id,invoice_id,base_currency_amount) VALUES(1,1,800);
      UPDATE swatch_orders SET order_status='Completed';
      INSERT INTO order_shipping_details(id,reference_type,reference_id,shipment_status) VALUES(1,'Swatch',1,'Pending');`);
    const dash = await get("/client-auth/dashboard", session);
    expect(dash.status).toBe(200);
    expect(dash.body).toMatchObject({ ordersPlaced: 2, delivered: 0, inProgress: 1,
      invoicesPaid: 1, invoicesPending: 2, uninvoicedOrders: 1, currency: "INR", receivedInr: 3400, outstandingInr: 4850 });
    const list = (await get("/client-auth/orders", session)).body.data;
    expect(list).toHaveLength(2);
    expect(list.find((o: any) => o.orderType === "style")).toMatchObject({ paymentStatus: "Not invoiced",invoiceCount: 0 });
    const d = (await get("/client-auth/orders/1", session)).body.data;
    expect(d.invoices.find((i: any) => i.id === 1)).toMatchObject({ currency: "USD",total: 100,received: 40,outstanding: 60,status: "Partially Paid" });
    expect(d.progress.find((p: any) => p.label === "Production").status).toBe("Completed (not delivery)");
    expect(d.progress.find((p: any) => p.label === "Shipment").status).toBe("Pending");
  });
  it("excludes draft, cancelled, deleted, vendor, foreign and unrelated invoices and unpublished orders", async () => {
    await pool.query(`INSERT INTO invoices(id,invoice_no,invoice_date,client_id,swatch_order_id,invoice_status,invoice_direction,is_deleted)
      VALUES(1,'DRAFT','2026-10-01',1,1,'Draft','Client',false),(2,'CANCEL','2026-10-01',1,1,'Cancelled','Client',false),
      (3,'DEL','2026-10-01',1,1,'Generated','Client',true),(4,'VENDOR','2026-10-01',1,1,'Generated','Vendor',false),
      (5,'FOREIGN','2026-10-01',2,1,'Generated','Client',false),(6,'UNRELATED','2026-10-01',1,99,'Generated','Client',false);
      UPDATE client_links SET is_published=false WHERE id=2;`);
    expect((await get("/client-auth/dashboard", session)).body).toMatchObject({ ordersPlaced: 1,invoicesPaid: 0,invoicesPending: 0,uninvoicedOrders: 1 });
    expect((await get("/client-auth/orders/1", session)).body.data.invoices).toEqual([]);
    expect((await get("/client-auth/orders/2", session)).status).toBe(404);
  });
  it("aggregates actual INR anchors rather than re-converting rounded foreign invoice balances", async () => {
    await pool.query(`INSERT INTO invoices(id,invoice_no,invoice_date,client_id,swatch_order_id,currency_code,exchange_rate_snapshot,total_amount)
      VALUES(1,'ROUNDING','2026-10-01',1,1,'USD',83,10);
      INSERT INTO invoice_payments(id,invoice_id,base_currency_amount) VALUES(1,1,100);`);
    const dashboard = (await get("/client-auth/dashboard",session)).body;
    expect(dashboard).toMatchObject({receivedInr:100,outstandingInr:730});
    const inv = (await get("/client-auth/orders/1",session)).body.data.invoices[0];
    expect(inv).toMatchObject({received:1.2,outstanding:8.8});
  });
  it("distinguishes multiple partial shipments, full delivery, and unknown dates without unsafe tracking URLs", async () => {
    await pool.query(`INSERT INTO order_shipping_details(id,reference_type,reference_id,shipment_status,tracking_url)
      VALUES(1,'Swatch',1,'Delivered','javascript:alert(1)'),(2,'Swatch',1,'In Transit','https://tracking.example.invalid/1');`);
    let d = (await get("/client-auth/orders/1", session)).body.data;
    expect(d.shipments[0].trackingUrl).toBeNull();
    expect(d.order.orderDate).toBeNull();
    expect(d.progress.at(-1)).toMatchObject({ status: "Partially delivered",date: null });
    expect((await get("/client-auth/dashboard", session)).body.delivered).toBe(0);
    await pool.query("UPDATE order_shipping_details SET shipment_status='Delivered' WHERE id=2");
    expect((await get("/client-auth/dashboard", session)).body.delivered).toBe(1);
  });
  it("includes owned packing-list shipments once and does not call a partial quantity fully delivered", async () => {
    await pool.query(`UPDATE swatch_orders SET quantity='10';
      INSERT INTO order_shipping_details(id,reference_type,reference_id,shipment_status) VALUES(1,'PackingList',1,'Delivered');
      INSERT INTO packing_lists(id,client_id,shipment_id) VALUES(1,1,1);
      INSERT INTO packing_packages(id,packing_list_id) VALUES(1,1);
      INSERT INTO packing_package_items(id,package_id,order_type,order_id,quantity) VALUES(1,1,'Swatch',1,2),(2,1,'Swatch',1,3);`);
    let d = (await get("/client-auth/orders/1", session)).body.data;
    expect(d.shipments).toHaveLength(1);
    expect(d.progress.at(-1).status).toBe("Partially delivered");
    await pool.query("UPDATE packing_package_items SET quantity=8 WHERE id=1");
    expect((await get("/client-auth/dashboard", session)).body.delivered).toBe(1);
    await pool.query("UPDATE packing_lists SET client_id=2");
    d = (await get("/client-auth/orders/1", session)).body.data;
    expect(d.shipments).toEqual([]);
  });
  it.each([
    [1,"order",undefined], [1,"artwork",1], [2,"order",undefined], [2,"product",1], [2,"artwork",1],
  ])("shares client/staff history at link %s %s scope", async (link, targetType, targetId) => {
    const body = { targetType,targetId,message: `Client ${targetType}`,sender: "team" };
    const sent = await message(Number(link), body);
    expect(sent.status).toBe(201);
    expect(sent.body.data.sender).toBe("client");
    const reply = await post(`/client-links/${link}/messages`, { ...body,message: `Team ${targetType}`,sender: "client" });
    expect(reply.status).toBe(201);
    expect(reply.body.data.sender).toBe("team");
    const account = (await get(`/client-auth/orders/${link}`, session)).body.data.messages;
    const staffMessages = (await request(app).get(`/api/client-links/${link}/messages`).set("Authorization", `Bearer ${staff}`)).body.data;
    expect(account.map((m: any) => m.id)).toEqual(staffMessages.map((m: any) => m.id));
    expect(account).toHaveLength(2);
    expect(account.every((m: any) => m.targetType === targetType)).toBe(true);
    if (targetType === "artwork") {
      const publicHistory = (await request(app).get(`/api/client-portal/${link === 1 ? "swatch-link" : "style-link"}`)).body.data.messages;
      expect(publicHistory.map((m: any) => m.id)).toEqual(account.map((m: any) => m.id));
    }
  });
  it("preserves legacy artwork messages and supports valid bounded attachments", async () => {
    await pool.query(`INSERT INTO client_messages(client_link_id,artwork_id,artwork_name,sender,message)
      VALUES(1,1,'Swatch embroidery','client','Historical message')`);
    const attachment = { name: "note.txt",type: "text/plain",size: 5,data: "data:text/plain;base64,aGVsbG8=" };
    expect((await message(1,{ targetType: "order",attachment })).status).toBe(201);
    const legacyReply = await post("/client-links/1/messages", { artworkId: 1,artworkName: "Forged name",message: "Legacy reply" });
    expect(legacyReply.status).toBe(201);
    expect(legacyReply.body.data.artworkName).toBe("Swatch embroidery");
    const d = (await get("/client-auth/orders/1", session)).body.data;
    expect(d.messages.filter((m: any) => m.targetType === "artwork")).toHaveLength(2);
    expect(d.messages.find((m: any) => m.targetType === "order").attachment).toEqual(attachment);
    for (const bad of [
      { ...attachment,size: 6 },{ ...attachment,type: "text/html" },
      { ...attachment,data: "https://untrusted.example/file" },{ ...attachment,size: 6*1024*1024 },
      { ...attachment,name: "../file.txt" },{ ...attachment,type: "image/png",data: "data:image/png;base64,aGVsbG8=" },
    ]) expect((await message(1,{ targetType: "order",attachment: bad })).status).toBe(400);
    expect((await message(1,{ targetType: "order",message: "x".repeat(4001) })).status).toBe(400);
  });
  it("validates every target against its order, product deletion, ownership, publication, session and origin", async () => {
    await seedOrder("swatch", 2);
    await pool.query(`INSERT INTO artworks(id,swatch_order_id,artwork_code,artwork_name) VALUES(2,2,'FOREIGN','Other artwork');
      INSERT INTO style_order_products(id,style_order_id,product_name) VALUES(3,99,'Foreign product');
      INSERT INTO client_links(id,swatch_order_id,token,is_published) VALUES(3,2,'other-link',true);`);
    for (const [link, body, code] of [
      [1,{targetType:"artwork",targetId:2,message:"No"},404],
      [1,{targetType:"product",targetId:1,message:"No"},404],
      [2,{targetType:"product",targetId:3,message:"No"},404],
      [3,{targetType:"order",message:"No"},404],
      [1,{targetType:"order",targetId:1,message:"No"},400],
      [1,{targetType:"unknown",message:"No"},400],
    ] as const) expect((await message(link,body)).status).toBe(code);
    expect((await request(app).post("/api/client-auth/orders/1/messages").set("Cookie",session).set("Origin","https://evil.example.invalid").send({targetType:"order",message:"No"})).status).toBe(403);
    expect((await request(app).post("/api/client-auth/orders/1/messages").set("Origin",ORIGIN).send({targetType:"order",message:"No"})).status).toBe(401);
    await pool.query("UPDATE style_order_products SET is_deleted=true WHERE id=1");
    expect((await message(2,{targetType:"product",targetId:1,message:"No"})).status).toBe(404);
    expect((await message(2,{targetType:"artwork",targetId:1,message:"No"})).status).toBe(404);
    expect((await get("/client-auth/orders/2",session)).body.data.artworks).toEqual([]);
    await pool.query("UPDATE client_links SET is_published=false WHERE id=1");
    expect((await message(1,{targetType:"order",message:"No"})).status).toBe(404);
    expect((await decision(1,{artworkId:1,decision:"Approve"})).status).toBe(404);
  });
  it.each([1,2])("keeps artwork IDs disambiguated and all closed discussion routes read-only for link %s", async link => {
    expect((await decision(link,{artworkId:1,decision:"Rework",comment:"Revise the border"})).status).toBe(201);
    expect((await decision(link,{artworkId:1,decision:"Approve"})).status).toBe(201);
    const closed = (await get(`/client-auth/orders/${link}`,session)).body.data.artworks[0];
    expect(closed).toMatchObject({isClosed:true,decision:"Approve"});
    expect(closed.feedback).toHaveLength(2);
    expect(closed.feedback[0]).toMatchObject({decision:"Rework",comment:"Revise the border"});
    expect(closed.feedback[1]).toMatchObject({decision:"Approve"});
    expect(JSON.stringify(closed.feedback)).not.toMatch(/internal.?note|isResolved/i);
    const other = (await get(`/client-auth/orders/${link === 1 ? 2 : 1}`,session)).body.data.artworks[0];
    expect(other).toMatchObject({isClosed:false,decision:null});
    expect((await message(link,{targetType:"artwork",targetId:1,message:"Blocked"})).status).toBe(403);
    expect((await decision(link,{artworkId:1,decision:"Approve"})).status).toBe(403);
    expect((await post(`/client-links/${link}/messages`,{artworkId:1,message:"Blocked"})).status).toBe(403);
    const token = link === 1 ? "swatch-link" : "style-link";
    expect((await request(app).post(`/api/client-portal/${token}/message`).send({artworkId:1,message:"Blocked"})).status).toBe(403);
    expect((await request(app).post(`/api/client-portal/${token}/feedback`).send({artworkId:1,decision:"Rework"})).status).toBe(403);
    expect((await message(link,{targetType:"order",message:"Order still open"})).status).toBe(201);
    const statuses = await pool.query("SELECT feedback_status FROM artworks WHERE id=1 UNION ALL SELECT feedback_status FROM style_order_artworks WHERE id=1");
    expect(statuses.rows[link === 1 ? 0 : 1].feedback_status).toBe("Approved");
    expect(statuses.rows[link === 1 ? 1 : 0].feedback_status).not.toBe("Approved");
  });
  it("does not expose hidden media, deleted children, internal fields, tokens or general document dumps", async () => {
    await pool.query(`UPDATE artworks SET wip_images='[{"name":"hidden","type":"image/png","data":"data:image/png;base64,aGVsbG8=","size":5}]',
      final_images='[{"name":"visible","type":"image/png","data":"data:image/png;base64,aGVsbG8=","size":5}]';
      UPDATE client_links SET hidden_images='[{"artworkId":1,"imageType":"wip","imageIndex":0}]' WHERE id=1;
      UPDATE swatch_orders SET internal_notes='PRIVATE',ref_docs='[{"data":"PRIVATE-DOC"}]';`);
    const d = (await get("/client-auth/orders/1",session)).body.data;
    expect(d.artworks[0].wipImages).toEqual([]);
    expect(d.artworks[0].finalImages).toHaveLength(1);
    expect(JSON.stringify(d)).not.toMatch(/PRIVATE|swatch-link|internal_notes|ref_docs/);
    const pub = await request(app).get("/api/client-portal/swatch-link");
    expect(pub.body.data.artworks[0].wipImages).toEqual([]);
    expect(JSON.stringify(pub.body)).not.toMatch(/PRIVATE|internal_notes|ref_docs/);
    await pool.query("UPDATE artworks SET is_deleted=true WHERE id=1");
    expect((await get("/client-auth/orders/1",session)).body.data.artworks).toEqual([]);
    expect((await request(app).post("/api/client-portal/swatch-link/feedback").send({artworkId:1,decision:"Approve"})).status).toBe(404);
  });
  it("retains public reference eligibility, excludes unpublished/deleted/foreign parents and denies foreign artwork mutations", async () => {
    await seedOrder("swatch",2);
    await pool.query(`UPDATE client_links SET client_id=1 WHERE id IN (1,2);
      INSERT INTO client_links(id,swatch_order_id,client_id,token,is_published) VALUES(3,2,2,'foreign-link',true);
      INSERT INTO artworks(id,swatch_order_id,artwork_code,artwork_name) VALUES(2,2,'FOREIGN','Foreign artwork');`);
    const refs = () => request(app).get("/api/client-portal/swatch-link/reference-orders?type=style");
    expect((await refs()).body.data.map((r: any) => r.id)).toEqual([1]);
    for (const action of ["message","feedback"]) {
      expect((await request(app).post(`/api/client-portal/swatch-link/${action}`).send({artworkId:2,message:"No",decision:"Approve"})).status).toBe(404);
    }
    expect((await request(app).post("/api/client-portal/style-link/feedback").send({artworkId:1,decision:"Approve"})).status).toBe(201);
    expect((await pool.query("SELECT feedback_status FROM artworks WHERE id=1")).rows[0].feedback_status).not.toBe("Approved");
    await pool.query("UPDATE style_orders SET is_deleted=true WHERE id=1");
    expect((await refs()).body.data).toEqual([]);
    expect((await request(app).get("/api/client-portal/style-link")).status).toBe(404);
    await pool.query("UPDATE client_links SET is_deleted=true WHERE id=1");
    expect((await request(app).get("/api/client-portal/swatch-link")).status).toBe(404);
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
      VALUES(1,1,'ART1','Artwork','[{"data":"data:image/png;base64,aGlkZGVu"}]','[{"data":"data:image/png;base64,dmlzaWJsZQ=="}]');`);
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
