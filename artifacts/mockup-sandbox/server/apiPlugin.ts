import type { Plugin } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getPool } from "./db";
import { sendEmail } from "../src/utils/replitmail";

const ADMIN_EMAIL = "shirinakhavi@yahoo.com";
const MAX_BODY_BYTES = 256 * 1024;
const SESSION_COOKIE = "nnc_session";
const SESSION_TTL_DAYS = 30;

// ---------- admin bootstrap ----------
// Provisions the admin user from ADMIN_BOOTSTRAP_PASSWORD env on server start.
// Public signup never grants admin, so this is the only path to admin access.
let bootstrapPromise: Promise<void> | null = null;
async function ensureAdminBootstrap(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const pw = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    if (!pw || pw.length < 8) {
      console.warn("[nnc-api] ADMIN_BOOTSTRAP_PASSWORD not set or too short — admin will not be provisioned");
      return;
    }
    const pool = getPool();
    const hash = await bcrypt.hash(pw, 10);
    // Insert admin if missing; if it exists with no password_hash, set it.
    await pool.query(
      `INSERT INTO users (email, name, password_hash, is_admin)
       VALUES ($1, $2, $3, TRUE)
       ON CONFLICT (email) DO UPDATE
         SET is_admin = TRUE,
             password_hash = COALESCE(users.password_hash, EXCLUDED.password_hash)`,
      [ADMIN_EMAIL, "Shirin Akhavi", hash]
    );
    console.log("[nnc-api] Admin account ensured for", ADMIN_EMAIL);
  })().catch((e) => {
    console.error("[nnc-api] Admin bootstrap failed:", e);
  });
  return bootstrapPromise;
}

// ---------- helpers ----------

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

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function setSessionCookie(res: ServerResponse, sessionId: string, maxAgeSec: number) {
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`
  );
}

function clearSessionCookie(res: ServerResponse) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
}

type SessionUser = {
  id: number;
  email: string;
  name: string | null;
  is_admin: boolean;
};

async function getSessionUser(req: IncomingMessage): Promise<SessionUser | null> {
  const cookies = parseCookies(req.headers.cookie);
  const sid = cookies[SESSION_COOKIE];
  if (!sid) return null;
  const pool = getPool();
  const r = await pool.query(
    `SELECT u.id, u.email, u.name, u.is_admin
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sid]
  );
  if (r.rowCount === 0) return null;
  return r.rows[0] as SessionUser;
}

async function createSession(userId: number): Promise<{ id: string; expiresAt: Date }> {
  const id = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const pool = getPool();
  await pool.query(`INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`, [
    id,
    userId,
    expiresAt,
  ]);
  return { id, expiresAt };
}

function publicUser(u: SessionUser) {
  return { id: u.id, email: u.email, name: u.name, isAdmin: u.is_admin };
}

// ---------- email helpers ----------

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
            (typeof x === "object"
              ? renderObject(x as Record<string, unknown>)
              : escapeHtml(String(x))) +
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
          )}</td><td style='padding:6px 10px;border-bottom:1px solid #eee;vertical-align:top'>${renderValue(
            v
          )}</td></tr>`
      )
      .join("") +
    "</table>"
  );
}

function buildEnrollmentEmail(payload: {
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
  ];

  return {
    subject: `New enrollment: ${payload.patientName || "Unnamed patient"} — ${payload.appointmentDate} ${payload.appointmentTime}`,
    text: textLines.join("\n"),
    html,
  };
}

// ---------- schemas ----------

const zEnrollPayload = z.object({
  intake: z.record(z.unknown()).default({}),
  consent: z.record(z.unknown()).default({}),
  booking: z
    .object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
      time: z.string().min(1, "Time is required"),
    })
    .passthrough(),
});

const zCredentials = z.object({
  email: z.string().email("Invalid email").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
  name: z.string().max(200).optional(),
});

const zReschedule = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date"),
  time: z.string().min(1, "Time is required"),
});

const zIntakeUpdate = z.object({
  intake: z.record(z.unknown()),
});

// ---------- route handlers ----------

async function handleSignup(req: IncomingMessage, res: ServerResponse) {
  const body = await readJsonBody(req);
  const parsed = zCredentials.safeParse(body);
  if (!parsed.success) {
    sendJson(res, 400, {
      error: "Invalid signup",
      details: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();
  const name = parsed.data.name?.trim() || null;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  // Optional claim token to link the just-submitted enrollment to this new account
  const claim = z
    .object({ claimEnrollmentId: z.number().int().positive(), claimToken: z.string().min(20) })
    .safeParse(body);

  const pool = getPool();
  try {
    // SECURITY: signup NEVER grants admin. Admin is provisioned only by server bootstrap.
    const r = await pool.query(
      `INSERT INTO users (email, name, password_hash, is_admin)
       VALUES ($1, $2, $3, FALSE)
       RETURNING id, email, name, is_admin`,
      [email, name, passwordHash]
    );
    const user = r.rows[0] as SessionUser;

    // SECURITY: only link an enrollment if the caller proves they own it via the
    // claim token that was returned to them when they submitted the enrollment.
    if (claim.success) {
      await pool.query(
        `UPDATE enrollments
         SET user_id = $1, claim_token = NULL
         WHERE id = $2 AND claim_token = $3 AND user_id IS NULL`,
        [user.id, claim.data.claimEnrollmentId, claim.data.claimToken]
      );
    }

    const { id, expiresAt } = await createSession(user.id);
    const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    setSessionCookie(res, id, maxAge);
    sendJson(res, 200, { user: publicUser(user) });
  } catch (e: any) {
    if (e?.code === "23505") {
      sendJson(res, 409, { error: "An account with that email already exists. Try logging in." });
      return;
    }
    throw e;
  }
}

async function handleLogin(req: IncomingMessage, res: ServerResponse) {
  const body = await readJsonBody(req);
  const parsed = z
    .object({ email: z.string().email().max(254), password: z.string().min(1).max(200) })
    .safeParse(body);
  if (!parsed.success) {
    sendJson(res, 400, { error: "Invalid login" });
    return;
  }
  const email = parsed.data.email.toLowerCase().trim();
  const pool = getPool();
  const r = await pool.query(
    `SELECT id, email, name, is_admin, password_hash FROM users WHERE lower(email) = $1`,
    [email]
  );
  if (r.rowCount === 0) {
    sendJson(res, 401, { error: "Invalid email or password" });
    return;
  }
  const row = r.rows[0];
  if (!row.password_hash) {
    sendJson(res, 401, { error: "Invalid email or password" });
    return;
  }
  const ok = await bcrypt.compare(parsed.data.password, row.password_hash);
  if (!ok) {
    sendJson(res, 401, { error: "Invalid email or password" });
    return;
  }
  const { id, expiresAt } = await createSession(row.id);
  const maxAge = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  setSessionCookie(res, id, maxAge);
  sendJson(res, 200, {
    user: publicUser({ id: row.id, email: row.email, name: row.name, is_admin: row.is_admin }),
  });
}

async function handleLogout(req: IncomingMessage, res: ServerResponse) {
  const cookies = parseCookies(req.headers.cookie);
  const sid = cookies[SESSION_COOKIE];
  if (sid) {
    await getPool().query(`DELETE FROM sessions WHERE id = $1`, [sid]);
  }
  clearSessionCookie(res);
  sendJson(res, 200, { ok: true });
}

async function handleMe(req: IncomingMessage, res: ServerResponse) {
  const user = await getSessionUser(req);
  sendJson(res, 200, { user: user ? publicUser(user) : null });
}

async function handleEnroll(req: IncomingMessage, res: ServerResponse) {
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

  const sessionUser = await getSessionUser(req);

  const patientName = String(
    (intake.fullName as string) ||
      (intake.full_name as string) ||
      (consent.legalName as string) ||
      sessionUser?.name ||
      ""
  ).trim();
  const patientEmail = String(intake.email ?? sessionUser?.email ?? "").trim().toLowerCase();
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

  // Link to user only via authenticated session. Email is unverified, so we never
  // auto-link by email. Anonymous enrollments get a one-time claim token instead.
  const userId: number | null = sessionUser?.id ?? null;
  const claimToken = userId === null ? randomBytes(32).toString("hex") : null;

  const pool = getPool();
  const insertResult = await pool.query(
    `INSERT INTO enrollments
      (patient_name, patient_email, patient_phone, tier, appointment_date, appointment_time, intake_data, consent_data, booking_data, user_id, claim_token)
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
    ]
  );

  const { id, created_at } = insertResult.rows[0];

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
    linkedToUser: userId !== null,
    claimToken, // returned only for anonymous enrollments; used to securely claim on signup
  });
}

async function handleMyEnrollments(req: IncomingMessage, res: ServerResponse) {
  const user = await getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: "Not signed in" });
    return;
  }
  const r = await getPool().query(
    `SELECT id, patient_name, patient_email, patient_phone, tier,
            appointment_date, appointment_time,
            intake_data, consent_data, booking_data, created_at
     FROM enrollments
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [user.id]
  );
  sendJson(res, 200, { enrollments: r.rows });
}

async function handleReschedule(req: IncomingMessage, res: ServerResponse, enrollmentId: number) {
  const user = await getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: "Not signed in" });
    return;
  }
  const body = await readJsonBody(req);
  const parsed = zReschedule.safeParse(body);
  if (!parsed.success) {
    sendJson(res, 400, { error: parsed.error.issues[0]?.message || "Invalid input" });
    return;
  }
  const r = await getPool().query(
    `UPDATE enrollments
     SET appointment_date = $1,
         appointment_time = $2,
         booking_data = booking_data || jsonb_build_object('date', $1::text, 'time', $2::text)
     WHERE id = $3 AND user_id = $4
     RETURNING id, appointment_date, appointment_time`,
    [parsed.data.date, parsed.data.time, enrollmentId, user.id]
  );
  if (r.rowCount === 0) {
    sendJson(res, 404, { error: "Enrollment not found" });
    return;
  }
  sendJson(res, 200, { ok: true, enrollment: r.rows[0] });
}

async function handleUpdateIntake(req: IncomingMessage, res: ServerResponse, enrollmentId: number) {
  const user = await getSessionUser(req);
  if (!user) {
    sendJson(res, 401, { error: "Not signed in" });
    return;
  }
  const body = await readJsonBody(req);
  const parsed = zIntakeUpdate.safeParse(body);
  if (!parsed.success) {
    sendJson(res, 400, { error: "Invalid intake data" });
    return;
  }
  const r = await getPool().query(
    `UPDATE enrollments
     SET intake_data = $1
     WHERE id = $2 AND user_id = $3
     RETURNING id`,
    [JSON.stringify(parsed.data.intake), enrollmentId, user.id]
  );
  if (r.rowCount === 0) {
    sendJson(res, 404, { error: "Enrollment not found" });
    return;
  }
  sendJson(res, 200, { ok: true });
}

async function handleAdminEnrollments(req: IncomingMessage, res: ServerResponse) {
  const user = await getSessionUser(req);
  if (!user || !user.is_admin) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }
  const r = await getPool().query(
    `SELECT id, patient_name, patient_email, patient_phone, tier,
            appointment_date, appointment_time,
            intake_data, consent_data, booking_data, created_at, user_id
     FROM enrollments
     ORDER BY created_at DESC
     LIMIT 500`
  );
  sendJson(res, 200, { enrollments: r.rows });
}

// ---------- plugin ----------

type Route = {
  method: string;
  match: (path: string) => RegExpMatchArray | null | true;
  handler: (req: IncomingMessage, res: ServerResponse, params: string[]) => Promise<void>;
};

const routes: Route[] = [
  { method: "POST", match: (p) => (p === "/api/auth/signup" ? true : null), handler: (req, res) => handleSignup(req, res) },
  { method: "POST", match: (p) => (p === "/api/auth/login" ? true : null), handler: (req, res) => handleLogin(req, res) },
  { method: "POST", match: (p) => (p === "/api/auth/logout" ? true : null), handler: (req, res) => handleLogout(req, res) },
  { method: "GET", match: (p) => (p === "/api/auth/me" ? true : null), handler: (req, res) => handleMe(req, res) },
  { method: "POST", match: (p) => (p === "/api/enroll" ? true : null), handler: (req, res) => handleEnroll(req, res) },
  { method: "GET", match: (p) => (p === "/api/my/enrollments" ? true : null), handler: (req, res) => handleMyEnrollments(req, res) },
  {
    method: "PATCH",
    match: (p) => p.match(/^\/api\/my\/enrollments\/(\d+)\/reschedule$/),
    handler: (req, res, params) => handleReschedule(req, res, Number(params[0])),
  },
  {
    method: "PATCH",
    match: (p) => p.match(/^\/api\/my\/enrollments\/(\d+)\/intake$/),
    handler: (req, res, params) => handleUpdateIntake(req, res, Number(params[0])),
  },
  { method: "GET", match: (p) => (p === "/api/admin/enrollments" ? true : null), handler: (req, res) => handleAdminEnrollments(req, res) },
];

export function apiPlugin(): Plugin {
  return {
    name: "nnc-api",
    configureServer(server) {
      // Provision admin once on startup
      void ensureAdminBootstrap();
      server.middlewares.use("/api/", async (req, res, next) => {
        const url = req.url || "/";
        const pathname = url.split("?")[0];
        const fullPath = "/api" + pathname; // url is relative to /api/ mount
        const method = (req.method || "GET").toUpperCase();

        for (const route of routes) {
          const m = route.match(fullPath);
          if (!m) continue;
          if (route.method !== method) {
            sendJson(res, 405, { error: "Method not allowed" });
            return;
          }
          try {
            const params = m === true ? [] : (Array.from(m).slice(1) as string[]);
            await route.handler(req, res, params);
          } catch (e: any) {
            console.error(`[nnc-api] ${method} ${fullPath} error:`, e);
            sendJson(res, 500, { error: e?.message || "Internal error" });
          }
          return;
        }
        next();
      });
    },
  };
}
