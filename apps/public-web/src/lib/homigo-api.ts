import { getIdToken, type User } from "firebase/auth";

export type OtpProof = { proof: string; number: string };
type ApiMessage = { error?: unknown; sent?: unknown; verified?: unknown; proof?: unknown; number?: unknown; created?: unknown; linked?: unknown; uid?: unknown; role?: unknown; signedIn?: unknown; customToken?: unknown };
const DEFAULT_HOMIGO_API_BASE_URL = "https://homigo-care-api-rajahaider50.vercel.app";

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_HOMIGO_API_BASE_URL?.trim() || DEFAULT_HOMIGO_API_BASE_URL;
  return `${base.replace(/\/+$/, "")}/api/${path.replace(/^\/+/, "")}`;
}

async function post(path: string, payload: object, idToken?: string): Promise<ApiMessage> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "content-type": "application/json", ...(idToken ? { authorization: `Bearer ${idToken}` } : {}) },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    throw new Error("The HomiGo verification service could not be reached. Check the connection and try again.");
  }
  let body: ApiMessage = {};
  try { body = await response.json() as ApiMessage; } catch { /* handled as a generic service error */ }
  if (!response.ok) {
    const message = typeof body.error === "string" ? body.error : "The secure HomiGo service did not complete this request.";
    throw new Error(message);
  }
  return body;
}

export async function requestWhatsAppOtp(number: string): Promise<void> {
  const result = await post("v1/send-otp", { number });
  if (result.sent !== true) throw new Error("The WhatsApp code was not confirmed as sent.");
}

export async function verifyWhatsAppOtp(number: string, otp: string): Promise<OtpProof> {
  const result = await post("v1/verify-otp", { number, otp });
  if (result.verified !== true || typeof result.proof !== "string" || typeof result.number !== "string") {
    throw new Error("The server did not return a secure, usable phone-verification proof.");
  }
  return { proof: result.proof, number: result.number };
}

export async function registerVerifiedAccount(input: {
  proof: string;
  displayName: string;
  email: string;
  password: string;
  role: "patient" | "professional";
}): Promise<string> {
  const result = await post("v1/auth/register", input);
  if (result.created !== true || typeof result.uid !== "string") throw new Error("The server did not confirm account creation.");
  return result.uid;
}

export async function signInWithPhonePassword(number: string, password: string): Promise<string> {
  const result = await post("v1/auth/sign-in-phone", { number, password });
  if (result.signedIn !== true || typeof result.customToken !== "string") {
    throw new Error("The secure service did not confirm phone sign-in.");
  }
  return result.customToken;
}

export async function linkVerifiedWhatsApp(user: User, proof: string): Promise<void> {
  const idToken = await getIdToken(user, true);
  const result = await post("v1/auth/claim-whatsapp", { proof }, idToken);
  if (result.linked !== true) throw new Error("The server did not confirm WhatsApp verification.");
  await getIdToken(user, true);
}
