import type { VercelRequest, VercelResponse } from "@vercel/node";

export function applyCors(req: VercelRequest, res: VercelResponse, methods = "POST, OPTIONS"): "continue" | "handled" {
  const rawOrigin = req.headers.origin;
  if (typeof rawOrigin !== "string" || rawOrigin.length === 0) {
    if (req.method === "OPTIONS") { res.status(204).end(); return "handled"; }
    return "continue";
  }
  const allowed = (process.env.HOMIGO_ALLOWED_ORIGINS ?? "http://localhost:5173,http://localhost:5174,http://localhost:4173,http://localhost:4174")
    .split(",").map((origin) => origin.trim()).filter(Boolean);
  if (!allowed.includes(rawOrigin)) {
    res.status(403).json({ error: "This website is not allowed to use the HomiGo API." });
    return "handled";
  }
  res.setHeader("Access-Control-Allow-Origin", rawOrigin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Max-Age", "600");
  if (req.method === "OPTIONS") { res.status(204).end(); return "handled"; }
  return "continue";
}

/** Return a bounded, transient client-IP string; callers must hash it before persistence. */
export function getRequestIp(req: VercelRequest): string {
  const forwarded = req.headers["x-forwarded-for"];
  const forwardedValue = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const candidate = typeof forwardedValue === "string"
    ? forwardedValue.split(",")[0]?.trim()
    : req.socket.remoteAddress;
  return candidate && candidate.length <= 128 ? candidate : "unknown";
}
