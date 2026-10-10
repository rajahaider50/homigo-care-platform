import { describe, expect, it } from "vitest";
import { normalizePakistaniMobile, validateBaseUrl, validateOtp } from "../src/validation.js";

describe("normalizePakistaniMobile", () => {
  it("locks the country code and normalizes a 10-digit local mobile", () => {
    expect(normalizePakistaniMobile("3495031007")).toEqual({ ok: true, value: "+923495031007" });
    expect(normalizePakistaniMobile("+92 349 5031007")).toEqual({ ok: true, value: "+923495031007" });
  });
  it("rejects landlines, leading-zero forms, and wrong lengths", () => {
    for (const value of ["0212345678", "03495031007", "349503100", "+9234950310070", "abc"]) {
      expect(normalizePakistaniMobile(value).ok).toBe(false);
    }
  });
});

describe("validateOtp", () => {
  it("accepts only a six-digit code", () => {
    expect(validateOtp("123456")).toEqual({ ok: true, value: "123456" });
    for (const value of ["12345", "1234567", "12a456", ""]) expect(validateOtp(value).ok).toBe(false);
  });
});

describe("validateBaseUrl", () => {
  it("requires HTTPS outside local development and rejects embedded credentials", () => {
    expect(validateBaseUrl("https://gateway.example.test")).not.toBeNull();
    expect(validateBaseUrl("http://gateway.example.test")).toBeNull();
    expect(validateBaseUrl("https://user:pass@gateway.example.test")).toBeNull();
    expect(validateBaseUrl("http://localhost:3000")).not.toBeNull();
  });
});
