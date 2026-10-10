import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminServices } from "../../src/firebase-admin.js";
import { readGatewayConfig, sendOtp } from "../../src/gateway.js";
import { applyCors, getRequestIp } from "../../src/http.js";
import { enforceRateLimit, RateLimitError } from "../../src/rate-limit.js";
import { normalizePakistaniMobile } from "../../src/validation.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res) === "handled") return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const number = normalizePakistaniMobile(req.body?.number);
  if (!number.ok) return res.status(400).json({ error: number.message });
  const config = readGatewayConfig();
  if (!config) return res.status(503).json({ error: "WhatsApp OTP is not configured on the server." });
  const proofSecret = process.env.OTP_PROOF_SECRET?.trim() ?? "";
  const services = getAdminServices();
  if (!services || proofSecret.length < 32) return res.status(503).json({ error: "Secure OTP rate limiting is not configured." });
  try {
    await enforceRateLimit(services.db, { action: "send", number: number.value, ip: getRequestIp(req), secret: proofSecret });
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", String(error.retryAfterSeconds));
      return res.status(429).json({ error: `Too many code requests. Try again in ${error.retryAfterSeconds} seconds.` });
    }
    return res.status(503).json({ error: "Secure OTP rate limiting is temporarily unavailable." });
  }
  const result = await sendOtp(config, number.value);
  if (!result.ok) return res.status(result.reason === "upstream" ? 502 : 503).json({ error: "The WhatsApp code could not be sent. Check the gateway configuration and try again." });
  return res.status(200).json({ sent: true, number: number.value });
}
