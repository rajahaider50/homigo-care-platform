import { describe, expect, it, vi } from "vitest";
import { readGatewayConfig, sendOtp, verifyOtp } from "../src/gateway.js";

const config = { baseUrl: "https://gateway.example.test", apiKey: "server-only-test-key" };

describe("gateway relay", () => {
  it("posts the exact send payload and key header to the documented route", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 202 }));
    expect(await sendOtp(config, "+923495031007", fetcher as typeof fetch)).toEqual({ ok: true });
    expect(fetcher).toHaveBeenCalledWith("https://gateway.example.test/api/v1/send-otp", expect.objectContaining({
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": "server-only-test-key" },
      body: JSON.stringify({ number: "923495031007" }),
    }));
  });

  it("verifies only an explicit success response and fails closed for unknown bodies", async () => {
    const good = vi.fn(async () => Response.json({ verified: true }));
    const bad = vi.fn(async () => Response.json({ message: "ok" }));
    expect(await verifyOtp(config, "+923495031007", "123456", good as typeof fetch)).toEqual({ ok: true });
    expect(good).toHaveBeenCalledWith("https://gateway.example.test/api/v1/verify-otp", expect.objectContaining({
      body: JSON.stringify({ number: "923495031007", otp: "123456" }),
    }));
    expect(await verifyOtp(config, "+923495031007", "123456", bad as typeof fetch)).toEqual({ ok: false, reason: "unrecognized" });
  });

  it("does not leak upstream status bodies and reports failed sends", async () => {
    const fetcher = vi.fn(async () => new Response("private upstream detail", { status: 500 }));
    expect(await sendOtp(config, "+923495031007", fetcher as typeof fetch)).toEqual({ ok: false, reason: "upstream" });
  });

  it("reads no configuration when the URL or key is absent or unsafe", () => {
    expect(readGatewayConfig({ WHATSAPP_GATEWAY_BASE_URL: "https://gateway.example.test" } as NodeJS.ProcessEnv)).toBeNull();
    expect(readGatewayConfig({ WHATSAPP_GATEWAY_BASE_URL: "http://gateway.example.test", WHATSAPP_GATEWAY_API_KEY: "x" } as NodeJS.ProcessEnv)).toBeNull();
    expect(readGatewayConfig({ WHATSAPP_GATEWAY_BASE_URL: "https://gateway.example.test", WHATSAPP_GATEWAY_API_KEY: "x" } as NodeJS.ProcessEnv)).toEqual({ baseUrl: "https://gateway.example.test", apiKey: "x" });
  });
});
