import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../../_lib/db";
import { getSessionUser, methodGuard, sendJson } from "../../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET"])) return;
  try {
    const user = await getSessionUser(req);
    if (!user) return sendJson(res, 401, { error: "Not signed in" });
    const r = await getPool().query(
      `SELECT id, patient_name, patient_email, patient_phone, tier,
              appointment_date, appointment_time,
              intake_data, consent_data, booking_data, created_at
         FROM enrollments
        WHERE user_id = $1
        ORDER BY created_at DESC`,
      [user.id],
    );
    sendJson(res, 200, { enrollments: r.rows });
  } catch (e: any) {
    console.error("[my/enrollments]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
