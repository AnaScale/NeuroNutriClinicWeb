import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPool } from "../_lib/db";
import { createSession, ensureAdminBootstrap, methodGuard, publicUser, sendJson, setSessionCookie } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  try {
    // Bootstrap admin on first login attempt (idempotent / cached).
    await ensureAdminBootstrap();
    const parsed = z
      .object({ email: z.string().email().max(254), password: z.string().min(1).max(200) })
      .safeParse(req.body ?? {});
    if (!parsed.success) return sendJson(res, 400, { error: "Invalid login" });

    const email = parsed.data.email.toLowerCase().trim();
    const r = await getPool().query(
      `SELECT id, email, name, is_admin, password_hash FROM users WHERE lower(email) = $1`,
      [email],
    );
    if (r.rowCount === 0) return sendJson(res, 401, { error: "Invalid email or password" });
    const row = r.rows[0];
    if (!row.password_hash) return sendJson(res, 401, { error: "Invalid email or password" });
    const ok = await bcrypt.compare(parsed.data.password, row.password_hash);
    if (!ok) return sendJson(res, 401, { error: "Invalid email or password" });

    const { id, expiresAt } = await createSession(row.id);
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    setSessionCookie(res, id, maxAge);
    sendJson(res, 200, {
      user: publicUser({ id: row.id, email: row.email, name: row.name, is_admin: row.is_admin }),
    });
  } catch (e: any) {
    console.error("[login]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
