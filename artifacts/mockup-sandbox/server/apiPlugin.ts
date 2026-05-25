import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { z } from "zod";
import { getPool } from "./db";
import { sendEmail } from "../src/utils/replitmail";

const ADMIN_EMAIL = "shirinakhavi@yahoo.com";
const MAX_BODY_BYTES = 256 * 1024; // 256 KB

const zEnrollPayload = z.object({
  intake: z.record(z.unknown()).default({}),
  consent: z.record(z.unknown()).default({}),
  booking: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
    time: z.string().min(1, "Time is required"),
  }).passthrough(),
});

function readJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (c: Buffer) => {
      total += c.length;
      if (total > MAX_BODY_BYTES) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatKey(k: string): string {
  return k
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined || v === "") return "<em>—</em>";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) {
    if (v.length === 0) return "<em>—</em>";
    if (v.every((x) => typeof x !== "object")) {
      return v.map((x) => escapeHtml(String(x))).join(", ");
    }
    return (
      "<ul style='margin:4px 0 0 0;padding-left:20px'>" +
      v
        .map(
          (x) =>
            "<li>" +
            (typeof x === "object" ? renderObject(x as Record<string, unknown>) : escapeHtml(String(x))) +
            "</li>"
        )
        .join("") +
      "</ul>"
    );
  }
  if (typeof v === "object") return renderObject(v as Record<string, unknown>);
  return escapeHtml(String(v));
}

function renderObject(obj: Record<string, unknown>): string {
  const entries = Object.entries(obj).filter(([, v]) => v !== "" && v !== null && v !== undefined);
  if (entries.length === 0) return "<em>—</em>";
  return (
    "<table style='border-collapse:collapse;width:100%;font-size:13px'>" +
    entries
      .map(
        ([k, v]) =>
          `<tr><td style='padding:6px 10px;border-bottom:1px solid #eee;vertical-align:top;color:#556;width:35%;font-weight:500'>${escapeHtml(
            formatKey(k)
          )}</td><td style='padding:6px 10px;border-bottom:1px solid #eee;vertical-align:top'>${renderValue(v)}</td></tr>`
      )
      .join("") +
    "</table>"
  );
}

function buildEmail(payload: {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  tier: string;
  appointmentDate: string;
  appointmentTime: string;
  intake: Record<string, unknown>;
  consent: Record<string, unknown>;
  booking: Record<string, unknown>;
}) {
  const summaryRows = [
    ["Patient", payload.patientName],
    ["Email", payload.patientEmail],
    ["Phone", payload.patientPhone],
    ["Tier", payload.tier],
    ["Date", payload.appointmentDate],
    ["Time", payload.appointmentTime],
  ];

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#F9F8F6;padding:24px;color:#333633">
      <div style="max-width:680px;margin:0 auto;background:#fff;padding:32px;border-radius:12px;border:1px solid #E5E7E0">
        <h1 style="font-family:Georgia,serif;color:#4E8C3C;margin:0 0 8px 0;font-size:24px">New Enrollment</h1>
        <p style="color:#666;margin:0 0 24px 0;font-size:14px">A new patient has completed the Neuro Nutri Clinic enrollment flow.</p>

        <h2 style="font-size:16px;color:#4E8C3C;margin:24px 0 8px 0;border-bottom:2px solid #8FBF7A;padding-bottom:4px">Summary</h2>
        <table style="border-collapse:collapse;width:100%;font-size:14px">
          ${summaryRows
            .map(
              ([k, v]) =>
                `<tr><td style='padding:8px 10px;border-bottom:1px solid #eee;color:#556;width:30%;font-weight:500'>${escapeHtml(
                  k
                )}</td><td style='padding:8px 10px;border-bottom:1px solid #eee'>${escapeHtml(v || "—")}</td></tr>`
            )
            .join("")}
        </table>

        <h2 style="font-size:16px;color:#4E8C3C;margin:32px 0 8px 0;border-bottom:2px solid #8FBF7A;padding-bottom:4px">Booking</h2>
        ${renderObject(payload.booking)}

        <h2 style="font-size:16px;color:#4E8C3C;margin:32px 0 8px 0;border-bottom:2px solid #8FBF7A;padding-bottom:4px">Consent</h2>
        ${renderObject(payload.consent)}

        <h2 style="font-size:16px;color:#4E8C3C;margin:32px 0 8px 0;border-bottom:2px solid #8FBF7A;padding-bottom:4px">Intake Form</h2>
        ${renderObject(payload.intake)}

        <p style="color:#999;font-size:12px;margin-top:32px;text-align:center">Sent automatically from the Neuro Nutri Clinic website.</p>
      </div>
    </div>
  `;

  const textLines = [
    "New Neuro Nutri Clinic enrollment",
    "",
    `Patient: ${payload.patientName}`,
    `Email:   ${payload.patientEmail}`,
    `Phone:   ${payload.patientPhone}`,
    `Tier:    ${payload.tier}`,
    `Date:    ${payload.appointmentDate}`,
    `Time:    ${payload.appointmentTime}`,
    "",
    "Full intake, consent, and booking data are included in the HTML version of this email and saved in the database.",
  ];

  return {
    subject: `New enrollment: ${payload.patientName || "Unnamed patient"} — ${payload.appointmentDate} ${payload.appointmentTime}`,
    text: textLines.join("\n"),
    html,
  };
}

export function apiPlugin(): Plugin {
  return {
    name: "nnc-api",
    configureServer(server) {
      server.middlewares.use("/api/enroll", async (req, res) => {
        if (req.method !== "POST") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }

        try {
          const rawBody = await readJsonBody(req);
          const parsed = zEnrollPayload.safeParse(rawBody);
          if (!parsed.success) {
            sendJson(res, 400, {
              error: "Invalid submission",
              details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
            });
            return;
          }
          const { intake, consent, booking } = parsed.data;

          const patientName = String(
            (intake.fullName as string) ||
            (intake.full_name as string) ||
            (consent.legalName as string) ||
            ""
          ).trim();
          const patientEmail = String(intake.email ?? "").trim();
          const patientPhone = String(intake.phone ?? "").trim();
          const tier = String(consent.tier ?? booking.tier ?? "").trim();
          const appointmentDate = String(booking.date);
          const appointmentTime = String(booking.time);

          if (!patientName) {
            sendJson(res, 400, { error: "Patient name is required." });
            return;
          }
          if (patientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientEmail)) {
            sendJson(res, 400, { error: "Invalid email address." });
            return;
          }

          const pool = getPool();
          const insertResult = await pool.query(
            `INSERT INTO enrollments
              (patient_name, patient_email, patient_phone, tier, appointment_date, appointment_time, intake_data, consent_data, booking_data)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
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
            ]
          );

          const { id, created_at } = insertResult.rows[0];

          let emailStatus: { sent: boolean; error?: string } = { sent: false };
          try {
            const msg = buildEmail({
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
            await sendEmail(msg);
            emailStatus = { sent: true };
          } catch (e: any) {
            emailStatus = { sent: false, error: e?.message || String(e) };
            console.error("[nnc-api] Email send failed:", e);
          }

          sendJson(res, 200, {
            ok: true,
            id,
            createdAt: created_at,
            email: emailStatus,
            notifyTarget: ADMIN_EMAIL,
          });
        } catch (e: any) {
          console.error("[nnc-api] /api/enroll error:", e);
          sendJson(res, 500, { error: e?.message || "Internal error" });
        }
      });

      server.middlewares.use("/api/enrollments", async (req, res) => {
        if (req.method !== "GET") {
          sendJson(res, 405, { error: "Method not allowed" });
          return;
        }
        const adminToken = process.env.NNC_ADMIN_TOKEN;
        if (!adminToken) {
          sendJson(res, 404, { error: "Not found" });
          return;
        }
        const provided =
          (req.headers["x-admin-token"] as string | undefined) ||
          (req.headers["authorization"] as string | undefined)?.replace(/^Bearer\s+/i, "");
        if (provided !== adminToken) {
          sendJson(res, 401, { error: "Unauthorized" });
          return;
        }
        try {
          const pool = getPool();
          const result = await pool.query(
            `SELECT id, patient_name, patient_email, patient_phone, tier,
                    appointment_date, appointment_time, created_at
             FROM enrollments
             ORDER BY created_at DESC
             LIMIT 100`
          );
          sendJson(res, 200, { enrollments: result.rows });
        } catch (e: any) {
          sendJson(res, 500, { error: e?.message || "Internal error" });
        }
      });
    },
  };
}
