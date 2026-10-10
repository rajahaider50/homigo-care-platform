import { useMemo, useState, type FormEvent } from "react";
import { applyActionCode, confirmPasswordReset, getIdToken, reload, verifyPasswordResetCode } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandIcon } from "../components/BrandIcon";
import { auth, firebaseConfigured } from "../firebase";
import { parseAuthAction } from "../lib/auth-action";
import { friendlyAuthError } from "../lib/auth-errors";
import { ensureVerifiedPatientProfile } from "../lib/profile";

export function AuthActionPage() {
  const { user } = useAuth();
  const { search } = useLocation();
  const navigate = useNavigate();
  const parsed = useMemo(() => parseAuthAction(search), [search]);
  const urlState = useMemo(() => new URLSearchParams(search).get("status"), [search]);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"ready" | "reset-form" | "success" | "error">("ready");
  const [message, setMessage] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function clearActionUrl(status: string) {
    navigate(`/auth/action?status=${encodeURIComponent(status)}`, { replace: true });
  }

  async function applyEmailAction() {
    if (!auth || parsed.kind !== "action" || (parsed.mode !== "verifyEmail" && parsed.mode !== "recoverEmail")) return;
    setBusy(true);
    setMessage("");
    try {
      await applyActionCode(auth, parsed.code);
      let text = parsed.mode === "verifyEmail" ? "Your email address has been verified." : "Your email address has been restored.";
      if (parsed.mode === "verifyEmail" && auth.currentUser) {
        try {
          await reload(auth.currentUser);
          await getIdToken(auth.currentUser, true);
          if (auth.currentUser.emailVerified) {
            await ensureVerifiedPatientProfile(auth.currentUser);
            text += " Your patient profile is ready.";
          }
        } catch {
          text += " Sign in to finish setting up your patient profile.";
        }
      } else if (parsed.mode === "verifyEmail") {
        text += " Sign in to finish setting up your patient profile.";
      }
      setMessage(text);
      setPhase("success");
      clearActionUrl(parsed.mode === "verifyEmail" ? "verified" : "email-restored");
    } catch (error) {
      setMessage(friendlyAuthError(error));
      setPhase("error");
      clearActionUrl("invalid");
    } finally {
      setBusy(false);
    }
  }

  async function beginPasswordReset() {
    if (!auth || parsed.kind !== "action" || parsed.mode !== "resetPassword") return;
    setBusy(true);
    setMessage("");
    try {
      const accountEmail = await verifyPasswordResetCode(auth, parsed.code);
      setResetCode(parsed.code);
      setResetEmail(accountEmail);
      setPhase("reset-form");
      clearActionUrl("reset");
    } catch (error) {
      setMessage(friendlyAuthError(error));
      setPhase("error");
      clearActionUrl("invalid");
    } finally {
      setBusy(false);
    }
  }

  async function completePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth || !resetCode) return;
    if (password.length < 8) {
      setMessage("Choose a password with at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      await confirmPasswordReset(auth, resetCode, password);
      setResetCode("");
      setPassword("");
      setConfirmPassword("");
      setMessage("Your password has been updated. You can now sign in with the new password.");
      setPhase("success");
      clearActionUrl("reset-complete");
    } catch (error) {
      setMessage(friendlyAuthError(error));
      setPhase("error");
      setResetCode("");
      clearActionUrl("invalid");
    } finally {
      setBusy(false);
    }
  }

  if (!firebaseConfigured || !auth) {
    return <section className="auth-page"><div className="auth-card"><BrandIcon name="lock" size={30} /><h1>Secure action unavailable</h1><p>Firebase is not configured in this website build.</p><Link className="button button-primary" to="/">Back to HomiGo Care</Link></div></section>;
  }

  if (phase === "reset-form") {
    return (
      <section className="auth-page"><div className="auth-card">
        <div className="auth-card-icon"><BrandIcon name="refresh" size={28} /></div>
        <p className="eyebrow">PASSWORD RECOVERY</p><h1>Choose a new password</h1>
        <p className="account-email">{resetEmail}</p>
        {message && <p className="notice notice-error" role="alert">{message}</p>}
        <form className="auth-form" onSubmit={completePasswordReset}>
          <label><span>New password</span><input autoComplete="new-password" minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
          <label><span>Confirm new password</span><input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} /></label>
          <button className="button button-primary button-full" disabled={busy} type="submit">{busy ? "Updating…" : "Update password"}</button>
        </form>
        <p className="privacy-note">The one-time code is held only for this page session and is removed from the address bar after validation.</p>
      </div></section>
    );
  }

  const completed = phase === "success" || urlState === "verified" || urlState === "email-restored" || urlState === "reset-complete";
  if (completed) {
    const text = message || (urlState === "reset-complete"
      ? "Your password has been updated. You can now sign in."
      : urlState === "email-restored"
        ? "Your email address has been restored."
        : "Your email address has been verified. Sign in to continue.");
    return <section className="auth-page"><div className="auth-card action-card">
      <div className="auth-card-icon success-icon"><BrandIcon name="check-circle" size={30} /></div>
      <p className="eyebrow">SECURE ACTION COMPLETE</p><h1>All set</h1>
      <p className="notice notice-success" role="status">{text}</p>
      <Link className="button button-primary" to="/auth">Continue to sign in</Link>
    </div></section>;
  }

  if (phase === "error" || urlState === "invalid") {
    return <section className="auth-page"><div className="auth-card action-card">
      <div className="auth-card-icon error-icon"><BrandIcon name="alert-triangle" size={28} /></div>
      <p className="eyebrow">SECURE ACTION NOT COMPLETED</p><h1>That link did not work</h1>
      <p className="notice notice-error" role="alert">{message || "This Firebase link may be invalid or expired. Request a new email and use its latest link."}</p>
      <Link className="button button-primary" to="/auth">Return to sign in</Link>
    </div></section>;
  }

  if (urlState === "reset") {
    return <section className="auth-page"><div className="auth-card action-card">
      <div className="auth-card-icon"><BrandIcon name="lock" size={28} /></div>
      <p className="eyebrow">PASSWORD RECOVERY</p><h1>Continue from your email</h1>
      <p>The one-time link was already validated in another page session. Open the email link again or request a new password-reset email.</p>
      <Link className="button button-primary" to="/auth/reset">Request another reset email</Link>
    </div></section>;
  }

  if (parsed.kind === "action" && parsed.mode === "resetPassword") {
    return <section className="auth-page"><div className="auth-card action-card">
      <div className="auth-card-icon"><BrandIcon name="lock" size={28} /></div>
      <p className="eyebrow">PASSWORD RECOVERY</p><h1>Verify your reset link</h1>
      <p>Firebase will validate this one-time link before showing the new-password form.</p>
      {message && <p className="notice notice-error" role="alert">{message}</p>}
      <button className="button button-primary" disabled={busy} onClick={() => void beginPasswordReset()} type="button">{busy ? "Checking link…" : "Continue securely"}</button>
    </div></section>;
  }

  if (parsed.kind === "action" && (parsed.mode === "verifyEmail" || parsed.mode === "recoverEmail")) {
    return <section className="auth-page"><div className="auth-card action-card">
      <div className="auth-card-icon"><BrandIcon name="shield-check" size={29} /></div>
      <p className="eyebrow">FIREBASE EMAIL ACTION</p>
      <h1>{parsed.mode === "verifyEmail" ? "Verify your email address" : "Restore your email address"}</h1>
      <p>Continue below to apply this one-time Firebase action. The action code is never displayed or logged.</p>
      {message && <p className="notice notice-error" role="alert">{message}</p>}
      <button className="button button-primary" disabled={busy} onClick={() => void applyEmailAction()} type="button">{busy ? "Verifying…" : parsed.mode === "verifyEmail" ? "Verify email" : "Restore email"}</button>
    </div></section>;
  }

  const detail = parsed.kind === "missing-mode"
    ? "No Firebase email action was found in this link."
    : parsed.kind === "unsupported-mode"
      ? "This type of Firebase email action is not supported by the HomiGo demo."
      : parsed.kind === "missing-code"
        ? "The one-time code is missing or too large to process. Request a fresh email link."
        : "The email action could not be read.";
  return <section className="auth-page"><div className="auth-card action-card">
    <div className="auth-card-icon"><BrandIcon name="alert-triangle" size={28} /></div>
    <p className="eyebrow">EMAIL ACTION</p><h1>Action link unavailable</h1>
    <p className="notice notice-error" role="alert">{detail}</p>
    <Link className="button button-primary" to="/auth">{user ? "Return to account" : "Go to sign in"}</Link>
  </div></section>;
}
