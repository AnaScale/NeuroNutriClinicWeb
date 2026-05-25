import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY is not set");
    client = new Resend(key);
  }
  return client;
}

export async function sendNotificationEmail(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<void> {
  const from = process.env.RESEND_FROM;
  if (!from) throw new Error("RESEND_FROM is not set");
  const { error } = await getClient().emails.send({
    from,
    to: [args.to],
    subject: args.subject,
    html: args.html,
    text: args.text,
  });
  if (error) throw new Error(error.message || "Resend send failed");
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
            "</li>",
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
            formatKey(k),
          )}</td><td style='padding:6px 10px;border-bottom:1px solid #eee;vertical-align:top'>${renderValue(v)}</td></tr>`,
      )
      .join("") +
    "</table>"
  );
}

export function buildEnrollmentEmail(payload: {
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
                `<tr><td style='padding:8px 10px;border-bottom:1px solid #eee;color:#556;width:30%;font-weight:500'>${escapeHtml(k)}</td><td style='padding:8px 10px;border-bottom:1px solid #eee'>${escapeHtml(v || "—")}</td></tr>`,
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

  const text = [
    "New Neuro Nutri Clinic enrollment",
    "",
    `Patient: ${payload.patientName}`,
    `Email:   ${payload.patientEmail}`,
    `Phone:   ${payload.patientPhone}`,
    `Tier:    ${payload.tier}`,
    `Date:    ${payload.appointmentDate}`,
    `Time:    ${payload.appointmentTime}`,
  ].join("\n");

  return {
    subject: `New enrollment: ${payload.patientName || "Unnamed patient"} — ${payload.appointmentDate} ${payload.appointmentTime}`,
    text,
    html,
  };
}
