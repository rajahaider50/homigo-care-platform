import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { FieldValue, Timestamp } from "./firebase-admin.js";

export type WhatsAppProofClaims = { v: 1; jti: string; number: string; iat: number; exp: number };
export class WhatsAppProofError extends Error {}

function base64url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function signature(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

function validSecret(secret: string): boolean {
  return Buffer.byteLength(secret, "utf8") >= 32;
}

export function signWhatsAppProof(number: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000), ttlSeconds = 600): { token: string; claims: WhatsAppProofClaims } | null {
  if (!validSecret(secret) || ttlSeconds < 60 || ttlSeconds > 900 || !/^\+923\d{9}$/.test(number)) return null;
  const claims: WhatsAppProofClaims = { v: 1, jti: randomUUID(), number, iat: nowSeconds, exp: nowSeconds + ttlSeconds };
  const payload = base64url(JSON.stringify(claims));
  return { token: `${payload}.${signature(payload, secret).toString("base64url")}`, claims };
}

export function verifyWhatsAppProof(token: unknown, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): WhatsAppProofClaims | null {
  if (typeof token !== "string" || !validSecret(secret)) return null;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  let supplied: Buffer;
  let claims: WhatsAppProofClaims;
  try {
    supplied = Buffer.from(parts[1], "base64url");
    claims = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8")) as WhatsAppProofClaims;
  } catch {
    return null;
  }
  const expected = signature(parts[0], secret);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;
  if (claims.v !== 1 || typeof claims.jti !== "string" || !/^\+923\d{9}$/.test(claims.number)) return null;
  if (!Number.isInteger(claims.iat) || !Number.isInteger(claims.exp) || claims.iat > nowSeconds + 60 || claims.exp <= nowSeconds || claims.exp - claims.iat > 900) return null;
  return claims;
}

export function phoneIndexId(number: string, secret: string): string {
  return createHmac("sha256", secret).update(`phone:${number}`).digest("hex");
}

export async function issueWhatsAppProof(db: Firestore, number: string, secret: string, nowSeconds = Math.floor(Date.now() / 1000)) {
  const issued = signWhatsAppProof(number, secret, nowSeconds);
  if (!issued) return null;
  await db.collection("whatsapp_proofs").doc(issued.claims.jti).create({
    phoneHash: phoneIndexId(number, secret),
    status: "issued",
    expiresAt: Timestamp.fromMillis(issued.claims.exp * 1000),
    createdAt: FieldValue.serverTimestamp(),
  });
  return issued;
}

/** Atomically consumes one proof and reserves the phone mapping; callers set Auth claims afterward. */
export async function consumeWhatsAppProof(db: Firestore, claims: WhatsAppProofClaims, secret: string, uid: string, email: string): Promise<string> {
  const proofRef = db.collection("whatsapp_proofs").doc(claims.jti);
  const phoneHash = phoneIndexId(claims.number, secret);
  const phoneRef = db.collection("phone_index").doc(phoneHash);
  await db.runTransaction(async (transaction) => {
    const proofSnapshot = await transaction.get(proofRef);
    const phoneSnapshot = await transaction.get(phoneRef);
    const proof = proofSnapshot.data();
    if (!proofSnapshot.exists || proof?.status !== "issued" || proof.phoneHash !== phoneHash || !(proof.expiresAt instanceof Timestamp) || proof.expiresAt.toMillis() <= Date.now()) {
      throw new WhatsAppProofError("The phone verification proof is expired, invalid, or already used.");
    }
    if (phoneSnapshot.exists && phoneSnapshot.data()?.uid !== uid) {
      throw new WhatsAppProofError("This WhatsApp number is already linked to another HomiGo account.");
    }
    transaction.update(proofRef, { status: "consumed", uid, consumedAt: FieldValue.serverTimestamp() });
    transaction.set(phoneRef, { uid, email: email.toLowerCase(), status: "active", createdAt: FieldValue.serverTimestamp() });
  });
  return phoneHash;
}
