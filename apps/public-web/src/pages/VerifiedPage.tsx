import { useState } from "react";
import { getIdToken, reload } from "firebase/auth";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandIcon } from "../components/BrandIcon";
import { auth, firebaseConfigured } from "../firebase";
import { friendlyAuthError } from "../lib/auth-errors";
import { ensureVerifiedPatientProfile } from "../lib/profile";

export function VerifiedPage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "info" | "error"; text: string } | null>(null);

  async function checkStatus() {
    if (!auth || !user) return;
    setBusy(true);
    setNotice(null);
    try {
      await reload(user);
      await getIdToken(user, true);
      if (!user.emailVerified) {
        setNotice({ tone: "info", text: "Firebase has not confirmed this email yet. Open the newest message and use its verification link." });
        return;
      }
      try {
        const displayName = await ensureVerifiedPatientProfile(user);
        setNotice({ tone: "success", text: `Email verified. The patient profile for ${displayName} is ready.` });
      } catch (error) {
        setNotice({ tone: "error", text: `Email verified, but the minimum profile could not be read or saved. ${friendlyAuthError(error)}` });
      }
    } catch (error) {
      setNotice({ tone: "error", text: friendlyAuthError(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card action-card">
        <div className="auth-card-icon"><BrandIcon name="shield-check" size={30} /></div>
        <p className="eyebrow">EMAIL VERIFICATION</p>
        <h1>Confirm your account status</h1>
        {!firebaseConfigured ? (
          <p className="notice notice-error" role="alert">Firebase is not configured in this website build.</p>
        ) : user ? (
          <>
            <p>After opening the Firebase email link, refresh your authentication state here. Profile creation is allowed only after verification.</p>
            {notice && <p className={`notice notice-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}
            <button className="button button-primary" disabled={busy} onClick={() => void checkStatus()} type="button">{busy ? "Checking…" : "Check verification status"}</button>
          </>
        ) : (
          <>
            <p>Once the email link reports success, sign in to refresh Firebase status and complete your profile.</p>
            <Link className="button button-primary" to="/auth">Sign in to continue</Link>
          </>
        )}
        <Link className="text-button action-back" to="/">Return to HomiGo Care</Link>
      </div>
    </section>
  );
}
