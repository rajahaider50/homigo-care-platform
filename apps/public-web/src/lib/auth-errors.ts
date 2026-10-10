export function friendlyAuthError(error: unknown): string {
  const code = typeof error === "object" && error !== null && "code" in error
    ? String(error.code)
    : "";

  switch (code) {
    case "auth/email-already-in-use": return "An account already uses this email. Sign in instead.";
    case "auth/invalid-email": return "Enter a valid email address.";
    case "auth/weak-password": return "Choose a stronger password and try again.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "The email or password could not be verified.";
    case "auth/too-many-requests": return "Too many attempts. Wait a little and try again.";
    case "auth/popup-closed-by-user": return "The Google sign-in window was closed before completion.";
    case "auth/popup-blocked": return "Your browser blocked the Google sign-in window. Allow pop-ups and retry.";
    case "auth/network-request-failed": return "A network problem interrupted the request. Check your connection and retry.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code": return "This email link is invalid or has expired. Request a new one.";
    default: return "The request could not be completed. Please retry in a moment.";
  }
}
