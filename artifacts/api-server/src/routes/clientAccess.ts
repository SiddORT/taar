import { Router, type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { pool } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";
import { clientHandler } from "./clientAuth";
import { transaction, lockClient, eligible, revoke, throttle, ClientAccessError } from "../lib/clientAccounts";
import { DAY, accessSchema, temporaryPassword, digest, randomToken, normalizeEmail, applicationOrigin } from "../lib/clientAccountSecurity";
import { sendClientAccessEmail } from "../lib/mailer";

const router = Router();
// Follow Client edit authorization, checking live identities and soft-deleted permissions.
async function editor(req: Request, res: Response, next: NextFunction) {
  const { rows } = await pool.query(`SELECT u.id FROM users u WHERE u.id=$1 AND u.is_active=true AND u.is_deleted=false AND (
    u.role='admin' OR EXISTS(SELECT 1 FROM roles r JOIN role_permissions p ON p.role_id=r.id
    WHERE r.name=u.role AND r.is_deleted=false AND p.is_deleted=false AND p.deleted_at IS NULL AND p.permission='masters:clients:add_edit'))`, [req.user?.userId]);
  if (!rows.length) { res.status(403).json({ error: "Client edit permission required" }); return; }
  res.setHeader("Cache-Control", "no-store");
  next();
}
const clientId = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) throw new ClientAccessError(400, "Invalid client ID");
  return id;
};

router.post("/clients/:id/portal-access/temporary-password", requireAuth, editor, clientHandler(async (req, res) => {
  const id = clientId(req);
  await throttle(`draft:staff:${req.user!.userId}`, 60);
  await transaction(async cx => {
    const client = await lockClient(cx, id);
    if (!client.is_active || !await eligible(cx, id)) throw new ClientAccessError(409, "An active client with a non-deleted Swatch or Style order is required.");
  });
  res.json({ password: temporaryPassword() });
}));

router.post("/clients/:id/portal-access/disable", requireAuth, editor, clientHandler(async (req, res) => {
  const id = clientId(req);
  const actor = req.user!.email;
  await transaction(async cx => {
    await lockClient(cx, id);
    const { rows: [account] } = await cx.query("SELECT id FROM client_accounts WHERE client_id=$1 AND is_deleted=false FOR UPDATE", [id]);
    if (account) {
      await revoke(cx, account.id, actor);
      await cx.query("UPDATE client_accounts SET enabled=false,password_hash=NULL,must_change_password=false,temporary_expires_at=NULL,delivery_status=NULL,updated_at=now(),updated_by=$2 WHERE id=$1", [account.id, actor]);
    }
  });
  res.json({ state: "disabled", deliveryStatus: null, expiresAt: null });
}));

router.post("/clients/:id/portal-access", requireAuth, editor, clientHandler(async (req, res) => {
  const id = clientId(req);
  const parsed = accessSchema.safeParse(req.body);
  if (!parsed.success) throw new ClientAccessError(400, "Choose an invitation or generate new temporary credentials.");
  await throttle(`access:staff:${req.user!.userId}`, 30);
  let origin: string;
  try { origin = applicationOrigin(); } catch { throw new ClientAccessError(503, "Configure CLIENT_PORTAL_ORIGIN before sending client access emails."); }
  const actor = req.user!.email;
  const result = await transaction(async cx => {
    const client = await lockClient(cx, id);
    if (!client.is_active || !await eligible(cx, id)) throw new ClientAccessError(409, "An active client with at least one non-deleted Swatch or Style order is required.");
    const email = normalizeEmail(client.email);
    // Serialize normalized identity activation even when two different clients race.
    await cx.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`client-email:${email}`]);
    const duplicates = await cx.query("SELECT id FROM clients WHERE lower(trim(email))=$1 AND is_deleted=false AND id<>$2", [email, id]);
    const conflicts = await cx.query("SELECT id FROM client_accounts WHERE email=$1 AND client_id<>$2", [email, id]);
    if (duplicates.rows.length || conflicts.rows.length) throw new ClientAccessError(409, "This email is associated with another client. Resolve the identity explicitly before enabling access.");
    await cx.query("INSERT INTO client_accounts(client_id,email,created_by) VALUES($1,$2,$3) ON CONFLICT(client_id) DO NOTHING", [id, email, actor]);
    const { rows: [account] } = await cx.query("SELECT * FROM client_accounts WHERE client_id=$1 AND is_deleted=false FOR UPDATE", [id]);
    if (!account) throw new ClientAccessError(409, "The portal account has been deleted. Contact an administrator.");
    await revoke(cx, account.id, actor);
    const expiresAt = new Date(Date.now() + DAY);
    const token = randomToken();
    const hash = parsed.data.method === "temporary" ? await bcrypt.hash(parsed.data.temporaryPassword, 12) : null;
    await cx.query(`UPDATE client_accounts SET email=$2,enabled=true,password_hash=$3,must_change_password=$4,
      temporary_expires_at=$5,delivery_status='pending',updated_at=now(),updated_by=$6 WHERE id=$1`, [account.id, email, hash, parsed.data.method === "temporary", parsed.data.method === "temporary" ? expiresAt : null, actor]);
    if (parsed.data.method === "invitation") await cx.query("INSERT INTO client_credentials(account_id,token_hash,kind,expires_at,created_by) VALUES($1,$2,'invitation',$3,$4)", [account.id, digest(token), expiresAt, actor]);
    // Keep the row locked through SMTP: disable/resend cannot race a late send result.
    try {
      await sendClientAccessEmail({
        to: email, name: client.brand_name, kind: parsed.data.method, expiresAt,
        url: parsed.data.method === "invitation" ? `${origin}/client/set-password#token=${token}` : `${origin}/client`,
        password: parsed.data.method === "temporary" ? parsed.data.temporaryPassword : undefined,
      });
      await cx.query("UPDATE client_accounts SET delivery_status='sent' WHERE id=$1", [account.id]);
      return { state: "pending", deliveryStatus: "sent", expiresAt };
    } catch {
      // A failed or uncertain delivery never leaves a usable setup credential.
      await revoke(cx, account.id, actor);
      await cx.query("UPDATE client_accounts SET enabled=false,password_hash=NULL,must_change_password=false,temporary_expires_at=NULL,delivery_status='failed' WHERE id=$1", [account.id]);
      return { state: "delivery_failed", deliveryStatus: "failed", expiresAt: null };
    }
  });
  if (result.deliveryStatus === "failed") { res.status(502).json({ ...result, error: "Email delivery failed. Access is not enabled. Retry to issue new credentials." }); return; }
  res.json(result);
}));

export default router;
