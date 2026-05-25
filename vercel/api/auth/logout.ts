import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getPool } from "../_lib/db";
import { SESSION_COOKIE, clearSessionCookie, methodGuard, sendJson } from "../_lib/auth";

function readCookie(header: string | string[] | undefined, name: string): string | null {
  if (!header) return null;
  const raw = Array.isArray(header) ? header.join(";") : header;
  for (const part of raw.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["POST"])) return;
  try {
    const sid = readCookie(req.headers.cookie, SESSION_COOKIE);
    if (sid) await getPool().query(`DELETE FROM sessions WHERE id = $1`, [sid]);
    clearSessionCookie(res);
    sendJson(res, 200, { ok: true });
  } catch (e: any) {
    console.error("[logout]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
