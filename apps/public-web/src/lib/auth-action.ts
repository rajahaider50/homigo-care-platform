export type FirebaseActionMode = "verifyEmail" | "resetPassword" | "recoverEmail";

export type ParsedAuthAction =
  | { kind: "action"; mode: FirebaseActionMode; code: string; continueUrl: string | null; language: string | null }
  | { kind: "missing-mode" }
  | { kind: "missing-code"; mode: FirebaseActionMode }
  | { kind: "unsupported-mode"; mode: string };

const supportedModes = new Set<string>(["verifyEmail", "resetPassword", "recoverEmail"]);

export function parseAuthAction(search: string): ParsedAuthAction {
  const params = new URLSearchParams(search);
  const mode = params.get("mode");
  const code = params.get("oobCode");

  if (!mode) return { kind: "missing-mode" };
  if (!supportedModes.has(mode)) return { kind: "unsupported-mode", mode };
  if (!code || code.length > 4096) {
    return { kind: "missing-code", mode: mode as FirebaseActionMode };
  }

  return {
    kind: "action",
    mode: mode as FirebaseActionMode,
    code,
    continueUrl: params.get("continueUrl"),
    language: params.get("lang"),
  };
}
