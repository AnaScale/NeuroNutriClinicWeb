import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../../../_lib/db";
import { getSessionUser, methodGuard, sendJson } from "../../../_lib/auth";
import { zIntakeUpdate } from "../../../_lib/schemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["PATCH"])) return;
  try {
    const user = await getSessionUser(req);
    if (!user) return sendJson(res, 401, { error: "Not signed in" });
    const enrollmentId = Number(req.query.id);
    if (!Number.isInteger(enrollmentId) || enrollmentId <= 0) {
      return sendJson(res, 400, { error: "Invalid enrollment id" });
    }
    const parsed = zIntakeUpdate.safeParse(req.body ?? {});
    if (!parsed.success) return sendJson(res, 400, { error: "Invalid intake data" });
    const r = await getPool().query(
      `UPDATE enrollments SET intake_data = $1 WHERE id = $2 AND user_id = $3 RETURNING id`,
      [JSON.stringify(parsed.data.intake), enrollmentId, user.id],
    );
    if (r.rowCount === 0) return sendJson(res, 404, { error: "Enrollment not found" });
    sendJson(res, 200, { ok: true });
  } catch (e: any) {
    console.error("[intake]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
