import type { VercelRequest, VercelResponse } from "@vercel/node";
import { afterEach, describe, expect, it } from "vitest";
import { applyCors, readAllowedOrigins } from "../src/http.js";

function harness(method: string, origin?: string) {
  const state: { code: number; body: unknown; headers: Record<string, string>; ended: boolean } = {
    code: 200, body: null, headers: {}, ended: false,
  };
  const res = {
    status(code: number) { state.code = code; return res; },
    json(body: unknown) { state.body = body; return res; },
    setHeader(name: string, value: string) { state.headers[name] = value; return res; },
    end() { state.ended = true; return res; },
  } as unknown as VercelResponse;
  const req = { method, headers: origin ? { origin } : {}, socket: { remoteAddress: "127.0.0.1" } } as unknown as VercelRequest;
  return { req, res, state };
}

afterEach(() => { delete process.env.HOMIGO_ALLOWED_ORIGINS; });

describe("secure API origin configuration", () => {
  it("is not configured when absent or blank", () => {
    expect(readAllowedOrigins(undefined)).toEqual({ configured: false, origins: [] });
    expect(readAllowedOrigins(" ")).toEqual({ configured: false, origins: [] });
  });

  it("accepts exact HTTPS origins and explicit loopback development origins", () => {
    expect(readAllowedOrigins("https://care.example.test,https://admin.example.test")).toEqual({
      configured: true, origins: ["https://care.example.test", "https://admin.example.test"],
    });
    expect(readAllowedOrigins("http://localhost:5173").configured).toBe(true);
  });

  it("rejects malformed, wildcard, credentialed, path, and non-loopback HTTP values", () => {
    for (const value of ["*", "https://care.example.test/path", "https://user:pass@care.example.test", "http://care.example.test", "https://care.example.test,"]) {
      expect(readAllowedOrigins(value).configured, value).toBe(false);
    }
  });

  it("rejects HTTP loopback origins in production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      expect(readAllowedOrigins("http://localhost:5173").configured).toBe(false);
      expect(readAllowedOrigins("https://care.example.test").configured).toBe(true);
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous;
    }
  });

  it("fails closed for browser requests when configuration is missing or origin is not allowed", () => {
    const missing = harness("POST", "https://care.example.test");
    expect(applyCors(missing.req, missing.res)).toBe("handled");
    expect(missing.state.code).toBe(503);
    process.env.HOMIGO_ALLOWED_ORIGINS = "https://care.example.test";
    const rejected = harness("POST", "https://attacker.example.test");
    expect(applyCors(rejected.req, rejected.res)).toBe("handled");
    expect(rejected.state.code).toBe(403);
    const accepted = harness("POST", "https://care.example.test");
    expect(applyCors(accepted.req, accepted.res)).toBe("continue");
    expect(accepted.state.headers["Access-Control-Allow-Origin"]).toBe("https://care.example.test");
  });

  it("continues to allow native requests without an Origin header", () => {
    delete process.env.HOMIGO_ALLOWED_ORIGINS;
    const native = harness("POST");
    expect(applyCors(native.req, native.res)).toBe("continue");
  });
});
