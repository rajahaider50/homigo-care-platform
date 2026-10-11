import { useEffect, useState, type FormEvent } from "react";
import {
  GoogleAuthProvider,
  getIdTokenResult,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandIcon } from "../components/BrandIcon";
import { WhatsAppOtpFields } from "../components/WhatsAppOtpFields";
import { auth, firebaseConfigured } from "../firebase";
import { friendlyAuthError } from "../lib/auth-errors";
import { ensureVerifiedPatientProfile } from "../lib/profile";
import { linkVerifiedWhatsApp, registerVerifiedAccount, requestWhatsAppOtp, signInWithPhonePassword, verifyWhatsAppOtp, type OtpProof } from "../lib/homigo-api";

type FormMode = "sign-in" | "sign-up" | "reset";
type Notice = { tone: "info" | "success" | "error"; text: string };
type OtpServiceStatus = "checking" | "ready" | "configuration_required" | "unavailable";
const DEFAULT_HOMIGO_API_BASE_URL = "https://homigo-care-api-rajahaider50.vercel.app";

function actionSettings(continuePath: string) {
  return { url: new URL(continuePath, window.location.origin).toString(), handleCodeInApp: false };
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
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpProof, setOtpProof] = useState<OtpProof | null>(null);
  const [otpServiceStatus, setOtpServiceStatus] = useState<OtpServiceStatus>("checking");
  const [phoneLinked, setPhoneLinked] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (new URLSearchParams(location.search).get("reset") === "complete") {
      setMode("sign-in");
      setNotice({ tone: "success", text: "Your password has been updated. Sign in with your new password." });
    }
  }, [location.search]);

  useEffect(() => {
    const base = import.meta.env.VITE_HOMIGO_API_BASE_URL?.trim() || DEFAULT_HOMIGO_API_BASE_URL;
    let active = true;
    fetch(`${base.replace(/\/+$/, "")}/api/health`, { cache: "no-store", signal: AbortSignal.timeout(5_000) })
      .then(async (response) => {
        let body: { status?: unknown } = {};
        try { body = await response.json() as { status?: unknown }; } catch { /* report an unavailable service below */ }
        if (!active) return;
        if (response.ok && body.status === "ready") setOtpServiceStatus("ready");
        else if (body.status === "configuration_required") setOtpServiceStatus("configuration_required");
        else setOtpServiceStatus("unavailable");
      })
      .catch(() => { if (active) setOtpServiceStatus("unavailable"); });
    return () => { active = false; };
  }, []);

  const otpServiceReady = otpServiceStatus === "ready";
  const otpServiceMessage = otpServiceStatus === "checking"
    ? "Checking secure WhatsApp verification readiness…"
    : otpServiceStatus === "configuration_required"
      ? "Live WhatsApp registration is not available yet because the secure verification service is not fully configured. No OTP will be sent until setup is complete."
      : otpServiceStatus === "unavailable"
        ? "The secure WhatsApp verification service could not be reached. New account registration is temporarily unavailable."
        : "";

  useEffect(() => {
    if (!user) {
      setPhoneLinked(null);
      return;
    }
    let active = true;
    getIdTokenResult(user, true)
      .then((token) => { if (active) setPhoneLinked(token.claims.whatsapp_verified === true); })
      .catch(() => { if (active) setPhoneLinked(false); });
    return () => { active = false; };
  }, [user?.uid]);

  async function finishSignIn(signedInUser: User) {
    await reload(signedInUser);
    const token = await getIdTokenResult(signedInUser, true);
    const linked = token.claims.whatsapp_verified === true
      && typeof token.claims.whatsapp_number === "string"
      && /^\+923\d{9}$/.test(token.claims.whatsapp_number);
    setPhoneLinked(linked);
    if (!signedInUser.emailVerified) {
      setNotice({ tone: "info", text: "Your email is not verified yet. Open the newest verification email, then return here." });
      return;
    }
    if (!linked) {
      setNotice({ tone: "info", text: "Verify and link your WhatsApp number before opening a patient profile." });
      return;
    }
    if (!hasUsableProfileName(signedInUser.displayName)) {
      setNotice({ tone: "info", text: "Add your name to finish setting up the patient profile." });
      return;
    }
    try {
      const displayName = await ensureVerifiedPatientProfile(signedInUser);
      setNotice({ tone: "success", text: `Signed in as ${displayName}. Your verified patient profile is ready.` });
    } catch (error) {
      setNotice({ tone: "error", text: `You are authenticated, but your profile could not be read or saved. ${friendlyAuthError(error)}` });
    }
  }

  function clearPhoneVerification() {
    setOtpCode("");
    setOtpSent(false);
    setOtpProof(null);
  }

  async function sendOtp() {
    if (!/^3\d{9}$/.test(phoneDigits)) {
      setNotice({ tone: "error", text: "Enter exactly 10 Pakistani mobile digits beginning with 3." });
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      await requestWhatsAppOtp(phoneDigits);
      setOtpSent(true);
      setOtpCode("");
      setOtpProof(null);
      setNotice({ tone: "success", text: "The server confirmed the WhatsApp code request. Check the linked WhatsApp device." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The WhatsApp code could not be sent." });
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp() {
    setNotice(null);
    setBusy(true);
    try {
      const proof = await verifyWhatsAppOtp(phoneDigits, otpCode);
      setOtpProof(proof);
      setNotice({ tone: "success", text: "The server verified the WhatsApp code. Continue before the one-use proof expires." });
    } catch (error) {
      setOtpProof(null);
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "The WhatsApp code could not be verified." });
    } finally {
      setBusy(false);
    }
  }

  async function linkPhoneToSignedInAccount() {
    if (!user || !otpProof) return;
    setNotice(null);
    setBusy(true);
    try {
      await linkVerifiedWhatsApp(user, otpProof.proof);
      setPhoneLinked(true);
      setOtpProof(null);
      await finishSignIn(user);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "WhatsApp could not be linked securely." });
    } finally {
      setBusy(false);
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
        setNotice({ tone: "success", text: "If an account exists for that address, Firebase has sent a password-reset email. WhatsApp-based recovery is not yet configured." });
        return;
      }
      if (mode === "sign-up") {
        const cleanName = fullName.trim();
        if (!otpProof) {
          setNotice({ tone: "error", text: "Verify your WhatsApp code before an account can be created." });
          return;
        }
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
        await registerVerifiedAccount({ proof: otpProof.proof, displayName: cleanName, email: normalizedEmail, password, role: "patient" });
        const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
        await sendEmailVerification(result.user, actionSettings("/auth/verified?source=email"));
        setNotice({ tone: "success", text: "Your WhatsApp-verified account was created. Open the newest Firebase email verification link before using the patient profile." });
        setPassword("");
        setConfirmPassword("");
        setOtpProof(null);
        return;
      }
      if (mode === "sign-in" && loginMethod === "phone") {
        if (!/^3\d{9}$/.test(phoneDigits)) {
          setNotice({ tone: "error", text: "Enter the 10-digit Pakistani WhatsApp number already linked to your HomiGo account." });
          return;
        }
        const customToken = await signInWithPhonePassword(phoneDigits, password);
        const result = await signInWithCustomToken(auth, customToken);
        await finishSignIn(result.user);
        setPassword("");
        return;
      }
      const result = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await finishSignIn(result.user);
      setPassword("");
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error && error.message.startsWith("The secure HomiGo") ? error.message : friendlyAuthError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function signInWithGoogle() {
    if (!auth) return;
    if (mode === "sign-up" && !otpProof) {
      setNotice({ tone: "error", text: "Verify your WhatsApp number before continuing with Google registration." });
      return;
    }
    setNotice(null);
    setBusy(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      if (mode === "sign-up" && otpProof) await linkVerifiedWhatsApp(result.user, otpProof.proof);
      await finishSignIn(result.user);
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error && error.message.startsWith("The secure HomiGo") ? error.message : friendlyAuthError(error) });
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
    try { await finishSignIn(user); } finally { setBusy(false); }
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
          <div className="auth-card-icon"><BrandIcon name={user.emailVerified && phoneLinked ? "shield-check" : "user"} size={28} /></div>
          <p className="eyebrow">PATIENT ACCOUNT</p>
          <h1>{!user.emailVerified ? "Verify your email" : phoneLinked === null ? "Checking secure account" : phoneLinked ? "You’re signed in" : "Verify your WhatsApp"}</h1>
          <p className="account-email">{user.email ?? "Email address unavailable"}</p>
          {notice && <p className={`notice notice-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}
          {user.emailVerified && phoneLinked && !hasUsableProfileName(user.displayName) && (
            <div className="auth-form profile-name-setup">
              <label><span>Full name</span><input autoComplete="name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} required value={fullName} /></label>
              <button className="button button-primary" disabled={busy} onClick={() => void saveProfileName()} type="button">{busy ? "Saving…" : "Save name and continue"}</button>
            </div>
          )}
          {!user.emailVerified ? (
            <>
              <p>Patient access requires both Firebase email verification and a server-verified WhatsApp number.</p>
              <div className="button-row">
                <button className="button button-primary" disabled={busy} onClick={resendVerification} type="button">{busy ? "Sending…" : "Resend verification email"}</button>
                <Link className="button button-quiet" to="/auth/verified">I opened the email</Link>
              </div>
            </>
          ) : phoneLinked === null ? (
            <p role="status">Checking the server-issued WhatsApp claim…</p>
          ) : !phoneLinked ? (
            <>
              <p>No patient profile is created until the server links and verifies your WhatsApp number.</p>
              {!otpServiceReady && <p className="notice notice-info" role="status">{otpServiceMessage}</p>}
              <WhatsAppOtpFields
                phoneDigits={phoneDigits}
                otpCode={otpCode}
                sent={otpSent}
                verified={otpProof !== null}
                busy={busy}
                serviceReady={otpServiceReady}
                onPhoneChange={(value) => { setPhoneDigits(value); clearPhoneVerification(); }}
                onCodeChange={(value) => { setOtpCode(value); setOtpProof(null); }}
                onSend={() => void sendOtp()}
                onVerify={() => void verifyOtp()}
              />
              <button className="button button-primary button-full" disabled={busy || !otpProof || !otpServiceReady} onClick={() => void linkPhoneToSignedInAccount()} type="button">{busy ? "Linking securely…" : "Verify and link WhatsApp"}</button>
            </>
          ) : (
            <>
              <p>Your email and Pakistani WhatsApp number are verified. Only a minimal patient profile is stored in this development milestone.</p>
              <div className="button-row">
                <button className="button button-primary" disabled={busy} onClick={() => void refreshProfile()} type="button">{busy ? "Checking…" : "Refresh profile status"}</button>
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
        <p>Account creation is server-gated by a real WhatsApp verification proof. Firebase email verification remains required before a patient profile is saved.</p>
        <div className="auth-trust-line"><BrandIcon name="shield-check" size={20} /><span>+92 mobile format is fixed; the gateway key never enters the browser.</span></div>
      </aside>

      <div className="auth-card">
        <div className="auth-card-icon"><BrandIcon name={mode === "reset" ? "refresh" : "lock"} size={27} /></div>
        <p className="eyebrow">{mode === "sign-up" ? "CREATE PATIENT ACCOUNT" : mode === "reset" ? "PASSWORD RECOVERY" : "PATIENT SIGN-IN"}</p>
        <h2>{mode === "sign-up" ? "Create your account" : mode === "reset" ? "Reset your password" : "Sign in securely"}</h2>
        <p className="auth-intro">{mode === "sign-up" ? "Verify WhatsApp first; only then will the server create the Firebase account." : mode === "reset" ? "Enter your account email. Firebase sends a reset link if an account is registered." : "Sign in with email/password or a previously verified +92 mobile number and password."}</p>
        {notice && <p className={`notice notice-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}
        {mode === "sign-up" && !otpServiceReady && <p className="notice notice-info" role="status">{otpServiceMessage}</p>}

        {mode === "sign-in" && (
          <div className="auth-login-method" role="group" aria-label="Sign-in method">
            <button aria-pressed={loginMethod === "email"} className={`button button-small ${loginMethod === "email" ? "button-primary" : "button-outline"}`} onClick={() => { setLoginMethod("email"); setNotice(null); }} type="button">Email</button>
            <button aria-pressed={loginMethod === "phone"} className={`button button-small ${loginMethod === "phone" ? "button-primary" : "button-outline"}`} onClick={() => { setLoginMethod("phone"); setNotice(null); }} type="button">WhatsApp mobile</button>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "sign-up" && (
            <>
              <label><span>Full name</span><input autoComplete="name" maxLength={80} minLength={2} onChange={(event) => setFullName(event.target.value)} required value={fullName} /></label>
              <WhatsAppOtpFields
                phoneDigits={phoneDigits}
                otpCode={otpCode}
                sent={otpSent}
                verified={otpProof !== null}
                busy={busy}
                serviceReady={otpServiceReady}
                onPhoneChange={(value) => { setPhoneDigits(value); clearPhoneVerification(); }}
                onCodeChange={(value) => { setOtpCode(value); setOtpProof(null); }}
                onSend={() => void sendOtp()}
                onVerify={() => void verifyOtp()}
              />
            </>
          )}
          {!(mode === "sign-in" && loginMethod === "phone") && (
            <label>
              <span>Email address</span>
              <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
          )}
          {mode === "sign-in" && loginMethod === "phone" && (
            <label>
              <span>WhatsApp mobile number</span>
              <div className="phone-input">
                <span className="phone-prefix" aria-label="Pakistan country code, fixed">+92</span>
                <input autoComplete="tel-national" inputMode="numeric" maxLength={10} onChange={(event) => { setPhoneDigits(event.target.value.replace(/\D/g, "").slice(0, 10)); clearPhoneVerification(); }} pattern="3[0-9]{9}" placeholder="3XXXXXXXXX" required type="tel" value={phoneDigits} />
              </div>
              <small>Use the number verified and linked to this HomiGo account. New or unlinked numbers must first sign in by email and complete WhatsApp verification.</small>
            </label>
          )}
          {mode !== "reset" && (
            <label>
              <span>Password</span>
              <div className="password-field">
                <input autoComplete={mode === "sign-up" ? "new-password" : "current-password"} minLength={8} onChange={(event) => setPassword(event.target.value)} required type={showPassword ? "text" : "password"} value={password} />
                <button aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="password-toggle" onClick={() => setShowPassword((value) => !value)} type="button"><BrandIcon name={showPassword ? "eye-off" : "eye"} size={19} /></button>
              </div>
            </label>
          )}
          {mode === "sign-up" && (
            <label>
              <span>Confirm password</span>
              <div className="password-field">
                <input autoComplete="new-password" minLength={8} onChange={(event) => setConfirmPassword(event.target.value)} required type={showConfirmPassword ? "text" : "password"} value={confirmPassword} />
                <button aria-label={showConfirmPassword ? "Hide password" : "Show password"} aria-pressed={showConfirmPassword} className="password-toggle" onClick={() => setShowConfirmPassword((value) => !value)} type="button"><BrandIcon name={showConfirmPassword ? "eye-off" : "eye"} size={19} /></button>
              </div>
            </label>
          )}
          <button className="button button-primary button-full" disabled={busy || (mode === "sign-up" && (!otpProof || !otpServiceReady))} type="submit">
            {busy ? "Please wait…" : mode === "sign-up" ? "Create verified account" : mode === "reset" ? "Send reset email" : "Sign in"}
          </button>
        </form>

        {mode !== "reset" && (
          <>
            <div className="auth-divider"><span>or</span></div>
            <button className="button button-google button-full" disabled={busy || (mode === "sign-up" && (!otpProof || !otpServiceReady))} onClick={() => void signInWithGoogle()} type="button">
              <span className="google-g" aria-hidden="true">G</span> Continue with Google
            </button>
          </>
        )}

        <div className="auth-switches">
          {mode === "sign-in" && <button className="text-button" onClick={() => { setMode("reset"); setLoginMethod("email"); setNotice(null); }} type="button">Forgot password?</button>}
          {mode === "sign-in" ? (
            <p>New to HomiGo Care? <button className="text-button" onClick={() => { setMode("sign-up"); setLoginMethod("email"); setNotice(null); }} type="button">Create an account</button></p>
          ) : mode === "sign-up" ? (
            <p>Already registered? <button className="text-button" onClick={() => { setMode("sign-in"); setLoginMethod("email"); setNotice(null); }} type="button">Sign in</button></p>
          ) : (
            <p><button className="text-button" onClick={() => { setMode("sign-in"); setNotice(null); }} type="button">Back to sign in</button></p>
          )}
        </div>
        <p className="privacy-note">Development project only. Booking, Health Passport and emergency dispatch availability is shown only when the corresponding shared workflow is connected.</p>
      </div>
    </section>
  );
}
