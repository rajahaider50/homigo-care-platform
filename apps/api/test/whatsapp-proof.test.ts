import { describe, expect, it } from "vitest";
import { signWhatsAppProof, verifyWhatsAppProof } from "../src/whatsapp-proof.js";

const secret = "test-only-proof-signing-key-which-is-not-a-production-secret";
const now = 1_800_000_000;

describe("WhatsApp verification proof", () => {
  it("signs and verifies a short-lived phone-bound proof", () => {
    const issued = signWhatsAppProof("+923495031007", secret, now, 600);
    expect(issued).not.toBeNull();
    expect(verifyWhatsAppProof(issued?.token, secret, now + 1)).toMatchObject({ number: "+923495031007", exp: now + 600 });
  });

  it("rejects expired, tampered, malformed, and weak-secret proofs", () => {
    const issued = signWhatsAppProof("+923495031007", secret, now, 60);
    expect(verifyWhatsAppProof(issued?.token, secret, now + 60)).toBeNull();
    expect(verifyWhatsAppProof(`${issued?.token}x`, secret, now + 1)).toBeNull();
    expect(verifyWhatsAppProof(issued?.token, "short", now + 1)).toBeNull();
    expect(signWhatsAppProof("03495031007", secret, now)).toBeNull();
  });
});
