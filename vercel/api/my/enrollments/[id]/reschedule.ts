import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../../../_lib/db";
import { getSessionUser, methodGuard, sendJson } from "../../../_lib/auth";
import { zReschedule } from "../../../_lib/schemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["PATCH"])) return;
  try {
    const user = await getSessionUser(req);
    if (!user) return sendJson(res, 401, { error: "Not signed in" });
    const enrollmentId = Number(req.query.id);
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      return sendJson(res, 400, { error: "Invalid enrollment id" });
    }
    const parsed = zReschedule.safeParse(req.body ?? {});
    if (!parsed.success) {
      return sendJson(res, 400, { error: parsed.error.issues[0]?.message || "Invalid input" });
    }
    const r = await getPool().query(
      `UPDATE enrollments
         SET appointment_date = $1,
             appointment_time = $2,
             booking_data = booking_data || jsonb_build_object('date', $1::text, 'time', $2::text)
       WHERE id = $3 AND user_id = $4
       RETURNING id, appointment_date, appointment_time`,
      [parsed.data.date, parsed.data.time, enrollmentId, user.id],
    );
    if (r.rowCount === 0) return sendJson(res, 404, { error: "Enrollment not found" });
    sendJson(res, 200, { ok: true, enrollment: r.rows[0] });
  } catch (e: any) {
    console.error("[reschedule]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
