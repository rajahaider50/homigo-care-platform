import type { VercelRequest, VercelResponse } from "@vercel/node";

export type OriginConfig = { configured: boolean; origins: string[] };

/** Parse exact HTTPS origins; HTTP is allowed only for explicit loopback development origins. */
export function readAllowedOrigins(raw = process.env.HOMIGO_ALLOWED_ORIGINS): OriginConfig {
  if (typeof raw !== "string" || raw.trim() === "") return { configured: false, origins: [] };
  const entries = raw.split(",").map((item) => item.trim());
  if (entries.length === 0 || entries.some((item) => item === "")) return { configured: false, origins: [] };
  const origins: string[] = [];
  for (const entry of entries) {
    try {
      const url = new URL(entry);
      const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
      if (url.origin !== entry || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
        return { configured: false, origins: [] };
      }
      const allowLoopbackHttp = process.env.NODE_ENV !== "production" && url.protocol === "http:" && isLoopback;
      if (url.protocol !== "https:" && !allowLoopbackHttp) {
        return { configured: false, origins: [] };
      }
      origins.push(entry);
    } catch {
      return { configured: false, origins: [] };
    }
  }
  return { configured: origins.length > 0, origins: [...new Set(origins)] };
}

export function applyCors(req: VercelRequest, res: VercelResponse, methods = "POST, OPTIONS"): "continue" | "handled" {
  const rawOrigin = req.headers.origin;
  if (typeof rawOrigin !== "string" || rawOrigin.length === 0) {
    if (req.method === "OPTIONS") { res.status(204).end(); return "handled"; }
    // Native Android requests do not send a browser Origin header.
    return "continue";
  }
  const config = readAllowedOrigins();
  if (!config.configured) {
    res.status(503).json({ error: "The secure API origin allowlist is not configured." });
    return "handled";
  }
  if (!config.origins.includes(rawOrigin)) {
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
