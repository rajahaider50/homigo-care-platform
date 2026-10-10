import { describe, expect, it } from "vitest";
import { evaluateRateLimitBucket } from "../src/rate-limit.js";

describe("privacy-safe rate-limit window evaluation", () => {
  it("allows a first attempt and increments its counter", () => {
    expect(evaluateRateLimitBucket({}, { max: 3, windowMs: 3_600_000, cooldownMs: 60_000 }, 100_000)).toEqual({
      allowed: true, count: 1, windowStartMs: 100_000, lastAttemptMs: 100_000,
    });
  });

  it("enforces the 60-second send cooldown", () => {
    const decision = evaluateRateLimitBucket(
      { count: 1, windowStartMs: 100_000, lastAttemptMs: 100_000 },
      { max: 3, windowMs: 3_600_000, cooldownMs: 60_000 },
      159_500,
    );
    expect(decision).toEqual({ allowed: false, retryAfterSeconds: 1 });
  });

  it("blocks after the configured count and reports window retry time", () => {
    const decision = evaluateRateLimitBucket(
      { count: 5, windowStartMs: 100_000, lastAttemptMs: 150_000 },
      { max: 5, windowMs: 900_000 },
      200_000,
    );
    expect(decision).toEqual({ allowed: false, retryAfterSeconds: 800 });
  });

  it("starts a new window after expiry instead of carrying an old count forward", () => {
    expect(evaluateRateLimitBucket(
      { count: 5, windowStartMs: 100_000, lastAttemptMs: 200_000 },
      { max: 5, windowMs: 900_000 },
      1_000_000,
    )).toEqual({ allowed: true, count: 1, windowStartMs: 1_000_000, lastAttemptMs: 1_000_000 });
  });
});
