import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSessionUser, methodGuard, publicUser, sendJson } from "../_lib/auth";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!methodGuard(req, res, ["GET"])) return;
  try {
    const user = await getSessionUser(req);
    sendJson(res, 200, { user: user ? publicUser(user) : null });
  } catch (e: any) {
    console.error("[me]", e);
    sendJson(res, 500, { error: e?.message || "Internal error" });
  }
}
