import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomBytes } from "node:crypto";
import { getPool } from "./_lib/db";
import { ADMIN_EMAIL, getSessionUser, methodGuard, sendJson } from "./_lib/auth";
import { buildEnrollmentEmail, sendNotificationEmail } from "./_lib/email";
import { zEnrollPayload } from "./_lib/schemas";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  try {
    const parsed = zEnrollPayload.safeParse(req.body ?? {});
    if (!parsed.success) {
      return sendJson(res, 400, {
        error: "Invalid submission",
        details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
      });
    }
    const { intake, consent, booking } = parsed.data;
    const sessionUser = await getSessionUser(req);

    const patientName = String(
      (intake.fullName as string) ||
        (intake.full_name as string) ||
        (consent.legalName as string) ||
        sessionUser?.name ||
        "",
    ).trim();
    const patientEmail = String(intake.email ?? sessionUser?.email ?? "")
      .trim()
      .toLowerCase();
    const patientPhone = String(intake.phone ?? "").trim();
    const tier = String(consent.tier ?? booking.tier ?? "").trim();
    const appointmentDate = String(booking.date);
    const appointmentTime = String(booking.time);

    if (!patientName) return sendJson(res, 400, { error: "Patient name is required." });
    if (patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
      return sendJson(res, 400, { error: "Invalid email address." });
    }

    const userId: number | null = sessionUser?.id ?? null;
    const claimToken = userId === null ? randomBytes(32).toString("hex") : null;

    const r = await getPool().query(
      `INSERT INTO enrollments
        (patient_name, patient_email, patient_phone, tier, appointment_date, appointment_time,
         intake_data, consent_data, booking_data, user_id, claim_token)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, created_at`,
      [
        patientName,
        patientEmail,
        patientPhone,
        tier,
        appointmentDate,
        appointmentTime,
        JSON.stringify(intake),
        JSON.stringify(consent),
        JSON.stringify(booking),
        userId,
        claimToken,
      ],
    );

    const { id, created_at } = r.rows[0];

    let emailStatus: { sent: boolean; error?: string } = { sent: false };
    try {
      const msg = buildEnrollmentEmail({
        patientName,
        patientEmail,
        patientPhone,
        tier,
        appointmentDate,
        appointmentTime,
        intake,
        consent,
        booking,
      });
      if (!ADMIN_EMAIL) throw new Error("NOTIFY_EMAIL not configured");
      await sendNotificationEmail({ to: ADMIN_EMAIL, ...msg });
      emailStatus = { sent: true };
    } catch (e: any) {
      emailStatus = { sent: false, error: e?.message || String(e) };
      console.error("[enroll] email failed:", e);
    }

    sendJson(res, 200, {
      ok: true,
      id,
      createdAt: created_at,
      email: emailStatus,
      linkedToUser: userId !== null,
      claimToken,
    });
  } catch (e: any) {
    console.error("[enroll]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
