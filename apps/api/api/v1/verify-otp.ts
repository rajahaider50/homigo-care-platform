import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminServices } from "../../src/firebase-admin.js";
import { readGatewayConfig, verifyOtp } from "../../src/gateway.js";
import { applyCors, getRequestIp } from "../../src/http.js";
import { enforceRateLimit, RateLimitError } from "../../src/rate-limit.js";
import { normalizePakistaniMobile, validateOtp } from "../../src/validation.js";
import { issueWhatsAppProof } from "../../src/whatsapp-proof.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res) === "handled") return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const number = normalizePakistaniMobile(req.body?.number);
  if (!number.ok) return res.status(400).json({ error: number.message });
  const otp = validateOtp(req.body?.otp);
  if (!otp.ok) return res.status(400).json({ error: otp.message });
  const config = readGatewayConfig();
  if (!config) return res.status(503).json({ error: "WhatsApp OTP is not configured on the server." });
  const proofSecret = process.env.OTP_PROOF_SECRET?.trim() ?? "";
  const services = getAdminServices();
  if (!services || proofSecret.length < 32) return res.status(503).json({ error: "Secure phone verification is not configured." });
  try {
    await enforceRateLimit(services.db, { action: "verify", number: number.value, ip: getRequestIp(req), secret: proofSecret });
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", String(error.retryAfterSeconds));
      return res.status(429).json({ error: `Too many code checks. Try again in ${error.retryAfterSeconds} seconds.` });
    }
    return res.status(503).json({ error: "Secure phone-verification rate limiting is temporarily unavailable." });
  }
  const result = await verifyOtp(config, number.value, otp.value);
  if (!result.ok) {
    const message = result.reason === "unrecognized"
      ? "The gateway response format is not verified. Share its sanitized success response so it can be validated safely."
      : "The code could not be verified. Check the code or request a new one.";
    return res.status(result.reason === "upstream" ? 502 : result.reason === "configuration" ? 503 : 422).json({ error: message });
  }
  try {
    const issued = await issueWhatsAppProof(services.db, number.value, proofSecret);
    if (!issued) return res.status(503).json({ error: "The secure verification proof could not be created." });
    return res.status(200).json({ verified: true, proof: issued.token, number: number.value });
  } catch {
    return res.status(503).json({ error: "The secure verification proof could not be stored. Request a new code later." });
  }
}
