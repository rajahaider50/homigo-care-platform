import { createHmac } from "node:crypto";
import type { Firestore } from "firebase-admin/firestore";
import { Timestamp } from "./firebase-admin.js";

export type LimitedAction = "send" | "verify" | "phone-login";
export class RateLimitError extends Error {
  constructor(public readonly retryAfterSeconds: number) {
    super("Too many attempts. Wait before trying again.");
  }
}

type CounterRecord = { count?: unknown; windowStartMs?: unknown; lastAttemptMs?: unknown };
type BucketSpec = { scope: string; value: string; max: number; windowMs: number; cooldownMs?: number };
type BucketDecision = { allowed: true; count: number; windowStartMs: number; lastAttemptMs: number } | { allowed: false; retryAfterSeconds: number };

/** Pure window evaluator, exposed so limit/cooldown boundaries remain unit-testable. */
export function evaluateRateLimitBucket(previous: CounterRecord, spec: Pick<BucketSpec, "max" | "windowMs" | "cooldownMs">, nowMs: number): BucketDecision {
  const storedStart = typeof previous.windowStartMs === "number" ? previous.windowStartMs : 0;
  const activeWindow = storedStart > 0 && nowMs >= storedStart && nowMs - storedStart < spec.windowMs;
  const windowStartMs = activeWindow ? storedStart : nowMs;
  const count = activeWindow && typeof previous.count === "number" ? previous.count : 0;
  const lastAttemptMs = activeWindow && typeof previous.lastAttemptMs === "number" ? previous.lastAttemptMs : 0;
  const cooldownRemaining = spec.cooldownMs && lastAttemptMs > 0 ? spec.cooldownMs - (nowMs - lastAttemptMs) : 0;
  if (cooldownRemaining > 0) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(cooldownRemaining / 1000)) };
  if (count >= spec.max) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((windowStartMs + spec.windowMs - nowMs) / 1000)) };
  return { allowed: true, count: count + 1, windowStartMs, lastAttemptMs: nowMs };
}

function keyFor(scope: string, value: string, secret: string): string {
  return createHmac("sha256", secret).update(`rate:${scope}:${value}`).digest("hex");
}

function bucketSpecs(action: LimitedAction, number: string, ip: string): BucketSpec[] {
  if (action === "send") return [
    { scope: "send-phone", value: number, max: 3, windowMs: 60 * 60_000, cooldownMs: 60_000 },
    { scope: "send-ip", value: ip, max: 15, windowMs: 60 * 60_000 },
  ];
  if (action === "verify") return [
    { scope: "verify-phone", value: number, max: 5, windowMs: 60 * 60_000 },
    { scope: "verify-ip", value: ip, max: 30, windowMs: 60 * 60_000 },
  ];
  return [
    { scope: "login-phone", value: number, max: 5, windowMs: 15 * 60_000 },
    { scope: "login-ip", value: ip, max: 20, windowMs: 15 * 60_000 },
  ];
}

/** Atomic, cross-instance limiter; raw phone numbers and IP addresses are never persisted. */
export async function enforceRateLimit(
  db: Firestore,
  input: { action: LimitedAction; number: string; ip: string; secret: string; nowMs?: number },
): Promise<void> {
  if (Buffer.byteLength(input.secret, "utf8") < 32) throw new Error("Rate-limit signing secret is not configured.");
  const nowMs = input.nowMs ?? Date.now();
  const specs = bucketSpecs(input.action, input.number, input.ip.slice(0, 128) || "unknown");
  const refs = specs.map((spec) => db.collection("otp_attempts").doc(keyFor(spec.scope, spec.value, input.secret)));

  await db.runTransaction(async (transaction) => {
    const snapshots = [];
    for (const ref of refs) snapshots.push(await transaction.get(ref));
    const decisions = snapshots.map((snapshot, index) => evaluateRateLimitBucket(snapshot.data() ?? {}, specs[index]!, nowMs));
    const blocked = decisions.find((decision) => !decision.allowed);
    if (blocked && !blocked.allowed) throw new RateLimitError(blocked.retryAfterSeconds);

    decisions.forEach((decision, index) => {
      if (!decision.allowed) return;
      const spec = specs[index]!;
      const ref = refs[index]!;
      transaction.set(ref, {
        count: decision.count,
        windowStartMs: decision.windowStartMs,
        lastAttemptMs: decision.lastAttemptMs,
        expiresAt: Timestamp.fromMillis(decision.windowStartMs + spec.windowMs * 2),
      }, { merge: true });
    });
  });
}
