import { validateBaseUrl } from "./validation.js";

export type GatewayConfig = { baseUrl: string; apiKey: string };
export type GatewayResult = { ok: true } | { ok: false; reason: "configuration" | "upstream" | "unrecognized" };
type FetchLike = typeof fetch;

export function readGatewayConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig | null {
  const baseUrl = env.WHATSAPP_GATEWAY_BASE_URL?.trim() ?? "";
  const apiKey = env.WHATSAPP_GATEWAY_API_KEY?.trim() ?? "";
  if (!baseUrl || !apiKey || !validateBaseUrl(baseUrl)) return null;
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

async function post(config: GatewayConfig, path: string, payload: object, fetcher: FetchLike): Promise<Response | null> {
  const base = validateBaseUrl(config.baseUrl);
  if (!base || !config.apiKey.trim()) return null;
  try {
    return await fetcher(`${config.baseUrl.replace(/\/+$/, "")}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": config.apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
  } catch {
    return null;
  }
}

export async function sendOtp(config: GatewayConfig, number: string, fetcher: FetchLike = fetch): Promise<GatewayResult> {
  const response = await post(config, "/api/v1/send-otp", { number: number.replace(/^\+/, "") }, fetcher);
  return response?.ok ? { ok: true } : { ok: false, reason: response ? "upstream" : "configuration" };
}

function isExplicitVerified(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const data = body as Record<string, unknown>;
  if (data.verified === true || data.valid === true || data.success === true) return true;
  return typeof data.status === "string" && ["verified", "valid", "success"].includes(data.status.toLowerCase());
}

export async function verifyOtp(config: GatewayConfig, number: string, otp: string, fetcher: FetchLike = fetch): Promise<GatewayResult> {
  const response = await post(config, "/api/v1/verify-otp", { number: number.replace(/^\+/, ""), otp }, fetcher);
  if (!response) return { ok: false, reason: "configuration" };
  if (!response.ok) return { ok: false, reason: "upstream" };
  let body: unknown;
  try { body = await response.json(); } catch { return { ok: false, reason: "unrecognized" }; }
  return isExplicitVerified(body) ? { ok: true } : { ok: false, reason: "unrecognized" };
}
