import { useEffect, useState, type FormEvent } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getIdToken,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandIcon } from "../components/BrandIcon";
import { auth, firebaseConfigured } from "../firebase";
import { friendlyAuthError } from "../lib/auth-errors";
import { ensureVerifiedPatientProfile } from "../lib/profile";

type FormMode = "sign-in" | "sign-up" | "reset";
type Notice = { tone: "info" | "success" | "error"; text: string };

function actionSettings(continuePath: string) {
  return {
    url: new URL(continuePath, window.location.origin).toString(),
    handleCodeInApp: false,
  };
}

function hasUsableProfileName(name: string | null): boolean {
  const length = name?.trim().length ?? 0;
  return length >= 2 && length <= 80;
}

export function AuthPage({ initialMode = "sign-in" }: { initialMode?: "sign-in" | "reset" }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<FormMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("reset") === "complete") {
      setMode("sign-in");
      setNotice({ tone: "success", text: "Your password has been updated. Sign in with your new password." });
    }
  }, [location.search]);

  async function finishSignIn(signedInUser: User) {
    await reload(signedInUser);
    await getIdToken(signedInUser, true);
    if (!signedInUser.emailVerified) {
      setNotice({ tone: "info", text: "Your email is not verified yet. Open the newest verification email, then return here." });
      return;
    }
    if (!hasUsableProfileName(signedInUser.displayName)) {
      setNotice({ tone: "info", text: "Add your name to finish setting up the patient profile." });
      return;
    }
    try {
      const displayName = await ensureVerifiedPatientProfile(signedInUser);
      setNotice({ tone: "success", text: `Signed in as ${displayName}. Your minimal patient profile is ready.` });
    } catch (error) {
      setNotice({ tone: "error", text: `You are authenticated, but your profile could not be read or saved. ${friendlyAuthError(error)}` });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) return;
    setNotice(null);
    setBusy(true);
    try {
      const normalizedEmail = email.trim();
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, normalizedEmail, actionSettings("/auth?reset=complete"));
        setNotice({ tone: "success", text: "If an account exists for that address, Firebase has sent a password-reset email." });
        return;
      }
      if (mode === "sign-up") {
        const cleanName = fullName.trim();
        if (cleanName.length < 2 || cleanName.length > 80) {
          setNotice({ tone: "error", text: "Enter a name between 2 and 80 characters." });
          return;
        }
        if (password.length < 8) {
          setNotice({ tone: "error", text: "Choose a password with at least 8 characters." });
          return;
        }
        if (password !== confirmPassword) {
          setNotice({ tone: "error", text: "The passwords do not match." });
          return;
        }
        const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
        await updateProfile(result.user, { displayName: cleanName });
        await sendEmailVerification(result.user, actionSettings("/auth/verified?source=email"));
        setNotice({ tone: "success", text: "Your account was created. Open the latest verification email before signing in." });
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await finishSignIn(result.user);
      setPassword("");
    } catch (error) {
      setNotice({ tone: "error", text: friendlyAuthError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!auth) return;
    setNotice(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      await finishSignIn(result.user);
    } catch (error) {
      setNotice({ tone: "error", text: friendlyAuthError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function resendVerification() {
    if (!auth || !user) return;
    setNotice(null);
    setBusy(true);
    try {
      await sendEmailVerification(user, actionSettings("/auth/verified?source=email"));
      setNotice({ tone: "success", text: "A new verification email was requested. Use the newest link; older links may be expired." });
    } catch (error) {
      setNotice({ tone: "error", text: friendlyAuthError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function refreshProfile() {
    if (!user) return;
    setBusy(true);
    setNotice(null);
    try {
      await finishSignIn(user);
    } finally {
      setBusy(false);
    }
  }

  async function saveProfileName() {
    if (!user) return;
    const cleanName = fullName.trim();
    if (cleanName.length < 2 || cleanName.length > 80) {
      setNotice({ tone: "error", text: "Enter a name between 2 and 80 characters." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await updateProfile(user, { displayName: cleanName });
      await finishSignIn(user);
    } catch (error) {
      setNotice({ tone: "error", text: friendlyAuthError(error) });
    } finally {
      setBusy(false);
    }
  }

  if (authLoading) {
    return <section className="auth-page"><div className="auth-card"><p role="status">Checking secure sign-in…</p></div></section>;
  }

  if (!firebaseConfigured || !auth) {
    return (
      <section className="auth-page">
        <div className="auth-card">
          <BrandIcon name="lock" size={30} />
          <h1>Secure access is being configured</h1>
          <p>Firebase Web Authentication is not connected in this build. No account or profile has been created.</p>
          <Link className="button button-primary" to="/">Back to HomiGo Care</Link>
        </div>
      </section>
    );
  }

  if (user) {
    return (
      <section className="auth-page">
        <div className="auth-card auth-card-wide">
          <div className="auth-card-icon"><BrandIcon name={user.emailVerified ? "shield-check" : "user"} size={28} /></div>
          <p className="eyebrow">PATIENT ACCOUNT</p>
          <h1>{user.emailVerified ? "You’re signed in" : "Verify your email"}</h1>
          <p className="account-email">{user.email ?? "Email address unavailable"}</p>
          {notice && <p className={`notice notice-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}
          {user.emailVerified && !hasUsableProfileName(user.displayName) && (
            <div className="auth-form profile-name-setup">
              <label><span>Full name</span><input autoComplete="name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} required value={fullName} /></label>
              <button className="button button-primary" disabled={busy} onClick={() => void saveProfileName()} type="button">{busy ? "Saving…" : "Save name and continue"}</button>
            </div>
          )}
          {!user.emailVerified ? (
            <>
              <p>Patient profile access is available only after Firebase confirms your email address.</p>
              <div className="button-row">
                <button className="button button-primary" disabled={busy} onClick={resendVerification} type="button">
                  {busy ? "Sending…" : "Resend verification email"}
                </button>
                <Link className="button button-quiet" to="/auth/verified">I opened the email</Link>
              </div>
            </>
          ) : (
            <>
              <p>This M1 website supports secure account access and a minimal patient profile. Booking and clinical records are not active here.</p>
              <div className="button-row">
                <button className="button button-primary" disabled={busy} onClick={refreshProfile} type="button">
                  {busy ? "Checking…" : "Refresh profile status"}
                </button>
                <Link className="button button-quiet" to="/services">View service status</Link>
              </div>
            </>
          )}
          <button className="text-button sign-out-button" disabled={busy} onClick={() => void signOut()} type="button">Sign out</button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <aside className="auth-aside">
        <div className="auth-aside-mark"><img src="/logos/homigo_mark.png" alt="" aria-hidden="true" /></div>
        <p className="eyebrow">HOMIGO CARE · SECURE ACCESS</p>
        <h1>{mode === "sign-up" ? "A calmer start to care at home." : mode === "reset" ? "Get back into your account." : "Your care journey starts here."}</h1>
        <p>Use Firebase-secured access for your patient account. Only the minimum account profile is stored in this milestone.</p>
        <div className="auth-trust-line"><BrandIcon name="shield-check" size={20} /><span>Email verification is required before a patient profile is created.</span></div>
      </aside>

      <div className="auth-card">
        <div className="auth-card-icon"><BrandIcon name={mode === "reset" ? "refresh" : "lock"} size={27} /></div>
        <p className="eyebrow">{mode === "sign-up" ? "CREATE PATIENT ACCOUNT" : mode === "reset" ? "PASSWORD RECOVERY" : "PATIENT SIGN-IN"}</p>
        <h2>{mode === "sign-up" ? "Create your account" : mode === "reset" ? "Reset your password" : "Sign in securely"}</h2>
        <p className="auth-intro">{mode === "sign-up" ? "We’ll send a verification link to your email before saving your patient profile." : mode === "reset" ? "Enter your account email. Firebase will send a one-time password-reset link if an account is registered." : "Continue with email or use your Google account."}</p>
        {notice && <p className={`notice notice-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <label>
              <span>Full name</span>
              <input autoComplete="name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} required value={fullName} />
            </label>
          )}
          <label>
            <span>Email address</span>
            <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          {mode !== "reset" && (
            <label>
              <span>Password</span>
              <input autoComplete={mode === "sign-up" ? "new-password" : "current-password"} minLength={8} onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>
          )}
          {mode === "sign-up" && (
            <label>
              <span>Confirm password</span>
              <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type="password" value={confirmPassword} />
            </label>
          )}
          <button className="button button-primary button-full" disabled={busy} type="submit">
            {busy ? "Please wait…" : mode === "sign-up" ? "Create account" : mode === "reset" ? "Send reset email" : "Sign in"}
          </button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="auth-divider"><span>or</span></div>
            <button className="button button-google button-full" disabled={busy} onClick={() => void signInWithGoogle()} type="button">
              <span className="google-g" aria-hidden="true">G</span> Continue with Google
            </button>
          </>
        )}

        <div className="auth-switches">
          {mode === "sign-in" && <button className="text-button" onClick={() => { setMode("reset"); setNotice(null); }} type="button">Forgot password?</button>}
          {mode === "sign-in" ? (
            <p>New to HomiGo Care? <button className="text-button" onClick={() => { setMode("sign-up"); setNotice(null); }} type="button">Create an account</button></p>
          ) : mode === "sign-up" ? (
            <p>Already registered? <button className="text-button" onClick={() => { setMode("sign-in"); setNotice(null); }} type="button">Sign in</button></p>
          ) : (
            <p><button className="text-button" onClick={() => { setMode("sign-in"); setNotice(null); }} type="button">Back to sign in</button></p>
          )}
        </div>
        <p className="privacy-note">M1 stores account details only. Health records, booking and emergency dispatch are not enabled on this website.</p>
      </div>
    </section>
  );
}
