import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdminServices } from "../../../src/firebase-admin.js";
import { applyCors } from "../../../src/http.js";
import { consumeWhatsAppProof, verifyWhatsAppProof } from "../../../src/whatsapp-proof.js";

function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.trim().length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (applyCors(req, res) === "handled") return;
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed." });
  const proofSecret = process.env.OTP_PROOF_SECRET?.trim() ?? "";
  const services = getAdminServices();
  if (!services || proofSecret.length < 32) return res.status(503).json({ error: "Secure account registration is not configured." });

  const proof = verifyWhatsAppProof(req.body?.proof, proofSecret);
  if (!proof) return res.status(422).json({ error: "Verify your WhatsApp code again before creating an account." });
  const email = validEmail(req.body?.email) ? req.body.email.trim().toLowerCase() : "";
  const displayName = typeof req.body?.displayName === "string" ? req.body.displayName.trim() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const role = req.body?.role;
  if (!email) return res.status(400).json({ error: "Enter a valid email address." });
  if (displayName.length < 2 || displayName.length > 80) return res.status(400).json({ error: "Enter a name between 2 and 80 characters." });
  if (password.length < 8 || password.length > 128) return res.status(400).json({ error: "Choose a password between 8 and 128 characters." });
  if (role !== "patient" && role !== "professional") return res.status(400).json({ error: "Choose a supported account type." });

  let uid: string | null = null;
  let phoneHash: string | null = null;
  try {
    const user = await services.auth.createUser({ email, password, displayName, emailVerified: false, disabled: false });
    uid = user.uid;
    phoneHash = await consumeWhatsAppProof(services.db, proof, proofSecret, user.uid, email);
    await services.auth.setCustomUserClaims(user.uid, {
      ...(user.customClaims ?? {}),
      whatsapp_verified: true,
      whatsapp_number: proof.number,
      account_role: role,
    });
    await services.db.collection("phone_index").doc(phoneHash).update({ accountRole: role, status: "active" });
    return res.status(201).json({ created: true, uid: user.uid, role });
  } catch {
    if (phoneHash) await services.db.collection("phone_index").doc(phoneHash).delete().catch(() => undefined);
    if (uid) await services.auth.deleteUser(uid).catch(() => undefined);
    return res.status(409).json({ error: "The account could not be created. The email or WhatsApp number may already be linked; no duplicate account was kept." });
  }
}
