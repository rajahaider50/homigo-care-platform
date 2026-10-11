import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readGatewayConfig } from "../src/gateway.js";
import { getAdminServices } from "../src/firebase-admin.js";
import { applyCors, readAllowedOrigins } from "../src/http.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res, "GET, OPTIONS") === "handled") return;
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed." });
  const gatewayConfigured = readGatewayConfig() !== null;
  const firebaseAdminConfigured = getAdminServices() !== null;
  const identityToolkitConfigured = Boolean(process.env.FIREBASE_WEB_API_KEY?.trim());
  const proofSecretConfigured = Buffer.byteLength(process.env.OTP_PROOF_SECRET?.trim() ?? "", "utf8") >= 32;
  const allowedOriginsConfigured = readAllowedOrigins().configured;
  const ready = gatewayConfigured && firebaseAdminConfigured && identityToolkitConfigured && proofSecretConfigured && allowedOriginsConfigured;
  return res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "configuration_required",
    services: {
      whatsappOtpGateway: gatewayConfigured ? "configured" : "not_configured",
      firebaseAdmin: firebaseAdminConfigured ? "configured" : "not_configured",
      identityToolkit: identityToolkitConfigured ? "configured" : "not_configured",
      otpProofSigning: proofSecretConfigured ? "configured" : "not_configured",
      allowedOrigins: allowedOriginsConfigured ? "configured" : "not_configured",
    },
  });
}
