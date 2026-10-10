import { describe, expect, it } from "vitest";
import { hasVerifiedAdminClaim } from "./admin-access";

describe("hasVerifiedAdminClaim", () => {
  it("accepts only a verified user with a boolean true Admin claim", () => {
    expect(hasVerifiedAdminClaim(true, true)).toBe(true);
  });

  it("rejects an unverified user even when an Admin claim is present", () => {
    expect(hasVerifiedAdminClaim(false, true)).toBe(false);
  });

  it("rejects a missing, false or string-valued claim", () => {
    expect(hasVerifiedAdminClaim(true, undefined)).toBe(false);
    expect(hasVerifiedAdminClaim(true, false)).toBe(false);
    expect(hasVerifiedAdminClaim(true, "true")).toBe(false);
  });
});
