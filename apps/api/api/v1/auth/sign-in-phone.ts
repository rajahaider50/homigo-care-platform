import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminServices } from "../../../src/firebase-admin.js";
import { applyCors, getRequestIp } from "../../../src/http.js";
import { enforceRateLimit, RateLimitError } from "../../../src/rate-limit.js";
import { normalizePakistaniMobile } from "../../../src/validation.js";
import { phoneIndexId } from "../../../src/whatsapp-proof.js";

const GENERIC_FAILURE = "Phone or password is incorrect, or this number is not linked to an eligible HomiGo account.";

type PasswordSignInResponse = { idToken?: unknown; localId?: unknown };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res) === "handled") return;
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });

  const number = normalizePakistaniMobile(req.body?.number);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!number.ok) return res.status(400).json({ error: number.message });
  if (password.length < 1 || password.length > 128) return res.status(400).json({ error: "Enter a valid password." });

  const proofSecret = process.env.OTP_PROOF_SECRET?.trim() ?? "";
  const apiKey = process.env.FIREBASE_WEB_API_KEY?.trim() ?? "";
  const services = getAdminServices();
  if (!services || proofSecret.length < 32 || !apiKey) {
    return res.status(503).json({ error: "Secure phone sign-in is not configured on the server." });
  }

  try {
    await enforceRateLimit(services.db, { action: "phone-login", number: number.value, ip: getRequestIp(req), secret: proofSecret });
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.setHeader("Retry-After", String(error.retryAfterSeconds));
      return res.status(429).json({ error: `Too many sign-in attempts. Try again in ${error.retryAfterSeconds} seconds.` });
    }
    return res.status(503).json({ error: "Secure phone-sign-in rate limiting is temporarily unavailable." });
  }

  try {
    const phoneHash = phoneIndexId(number.value, proofSecret);
    const phoneSnapshot = await services.db.collection("phone_index").doc(phoneHash).get();
    const mapping = phoneSnapshot.data();
    if (!phoneSnapshot.exists || mapping?.status !== "active" || typeof mapping.email !== "string" || typeof mapping.uid !== "string") {
      return res.status(401).json({ error: GENERIC_FAILURE });
    }

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: mapping.email, password, returnSecureToken: true }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (response.status === 429 || response.status >= 500) {
      return res.status(502).json({ error: "Firebase sign-in is temporarily unavailable. Try again shortly." });
    }
    if (!response.ok) return res.status(401).json({ error: GENERIC_FAILURE });

    const result = await response.json() as PasswordSignInResponse;
    if (typeof result.idToken !== "string" || result.localId !== mapping.uid) {
      return res.status(401).json({ error: GENERIC_FAILURE });
    }
    const identity = await services.auth.verifyIdToken(result.idToken, true);
    if (identity.uid !== mapping.uid || identity.email_verified !== true) {
      return res.status(401).json({ error: GENERIC_FAILURE });
    }
    const account = await services.auth.getUser(identity.uid);
    if (account.customClaims?.whatsapp_verified !== true || account.customClaims?.whatsapp_number !== number.value) {
      return res.status(401).json({ error: GENERIC_FAILURE });
    }

    const customToken = await services.auth.createCustomToken(identity.uid);
    return res.status(200).json({ signedIn: true, customToken });
  } catch {
    return res.status(503).json({ error: "Secure phone sign-in could not be completed. Try email sign-in or contact HomiGo support." });
  }
}
