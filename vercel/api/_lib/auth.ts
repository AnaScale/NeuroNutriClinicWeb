import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { getPool } from "./db";

export const SESSION_COOKIE = "nnc_session";
export const SESSION_TTL_DAYS = 30;
export const ADMIN_EMAIL = (process.env.NOTIFY_EMAIL || "").toLowerCase();

export type SessionUser = {
  id: number;
  email: string;
  name: string | null;
  is_admin: boolean;
};

export function publicUser(u: SessionUser) {
  return { id: u.id, email: u.email, name: u.name, isAdmin: u.is_admin };
}

function parseCookies(header: string | string[] | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  const raw = Array.isArray(header) ? header.join(";") : header;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function setSessionCookie(res: VercelResponse, sessionId: string, maxAgeSec: number) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`,
  );
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
  );
}

export async function getSessionUser(req: VercelRequest): Promise<SessionUser | null> {
  const cookies = parseCookies(req.headers.cookie);
  const sid = cookies[SESSION_COOKIE];
  if (!sid) return null;
  const r = await getPool().query(
    `SELECT u.id, u.email, u.name, u.is_admin
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sid],
  );
  if (r.rowCount === 0) return null;
  return r.rows[0] as SessionUser;
}

export async function createSession(userId: number): Promise<{ id: string; expiresAt: Date }> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  await getPool().query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [id, userId, expiresAt],
  );
  return { id, expiresAt };
}

// One-time admin bootstrap. Safe to call from any handler — internally guarded.
let bootstrapDone = false;
let bootstrapPromise: Promise<void> | null = null;
export async function ensureAdminBootstrap(): Promise<void> {
  if (bootstrapDone) return;
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const pw = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!pw || pw.length < 8 || !ADMIN_EMAIL) return;
    const hash = await bcrypt.hash(pw, 10);
    await getPool().query(
      `INSERT INTO users (email, name, password_hash, is_admin)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (email) DO UPDATE
         SET is_admin = TRUE,
             password_hash = COALESCE(users.password_hash, EXCLUDED.password_hash)`,
      [ADMIN_EMAIL, "Admin", hash],
    );
    bootstrapDone = true;
  })().catch((e) => {
    console.error("[admin-bootstrap] failed:", e);
  });
  return bootstrapPromise;
}

export function applySecurityHeaders(res: VercelResponse) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
}

export function sendJson(res: VercelResponse, status: number, body: unknown) {
  applySecurityHeaders(res);
  res.status(status).json(body);
}

export function methodGuard(req: VercelRequest, res: VercelResponse, allowed: string[]): boolean {
  if (!allowed.includes((req.method || "GET").toUpperCase())) {
    sendJson(res, 405, { error: "Method not allowed" });
    return false;
  }
  return true;
}
