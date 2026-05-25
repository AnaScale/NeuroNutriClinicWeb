import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getPool } from "../_lib/db";
import { createSession, methodGuard, publicUser, sendJson, setSessionCookie, type SessionUser } from "../_lib/auth";
import { zCredentials } from "../_lib/schemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  try {
    const body = (req.body ?? {}) as any;
    const parsed = zCredentials.safeParse(body);
    if (!parsed.success) {
      return sendJson(res, 400, {
        error: "Invalid signup",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    const email = parsed.data.email.toLowerCase().trim();
    const name = parsed.data.name?.trim() || null;
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);

    const claim = z
      .object({ claimEnrollmentId: z.number().int().positive(), claimToken: z.string().min(20) })
      .safeParse(body);

    const pool = getPool();
    let user: SessionUser;
    try {
      // SECURITY: signup NEVER grants admin.
      const r = await pool.query(
        `INSERT INTO users (email, name, password_hash, is_admin)
         VALUES ($1, $2, $3, FALSE)
         RETURNING id, email, name, is_admin`,
        [email, name, passwordHash],
      );
      user = r.rows[0] as SessionUser;
    } catch (e: any) {
      if (e?.code === "23505") {
        return sendJson(res, 409, { error: "An account with that email already exists. Try logging in." });
      }
      throw e;
    }

    // SECURITY: only link an enrollment if caller proves ownership via claim token.
    if (claim.success) {
      await pool.query(
        `UPDATE enrollments
           SET user_id = $1, claim_token = NULL
         WHERE id = $2 AND claim_token = $3 AND user_id IS NULL`,
        [user.id, claim.data.claimEnrollmentId, claim.data.claimToken],
      );
    }

    const { id, expiresAt } = await createSession(user.id);
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    setSessionCookie(res, id, maxAge);
    sendJson(res, 200, { user: publicUser(user) });
  } catch (e: any) {
    console.error("[signup]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
