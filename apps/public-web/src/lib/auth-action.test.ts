import { describe, expect, it } from "vitest";
import { parseAuthAction } from "./auth-action";

describe("parseAuthAction", () => {
  it("accepts a Firebase verification link without exposing other URL state", () => {
    expect(parseAuthAction("?mode=verifyEmail&oobCode=one-time-code&lang=en")).toEqual({
      kind: "action",
      mode: "verifyEmail",
      code: "one-time-code",
      continueUrl: null,
      language: "en",
    });
  });

  it("accepts password-reset action links", () => {
    expect(parseAuthAction("?mode=resetPassword&oobCode=reset-code")).toMatchObject({
      kind: "action",
      mode: "resetPassword",
      code: "reset-code",
    });
  });

  it("rejects a missing or unsupported action mode", () => {
    expect(parseAuthAction("?oobCode=code")).toEqual({ kind: "missing-mode" });
    expect(parseAuthAction("?mode=deleteAccount&oobCode=code")).toEqual({
      kind: "unsupported-mode",
      mode: "deleteAccount",
    });
  });

  it("rejects absent and oversized one-time codes", () => {
    expect(parseAuthAction("?mode=verifyEmail")).toEqual({ kind: "missing-code", mode: "verifyEmail" });
    expect(parseAuthAction(`?mode=verifyEmail&oobCode=${"x".repeat(4097)}`)).toEqual({
      kind: "missing-code",
      mode: "verifyEmail",
    });
  });
});
