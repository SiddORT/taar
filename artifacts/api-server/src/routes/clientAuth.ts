import { Router, type Request, type Response, type NextFunction } from "express";
import { pool } from "@workspace/db";
import bcrypt from "bcryptjs";
import {
  DAY, COOKIE, digest, randomToken, normalizeEmail, applicationOrigin, clientOriginGuard,
  loginSchema, recoverySchema, setupSchema, changeSchema, setSession,
} from "../lib/clientAccountSecurity";
import { ClientAccessError, transaction, revoke, requireClient, throttle } from "../lib/clientAccounts";
import { sendClientAccessEmail } from "../lib/mailer";

export const clientAuthRouter = Router();
clientAuthRouter.use("/client-auth", clientOriginGuard);
const wrap = (fn: (req: Request, res: Response) => Promise<void>) => async (req: Request, res: Response, next: NextFunction) => {
  try { await fn(req, res); } catch (e) {
    if (e instanceof ClientAccessError) { res.status(e.status).json({ error: e.message }); return; }
    next(e);
  }
};
export { wrap as clientHandler };
const identity = (client: any, account: any) => ({ client: { name: client.brand_name, email: account.email }, mustChangePassword: !!account.must_change_password });
const INVALID = "Unable to sign in. Check your credentials or contact the team if access is disabled or expired.";
// Precomputed valid bcrypt hash keeps unknown identities on the password verification path.
const DUMMY_HASH = bcrypt.hashSync("not-a-user-password-placeholder", 10);

clientAuthRouter.post("/client-auth/login", wrap(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) throw new ClientAccessError(400, INVALID);
  const email = normalizeEmail(parsed.data.email);
  await throttle(`login:ip:${req.ip}`, 50);
  await throttle(`login:email:${email}`, 10);
  const { rows: [lookup] } = await pool.query("SELECT client_id,password_hash FROM client_accounts WHERE email=$1 AND is_deleted=false", [email]);
  if (!lookup) {
    await bcrypt.compare(parsed.data.password, DUMMY_HASH);
    throw new ClientAccessError(401, INVALID);
  }
  const result = await transaction(async cx => {
    const { rows: [client] } = await cx.query("SELECT * FROM clients WHERE id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
    if (!client) throw new ClientAccessError(401, INVALID);
    const { rows: [account] } = await cx.query("SELECT * FROM client_accounts WHERE client_id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
    const matches = await bcrypt.compare(parsed.data.password, account?.password_hash ?? DUMMY_HASH);
    if (!matches || !account?.enabled || !client.is_active || account.email !== normalizeEmail(client.email) ||
        (account.must_change_password && (!account.temporary_expires_at || new Date(account.temporary_expires_at).getTime() <= Date.now()))) {
      throw new ClientAccessError(401, INVALID);
    }
    const token = randomToken();
    const maxAge = account.must_change_password ? Math.min(DAY, new Date(account.temporary_expires_at).getTime() - Date.now()) : 7 * DAY;
    await cx.query("INSERT INTO client_sessions(account_id,token_hash,restricted,expires_at,created_by) VALUES($1,$2,$3,$4,$5)", [account.id, digest(token), account.must_change_password, new Date(Date.now() + maxAge), email]);
    return { token, maxAge, response: identity(client, account) };
  });
  setSession(res, result.token, result.maxAge);
  res.json(result.response);
}));

clientAuthRouter.get("/client-auth/me", wrap(async (req, res) => {
  const result = await transaction(async cx => {
    const { client, account } = await requireClient(cx, req, true);
    return identity(client, account);
  });
  res.json(result);
}));

clientAuthRouter.post("/client-auth/logout", wrap(async (req, res) => {
  // Idempotent logout, including expired/disabled sessions.
  const { readSession } = await import("../lib/clientAccountSecurity");
  const token = readSession(req);
  if (token) await pool.query("UPDATE client_sessions SET revoked_at=now(),updated_at=now(),updated_by='client' WHERE token_hash=$1 AND is_deleted=false", [digest(token)]);
  res.clearCookie(COOKIE, { path: "/api/client-auth", httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" || process.env.CLIENT_PORTAL_ORIGIN?.startsWith("https:") });
  res.json({ message: "Signed out" });
}));

clientAuthRouter.post("/client-auth/set-password", wrap(async (req, res) => {
  await throttle(`setup:ip:${req.ip}`, 30);
  const parsed = setupSchema.safeParse(req.body);
  if (!parsed.success) throw new ClientAccessError(400, "Use a valid link and a password of 12–72 bytes.");
  const hash = digest(parsed.data.token);
  const { rows: [lookup] } = await pool.query(`SELECT a.client_id FROM client_credentials t JOIN client_accounts a ON a.id=t.account_id WHERE t.token_hash=$1`, [hash]);
  const invalid = () => new ClientAccessError(400, "This link has expired, has already been used, or access is disabled. Request a new link.");
  if (!lookup) throw invalid();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await transaction(async cx => {
    const { rows: [client] } = await cx.query("SELECT * FROM clients WHERE id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
    if (!client) throw invalid();
    const { rows: [account] } = await cx.query("SELECT * FROM client_accounts WHERE client_id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
    if (!client.is_active || !account?.enabled || account.email !== normalizeEmail(client.email)) throw invalid();
    const { rowCount } = await cx.query(`UPDATE client_credentials SET consumed_at=now(),updated_at=now(),updated_by=$2
      WHERE token_hash=$1 AND account_id=$3 AND kind IN ('invitation','recovery') AND consumed_at IS NULL AND expires_at>now() AND is_deleted=false RETURNING id`, [hash, account.email, account.id]);
    if (!rowCount) throw invalid();
    await revoke(cx, account.id, account.email);
    await cx.query(`UPDATE client_accounts SET password_hash=$2,must_change_password=false,temporary_expires_at=NULL,updated_at=now(),updated_by=$3 WHERE id=$1`, [account.id, passwordHash, account.email]);
  });
  res.json({ message: "Password saved. Sign in to your client portal." });
}));

clientAuthRouter.post("/client-auth/change-password", wrap(async (req, res) => {
  await throttle(`change:ip:${req.ip}`, 30);
  const parsed = changeSchema.safeParse(req.body);
  if (!parsed.success) throw new ClientAccessError(400, "Choose a password of at least 12 characters and at most 72 bytes.");
  const newHash = await bcrypt.hash(parsed.data.password, 12);
  const result = await transaction(async cx => {
    const { account } = await requireClient(cx, req, true);
    if (await bcrypt.compare(parsed.data.password, account.password_hash)) throw new ClientAccessError(400, "Choose a new password, not your temporary or current password.");
    await revoke(cx, account.id, account.email);
    await cx.query("UPDATE client_accounts SET password_hash=$2,must_change_password=false,temporary_expires_at=NULL,updated_at=now(),updated_by=$3 WHERE id=$1", [account.id, newHash, account.email]);
    const token = randomToken();
    await cx.query("INSERT INTO client_sessions(account_id,token_hash,expires_at,created_by) VALUES($1,$2,$3,$4)", [account.id, digest(token), new Date(Date.now() + 7 * DAY), account.email]);
    return token;
  });
  setSession(res, result, 7 * DAY);
  res.json({ message: "Password changed" });
}));

clientAuthRouter.post("/client-auth/forgot-password", wrap(async (req, res) => {
  const parsed = recoverySchema.safeParse(req.body);
  if (!parsed.success) throw new ClientAccessError(400, "Enter a valid email.");
  await throttle(`recovery:ip:${req.ip}`, 20);
  const email = normalizeEmail(parsed.data.email);
  // Per-identity limits return the same response as an unknown address.
  try { await throttle(`recovery:email:${email}`, 3); } catch (e) {
    if (!(e instanceof ClientAccessError)) throw e;
    res.json({ message: "If access is enabled for this email, password reset instructions will be sent." }); return;
  }
  let origin: string;
  try { origin = applicationOrigin(); } catch { throw new ClientAccessError(503, "Client access is not configured. Please contact the team."); }
  const { rows: [lookup] } = await pool.query("SELECT client_id FROM client_accounts WHERE email=$1 AND is_deleted=false", [email]);
  if (lookup) await transaction(async cx => {
    const { rows: [client] } = await cx.query("SELECT * FROM clients WHERE id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
    const { rows: [account] } = await cx.query("SELECT * FROM client_accounts WHERE client_id=$1 AND is_deleted=false FOR UPDATE", [lookup.client_id]);
    if (!client?.is_active || !account?.enabled || normalizeEmail(client.email) !== email) return;
    await cx.query("UPDATE client_credentials SET consumed_at=now(),updated_at=now(),updated_by=$2 WHERE account_id=$1 AND kind='recovery' AND consumed_at IS NULL AND is_deleted=false", [account.id, email]);
    const token = randomToken();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const { rows: [credential] } = await cx.query("INSERT INTO client_credentials(account_id,token_hash,kind,expires_at,created_by) VALUES($1,$2,'recovery',$3,$4) RETURNING id", [account.id, digest(token), expiresAt, email]);
    // Recovery delivery failures stay generic publicly; staff see delivery_failed.
    try {
      await sendClientAccessEmail({ to: email, name: client.brand_name, url: `${origin}/client/set-password#token=${token}`, expiresAt, kind: "recovery" });
      await cx.query("UPDATE client_accounts SET delivery_status='sent',updated_at=now(),updated_by=$2 WHERE id=$1", [account.id, email]);
    } catch {
      await cx.query("UPDATE client_credentials SET consumed_at=now(),updated_at=now(),updated_by=$2 WHERE id=$1", [credential.id, email]);
      await cx.query("UPDATE client_accounts SET delivery_status='failed',updated_at=now(),updated_by=$2 WHERE id=$1", [account.id, email]);
    }
  });
  res.json({ message: "If access is enabled for this email, password reset instructions will be sent." });
}));

export default clientAuthRouter;
