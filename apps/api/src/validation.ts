export type ValidationResult<T> = { ok: true; value: T } | { ok: false; message: string };

/** Accept a local Pakistani mobile (10 digits beginning 3) or its +92 E.164 form. */
export function normalizePakistaniMobile(input: unknown): ValidationResult<string> {
  if (typeof input !== "string") return { ok: false, message: "Enter a Pakistani mobile number." };
  const value = input.trim();
  const digits = value.replace(/[\s()-]/g, "");
  const local = digits.startsWith("+92") ? digits.slice(3) : digits;
  if (!/^3\d{9}$/.test(local)) {
    return { ok: false, message: "Enter 10 digits starting with 3; country code +92 is added automatically." };
  }
  return { ok: true, value: `+92${local}` };
}

export function validateOtp(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !/^\d{6}$/.test(input.trim())) {
    return { ok: false, message: "Enter the six-digit code from WhatsApp." };
  }
  return { ok: true, value: input.trim() };
}

export function validateBaseUrl(input: string): URL | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}
