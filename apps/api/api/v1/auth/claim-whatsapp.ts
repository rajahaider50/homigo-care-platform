import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminServices } from "../../../src/firebase-admin.js";
import { applyCors } from "../../../src/http.js";
import { verifyWhatsAppProof, consumeWhatsAppProof, WhatsAppProofError } from "../../../src/whatsapp-proof.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res) === "handled") return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const authorization = req.headers.authorization ?? "";
  const idToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const proofSecret = process.env.OTP_PROOF_SECRET?.trim() ?? "";
  const services = getAdminServices();
  if (!services || proofSecret.length < 32) return res.status(503).json({ error: "The secure account-verification service is not configured." });
  if (!idToken) return res.status(401).json({ error: "Sign in before linking a verified WhatsApp number." });
  const proof = verifyWhatsAppProof(req.body?.proof, proofSecret);
  if (!proof) return res.status(422).json({ error: "The phone verification proof is invalid or expired. Request and verify a new code." });
  try {
    const identity = await services.auth.verifyIdToken(idToken, true);
    if (identity.email_verified !== true || !identity.email) return res.status(403).json({ error: "Verify the account email before linking WhatsApp." });
    const user = await services.auth.getUser(identity.uid);
    const phoneHash = await consumeWhatsAppProof(services.db, proof, proofSecret, identity.uid, identity.email);
    try {
      await services.auth.setCustomUserClaims(identity.uid, {
        ...(user.customClaims ?? {}),
        whatsapp_verified: true,
        whatsapp_number: proof.number,
      });
      await services.db.collection("phone_index").doc(phoneHash).update({ status: "active" });
    } catch {
      await services.db.collection("phone_index").doc(phoneHash).delete().catch(() => undefined);
      return res.status(503).json({ error: "The verified number could not be linked securely." });
    }
    return res.status(200).json({ linked: true });
  } catch (error) {
    if (error instanceof WhatsAppProofError) return res.status(409).json({ error: error.message });
    return res.status(401).json({ error: "The account or phone verification could not be confirmed." });
  }
}
