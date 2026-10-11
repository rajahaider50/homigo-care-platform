import type { VercelRequest, VercelResponse } from "@vercel/node";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAdminServices: vi.fn(),
  applyCors: vi.fn(),
  getRequestIp: vi.fn(),
  enforceRateLimit: vi.fn(),
}));

vi.mock("../src/firebase-admin.js", () => ({ getAdminServices: mocks.getAdminServices }));
vi.mock("../src/http.js", () => ({ applyCors: mocks.applyCors, getRequestIp: mocks.getRequestIp }));
vi.mock("../src/rate-limit.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/rate-limit.js")>();
  return { ...actual, enforceRateLimit: mocks.enforceRateLimit };
});

import handler from "../api/v1/auth/sign-in-phone.js";
import { RateLimitError } from "../src/rate-limit.js";

function responseHarness() {
  const state: { code: number; body: unknown; headers: Record<string, string> } = { code: 200, body: null, headers: {} };
  const res = {
    status(code: number) { state.code = code; return res; },
    json(body: unknown) { state.body = body; return res; },
    setHeader(name: string, value: string) { state.headers[name] = value; return res; },
  } as unknown as VercelResponse;
  return { res, state };
}

function request(body: unknown): VercelRequest {
  return { method: "POST", headers: {}, body, socket: { remoteAddress: "127.0.0.1" } } as unknown as VercelRequest;
}

function configureAccount() {
  const account = { uid: "uid-test", email: "demo@example.test", status: "active", accountRole: "patient" };
  const db = { collection: vi.fn(() => ({ doc: vi.fn(() => ({ get: vi.fn(async () => ({ exists: true, data: () => account })) })) })) };
  const auth = {
    verifyIdToken: vi.fn(async () => ({ uid: account.uid, email_verified: true })),
    getUser: vi.fn(async () => ({ customClaims: { whatsapp_verified: true, whatsapp_number: "+923495031007", account_role: "patient" } })),
    createCustomToken: vi.fn(async () => "firebase-custom-token"),
  };
  mocks.getAdminServices.mockReturnValue({ db, auth });
  return { db, auth };
}

describe("POST /api/v1/auth/sign-in-phone", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OTP_PROOF_SECRET = "x".repeat(48);
    process.env.FIREBASE_WEB_API_KEY = "public-test-key";
    mocks.applyCors.mockReturnValue("continue");
    mocks.getRequestIp.mockReturnValue("203.0.113.4");
    mocks.enforceRateLimit.mockResolvedValue(undefined);
    configureAccount();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verifies credentials with Identity Toolkit and returns only a custom token", async () => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({ idToken: "upstream-id-token", localId: "uid-test" }), { status: 200 }));
    vi.stubGlobal("fetch", upstream);
    const { res, state } = responseHarness();

    await handler(request({ number: "3495031007", password: "synthetic-password" }), res);

    expect(state.code).toBe(200);
    expect(state.body).toEqual({ signedIn: true, customToken: "firebase-custom-token" });
    expect(JSON.stringify(state.body)).not.toContain("synthetic-password");
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ action: "phone-login", number: "+923495031007" }));
    const [url, init] = upstream.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("accounts:signInWithPassword");
    expect(JSON.parse(String(init.body))).toEqual({ email: "demo@example.test", password: "synthetic-password", returnSecureToken: true });
  });

  it("returns a generic failure for invalid Firebase credentials", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: { message: "INVALID_LOGIN_CREDENTIALS" } }), { status: 400 })));
    const { res, state } = responseHarness();

    await handler(request({ number: "3495031007", password: "wrong-password" }), res);

    expect(state.code).toBe(401);
    expect((state.body as { error: string }).error).toMatch(/incorrect/);
    expect((state.body as { error: string }).error).not.toContain("INVALID_LOGIN_CREDENTIALS");
  });

  it("returns retry metadata when the account/IP limit is reached", async () => {
    mocks.enforceRateLimit.mockRejectedValue(new RateLimitError(120));
    const { res, state } = responseHarness();

    await handler(request({ number: "3495031007", password: "synthetic-password" }), res);

    expect(state.code).toBe(429);
    expect(state.headers["Retry-After"]).toBe("120");
  });
});
