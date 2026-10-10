import { useEffect, useState, type FormEvent } from "react";
import {
  getIdTokenResult,
  onAuthStateChanged,
  reload,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { collection, getCountFromServer, limit, query } from "firebase/firestore";
import { hasVerifiedAdminClaim } from "./admin-access";
import { auth, db, firebaseConfigured } from "./firebase";

type AccessStatus = "checking" | "signed-out" | "authorized" | "unconfigured";
type MetricStatus = "loading" | "ready" | "unavailable";

function safeAuthMessage(): string {
  return "Sign-in could not be completed. Check the account details or network, then try again.";
}

export default function App() {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!auth || !firebaseConfigured) {
      setAccessStatus("unconfigured");
      return;
    }

    let active = true;
    let validationId = 0;
    const currentAuth = auth;
    const unsubscribe = onAuthStateChanged(currentAuth, async (signedInUser) => {
      const currentValidation = ++validationId;
      if (!signedInUser) {
        setAdminUser(null);
        setAccessStatus("signed-out");
        return;
      }

      setAdminUser(signedInUser);
      setAccessStatus("checking");
      try {
        await reload(signedInUser);
        const token = await getIdTokenResult(signedInUser, true);
        if (!active || currentValidation !== validationId || currentAuth.currentUser?.uid !== signedInUser.uid) return;

        if (!hasVerifiedAdminClaim(signedInUser.emailVerified, token.claims.admin)) {
          setAdminUser(null);
          setAccessStatus("signed-out");
          setNotice(signedInUser.emailVerified
            ? "This account does not have the server-issued Admin claim. No Admin data was opened."
            : "Verify this account's email before requesting Admin access. No Admin data was opened.");
          await signOut(currentAuth).catch(() => undefined);
          return;
        }

        setNotice("");
        setAccessStatus("authorized");
      } catch {
        if (!active || currentValidation !== validationId) return;
        setAdminUser(null);
        setAccessStatus("signed-out");
        setNotice("Secure Admin access could not be verified. Check the connection and try again.");
        await signOut(currentAuth).catch(() => undefined);
      }
    });

    return () => {
      active = false;
      validationId += 1;
      unsubscribe();
    };
  }, []);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth) return;
    setNotice("");
    setAccessStatus("checking");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setAccessStatus("signed-out");
      setNotice(safeAuthMessage());
    } finally {
      setPassword("");
      setBusy(false);
    }
  }

  async function handleSignOut() {
    if (!auth) return;
    setBusy(true);
    setNotice("");
    try {
      await signOut(auth);
      setAdminUser(null);
      setAccessStatus("signed-out");
    } catch {
      setNotice("Sign-out could not be completed. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-shell">
      <aside className="brand-rail">
        <a className="admin-logo" href="/" aria-label="HomiGo Care Admin home">
          <img src="/logos/homigo_lockup_horizontal.png" alt="HomiGo Care" />
        </a>
        <div className="rail-copy">
          <p className="eyebrow">RESTRICTED WORKSPACE</p>
          <h1>Care operations, with access earned by role.</h1>
          <p>This console accepts existing verified accounts only. An Admin role must be granted securely on the server; it cannot be created here.</p>
        </div>
        <div className="rail-footer"><span className="secure-dot" /> Firebase-secured · development project</div>
      </aside>

      <section className="admin-content" aria-live="polite">
        <div className="content-topline"><span>HOMIGO CARE · ADMIN</span><span className="environment-chip">M1 · DEMO</span></div>
        {accessStatus === "unconfigured" ? (
          <section className="access-card" aria-labelledby="setup-title">
            <div className="access-symbol" aria-hidden="true">HG</div>
            <p className="eyebrow">SECURE SIGN-IN</p>
            <h2 id="setup-title">Admin access is being configured</h2>
            <p>Firebase Web Authentication is not configured for this deployment. No Admin account or data has been created.</p>
          </section>
        ) : accessStatus === "checking" ? (
          <section className="access-card" role="status">
            <div className="loader-mark" aria-hidden="true" />
            <p className="eyebrow">VERIFYING ACCESS</p>
            <h2>Checking your Admin role</h2>
            <p>Email verification and a server-issued custom claim are required before the console can open.</p>
          </section>
        ) : accessStatus === "authorized" && adminUser ? (
          <AdminDashboard user={adminUser} busy={busy} onSignOut={() => void handleSignOut()} />
        ) : (
          <section className="access-card" aria-labelledby="login-title">
            <div className="access-symbol" aria-hidden="true">HG</div>
            <p className="eyebrow">EXISTING ACCOUNTS ONLY</p>
            <h2 id="login-title">Sign in to the Admin workspace</h2>
            <p className="access-copy">Access is granted only after Firebase confirms a verified email and the trusted Admin claim.</p>
            {notice && <p className="notice" role="alert">{notice}</p>}
            <form className="admin-form" onSubmit={handleSignIn}>
              <label>
                <span>Email address</span>
                <input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
              </label>
              <label>
                <span>Password</span>
                <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
              </label>
              <button className="primary-button" disabled={busy || !auth} type="submit">{busy ? "Signing in…" : "Sign in securely"}</button>
            </form>
            <p className="no-signup-note">There is no public Admin registration or client-side role assignment.</p>
          </section>
        )}
        <footer className="content-footer">Patient and professional datasets remain closed until their milestone rules are approved.</footer>
      </section>
    </main>
  );
}

function AdminDashboard({ user, busy, onSignOut }: { user: User; busy: boolean; onSignOut: () => void }) {
  const [metricStatus, setMetricStatus] = useState<MetricStatus>("loading");
  const [patientCount, setPatientCount] = useState<number | null>(null);

  useEffect(() => {
    if (!db) {
      setMetricStatus("unavailable");
      return;
    }

    let active = true;
    const boundedProfiles = query(collection(db, "profiles"), limit(100));
    getCountFromServer(boundedProfiles)
      .then((snapshot) => {
        if (!active) return;
        setPatientCount(snapshot.data().count);
        setMetricStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setMetricStatus("unavailable");
      });

    return () => { active = false; };
  }, []);

  const patientCountLabel = patientCount === null ? "—" : patientCount === 100 ? "100+" : String(patientCount);

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">CLAIM VERIFIED</p>
          <h2 id="dashboard-title">Admin workspace</h2>
          <p>Signed in as {user.displayName?.trim() || user.email || "verified Admin"}</p>
        </div>
        <button className="quiet-button" disabled={busy} onClick={onSignOut} type="button">Sign out</button>
      </div>
      <div className="metric-grid">
        <article className="metric-card">
          <span className="metric-label">Patient profiles</span>
          <strong>{metricStatus === "loading" ? "…" : metricStatus === "unavailable" ? "—" : patientCountLabel}</strong>
          <p>{metricStatus === "loading" ? "Checking the bounded profile count…" : metricStatus === "unavailable" ? "The secure count is unavailable under the current policy or connection." : patientCount === 0 ? "No patient profiles are available yet." : "Verified, bounded count; profile details are not shown."}</p>
        </article>
        <article className="metric-card metric-disabled">
          <span className="metric-label">Professionals</span>
          <strong>Not active</strong>
          <p>No professional collection query runs until M2 data rules are approved.</p>
        </article>
        <article className="metric-card metric-disabled">
          <span className="metric-label">Bookings</span>
          <strong>Not active</strong>
          <p>No booking collection query runs until M2 data rules are approved.</p>
        </article>
      </div>
      <div className="policy-note"><span aria-hidden="true">i</span><p>Only the Firebase-issued Admin claim can enter this workspace. The M1 profile query is limited to 100 and returns an aggregate count, not patient documents.</p></div>
    </section>
  );
}
