import { pool } from "@workspace/db";
import type { Request } from "express";
import { digest, normalizeEmail, readSession } from "./clientAccountSecurity";

export class ClientAccessError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export type Connection = import("@workspace/db").ClientDatabaseConnection;
export async function transaction<T>(fn: (cx: Connection) => Promise<T>): Promise<T> {
  const cx = await pool.connect();
  try {
    await cx.query("BEGIN");
    const result = await fn(cx);
    await cx.query("COMMIT");
    return result;
  } catch (e) { await cx.query("ROLLBACK"); throw e; }
  finally { cx.release(); }
}

export async function revoke(cx: Connection, id: number, actor: string) {
  await cx.query("UPDATE client_sessions SET revoked_at=now(),updated_at=now(),updated_by=$2 WHERE account_id=$1 AND revoked_at IS NULL AND is_deleted=false", [id, actor]);
  await cx.query("UPDATE client_credentials SET consumed_at=now(),updated_at=now(),updated_by=$2 WHERE account_id=$1 AND consumed_at IS NULL AND is_deleted=false", [id, actor]);
}

export async function lockClient(cx: Connection, id: number) {
  const { rows: [client] } = await cx.query("SELECT * FROM clients WHERE id=$1 AND is_deleted=false FOR UPDATE", [id]);
  if (!client) throw new ClientAccessError(404, "Client not found");
  return client;
}

export async function eligible(cx: Connection, id: number) {
  const { rows: [result] } = await cx.query(`SELECT
    EXISTS(SELECT 1 FROM swatch_orders WHERE client_id=$1 AND is_deleted=false)
    OR EXISTS(SELECT 1 FROM style_orders WHERE client_id=$1 AND is_deleted=false) AS eligible`, [String(id)]);
  return result.eligible as boolean;
}

export async function requireClient(cx: Connection, req: Request, allowRestricted = false) {
  const token = readSession(req);
  if (!token) throw new ClientAccessError(401, "Please sign in. Access may have been disabled or expired.");
  const { rows: [lookup] } = await cx.query(`SELECT a.client_id FROM client_sessions s JOIN client_accounts a ON a.id=s.account_id WHERE s.token_hash=$1`, [digest(token)]);
  if (!lookup) throw new ClientAccessError(401, "Please sign in. Access may have been disabled or expired.");
  const { rows: [client] } = await cx.query("SELECT * FROM clients WHERE id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
  if (!client) throw new ClientAccessError(401, "Please sign in. Access may have been disabled or expired.");
  const { rows: [session] } = await cx.query(`SELECT s.id AS session_id,s.restricted,a.* FROM client_sessions s
    JOIN client_accounts a ON a.id=s.account_id WHERE s.token_hash=$1
    AND s.is_deleted=false AND s.revoked_at IS NULL AND s.expires_at>now()
    AND a.is_deleted=false AND a.enabled=true FOR UPDATE OF a,s`, [digest(token)]);
  if (!session || !client.is_active || session.email !== normalizeEmail(client.email) ||
      (session.must_change_password && (!session.temporary_expires_at || new Date(session.temporary_expires_at).getTime() <= Date.now()))) {
    throw new ClientAccessError(401, "Please sign in. Access may have been disabled or expired.");
  }
  if (!allowRestricted && (session.restricted || session.must_change_password)) throw new ClientAccessError(403, "Change your temporary password before viewing orders.");
  return { client, account: session };
}

// Persisted, atomic limits work across server restarts and multiple instances.
export async function throttle(key: string, maximum: number, minutes = 15) {
  const { rows: [row] } = await pool.query(`INSERT INTO client_auth_limits(key,attempts,window_start,created_by)
    VALUES($1,1,now(),'system') ON CONFLICT(key) DO UPDATE SET
    attempts=CASE WHEN client_auth_limits.window_start < now()-($2 * interval '1 minute') THEN 1 ELSE client_auth_limits.attempts+1 END,
    window_start=CASE WHEN client_auth_limits.window_start < now()-($2 * interval '1 minute') THEN now() ELSE client_auth_limits.window_start END,
    updated_at=now(),updated_by='system' RETURNING attempts`, [digest(key), minutes]);
  if (row.attempts > maximum) throw new ClientAccessError(429, "Too many attempts. Please try again later.");
}

// Single batched query for listing, not one query per client.
export async function portalStates(ids: number[]) {
  if (!ids.length) return new Map();
  const { rows } = await pool.query(`SELECT c.id,c.is_active,a.enabled,a.password_hash IS NOT NULL AS has_password,
    a.must_change_password,a.temporary_expires_at,a.delivery_status,
    (SELECT max(expires_at) FROM client_credentials t WHERE t.account_id=a.id AND t.kind='invitation' AND t.consumed_at IS NULL AND t.is_deleted=false) AS invite_expires,
    (EXISTS(SELECT 1 FROM swatch_orders o WHERE o.client_id=c.id::text AND o.is_deleted=false)
    OR EXISTS(SELECT 1 FROM style_orders o WHERE o.client_id=c.id::text AND o.is_deleted=false)) AS eligible
    FROM clients c LEFT JOIN client_accounts a ON a.client_id=c.id AND a.is_deleted=false WHERE c.id=ANY($1::int[]) AND c.is_deleted=false`, [ids]);
  return new Map(rows.map(r => [r.id, {
    enabled: !!r.enabled,
    eligible: r.eligible && r.is_active,
    reason: !r.is_active ? "Activate the client first." : !r.eligible ? "At least one non-deleted Swatch or Style order is required." : null,
    state: r.delivery_status === "failed" ? "delivery_failed" : !r.enabled ? (r.enabled === null ? "not_enabled" : "disabled") : r.has_password && !r.must_change_password ? "enabled" : "pending",
    expiresAt: r.must_change_password ? r.temporary_expires_at : r.invite_expires,
    deliveryStatus: r.delivery_status,
  }]));
}
