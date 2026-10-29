import { createHash, randomBytes } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
import {
  ClientAccountLoginBody, ClientAccountForgotPasswordBody, ClientAccountSetPasswordBody,
  ClientAccountChangePasswordBody, ManageClientAccountAccessBody,
} from "@workspace/api-zod";

export const DAY = 24 * 60 * 60 * 1000;
export const COOKIE = "taar_client_session";
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = () => randomBytes(32).toString("base64url");
export const temporaryPassword = () => randomBytes(18).toString("base64url");
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
export const passwordSchema = z.string().min(12).refine(p => Buffer.byteLength(p, "utf8") <= 72, "Password must be at most 72 bytes");
export const loginSchema = ClientAccountLoginBody;
export const recoverySchema = ClientAccountForgotPasswordBody;
export const setupSchema = ClientAccountSetPasswordBody.refine(p => Buffer.byteLength(p.password, "utf8") <= 72, "Password must be at most 72 bytes");
export const changeSchema = ClientAccountChangePasswordBody.refine(p => Buffer.byteLength(p.password, "utf8") <= 72, "Password must be at most 72 bytes");
export const accessSchema = ManageClientAccountAccessBody;

export function applicationOrigin() {
  const raw = process.env.CLIENT_PORTAL_ORIGIN;
  if (!raw) throw new Error("Configure CLIENT_PORTAL_ORIGIN before sending client access emails");
  const url = new URL(raw);
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)))) {
    throw new Error("CLIENT_PORTAL_ORIGIN must be a trusted HTTPS origin");
  }
  return url.origin;
}

// Mutation requests must originate from the configured app. No host-header fallback.
export function clientOriginGuard(req: Request, res: Response, next: NextFunction) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) { next(); return; }
  let origin: string;
  try { origin = applicationOrigin(); } catch {
    res.status(503).json({ error: "Client access is not configured. Please contact the team." }); return;
  }
  if (req.get("origin") !== origin || !req.is("application/json")) {
    res.status(403).json({ error: "Request not allowed" }); return;
  }
  next();
}

export function readSession(req: Request) {
  const value = req.headers.cookie?.split(";").map(v => v.trim()).find(v => v.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
}

export function setSession(res: Response, token: string, maxAge: number) {
  res.cookie(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production" || process.env.CLIENT_PORTAL_ORIGIN?.startsWith("https:"), sameSite: "strict", path: "/api/client-auth", maxAge });
}
