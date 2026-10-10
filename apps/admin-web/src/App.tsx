import { useEffect, useState, type FormEvent } from "react";
import {
  getIdTokenResult,
  onAuthStateChanged,
  reload,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { hasVerifiedAdminClaim } from "./admin-access";
import { auth, db, firebaseConfigured } from "./firebase";

type AccessStatus = "checking" | "signed-out" | "authorized" | "unconfigured";
type LoadState = "loading" | "ready" | "unavailable";
type GatewayState = "checking" | "ready" | "configuration_required" | "unreachable";
type ProfessionalRow = { uid: string; displayName: string; professionalType: string; specialty: string; qualification: string; experienceYears: number; city: string; status: string };
type BookingRow = { id: string; patientUid: string; professionalUid: string; serviceType: string; scheduledAt: unknown; status: string };

function safeAuthMessage(): string {
  return "Sign-in could not be completed. Check the account details or network, then try again.";
}

function textValue(value: unknown, fallback = "Not provided"): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function dateLabel(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value.toDate() as Date).toLocaleString();
  }
  return "Schedule unavailable";
}

export default function App() {
  const brandLogoUrl = import.meta.env.VITE_HOMIGO_BRAND_LOGO_URL?.trim() || "/logos/homigo_lockup_horizontal.png";
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("checking");
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    return () => { active = false; validationId += 1; unsubscribe(); };
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
        <a className="admin-logo" href="/" aria-label="HomiGo Care Admin home"><img src={brandLogoUrl} alt="HomiGo Care" /></a>
        <div className="rail-copy">
          <p className="eyebrow">RESTRICTED WORKSPACE</p>
          <h1>Care operations, with access earned by role.</h1>
          <p>This console accepts existing verified accounts only. An Admin role must be granted securely on the server; it cannot be created here.</p>
        </div>
        <div className="rail-footer"><span className="secure-dot" /> Firebase-secured · development project</div>
      </aside>

      <section className="admin-content" aria-live="polite">
        <div className="content-topline"><span>HOMIGO CARE · ADMIN</span><span className="environment-chip">M2 · DEV</span></div>
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
              <label><span>Email address</span><input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
              <label>
                <span>Password</span>
                <div className="admin-password-field">
                  <input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type={showPassword ? "text" : "password"} value={password} />
                  <button aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} className="admin-password-toggle" onClick={() => setShowPassword((value) => !value)} type="button">
                    <img src={showPassword ? "/icons/svg/eye-off.svg" : "/icons/svg/eye.svg"} alt="" />
                  </button>
                </div>
              </label>
              <button className="primary-button" disabled={busy || !auth} type="submit">{busy ? "Signing in…" : "Sign in securely"}</button>
            </form>
            <p className="no-signup-note">There is no public Admin registration or client-side role assignment.</p>
          </section>
        )}
        <footer className="content-footer">Development Firestore rules are deployed and emulator-tested. This restricted console is not a production care system.</footer>
      </section>
    </main>
  );
}

function AdminDashboard({ user, busy, onSignOut }: { user: User; busy: boolean; onSignOut: () => void }) {
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [professionals, setProfessionals] = useState<ProfessionalRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [gatewayState, setGatewayState] = useState<GatewayState>("checking");
  const [workingUid, setWorkingUid] = useState<string | null>(null);
  const [dashboardNotice, setDashboardNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!db) { setLoadState("unavailable"); return; }
    let active = true;
    const boundedProfiles = query(collection(db, "profiles"), limit(100));
    const boundedProfessionals = query(collection(db, "professional_profiles"), limit(100));
    const boundedBookings = query(collection(db, "bookings"), limit(100));
    setLoadState("loading");
    Promise.all([
      getCountFromServer(boundedProfiles),
      getDocs(boundedProfessionals),
      getDocs(boundedBookings),
    ]).then(([profiles, professionalSnapshot, bookingSnapshot]) => {
      if (!active) return;
      setPatientCount(profiles.data().count);
      setProfessionals(professionalSnapshot.docs.map((snapshot) => ({ uid: snapshot.id, ...snapshot.data() } as ProfessionalRow)));
      setBookings(bookingSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as BookingRow)));
      setLoadState("ready");
      setDashboardNotice("");
    }).catch(() => {
      if (!active) return;
      setLoadState("unavailable");
      setDashboardNotice("The remote Firestore rules or network did not permit this bounded read. No records were fabricated.");
    });
    return () => { active = false; };
  }, [refreshKey]);

  useEffect(() => {
    const base = import.meta.env.VITE_HOMIGO_API_BASE_URL?.trim();
    if (!base) { setGatewayState("configuration_required"); return; }
    let active = true;
    fetch(`${base.replace(/\/+$/, "")}/api/health`, { method: "GET", cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({})) as { status?: string };
        if (!active) return;
        setGatewayState(response.ok && payload.status === "ready" ? "ready" : "configuration_required");
      })
      .catch(() => { if (active) setGatewayState("unreachable"); });
    return () => { active = false; };
  }, []);

  async function reviewProfessional(uid: string, status: "approved" | "rejected") {
    if (!db) return;
    setWorkingUid(uid);
    setDashboardNotice("");
    try {
      await updateDoc(doc(db, "professional_profiles", uid), { status, updatedAt: serverTimestamp() });
      setDashboardNotice(status === "approved" ? "Professional approved. Patient discovery can show this profile after refresh." : "Professional application rejected.");
      setRefreshKey((value) => value + 1);
    } catch {
      setDashboardNotice("The review could not be saved. Check the Admin claim and live Firestore rules.");
    } finally {
      setWorkingUid(null);
    }
  }

  const patientCountLabel = patientCount === null ? "—" : patientCount === 100 ? "100+" : String(patientCount);
  const pendingCount = professionals.filter((item) => item.status === "pending").length;

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="dashboard-heading">
        <div><p className="eyebrow">CLAIM VERIFIED</p><h2 id="dashboard-title">Admin workspace</h2><p>Signed in as {user.displayName?.trim() || user.email || "verified Admin"}</p></div>
        <div className="dashboard-actions"><button className="quiet-button" onClick={() => setRefreshKey((value) => value + 1)} type="button">Refresh data</button><button className="quiet-button" disabled={busy} onClick={onSignOut} type="button">Sign out</button></div>
      </div>
      {dashboardNotice && <p className="dashboard-notice" role="status">{dashboardNotice}</p>}
      <div className="metric-grid">
        <article className="metric-card"><span className="metric-label">Patient profiles</span><strong>{loadState === "loading" ? "…" : loadState === "unavailable" ? "—" : patientCountLabel}</strong><p>{loadState === "ready" ? "Aggregate only; no patient details shown in this summary." : loadState === "loading" ? "Checking bounded count…" : "Remote Firestore access is unavailable."}</p></article>
        <article className="metric-card"><span className="metric-label">Professional review queue</span><strong>{loadState === "ready" ? String(pendingCount) : loadState === "loading" ? "…" : "—"}</strong><p>Bounded to 100 profiles; approval is restricted to the Admin claim.</p></article>
        <article className="metric-card"><span className="metric-label">Booking records</span><strong>{loadState === "ready" ? String(bookings.length) : loadState === "loading" ? "…" : "—"}</strong><p>At most 100 records; street address and medical notes are not rendered.</p></article>
      </div>

      <section className="queue-panel" aria-labelledby="review-title">
        <div className="queue-heading"><div><p className="eyebrow">PROFESSIONAL ONBOARDING</p><h3 id="review-title">Verification queue</h3></div><span className="queue-count">{pendingCount} pending</span></div>
        {loadState === "ready" && professionals.length === 0 ? <p className="empty-state">No applications are available in the development project.</p> : loadState === "unavailable" ? <p className="empty-state">The review queue could not be read. Check this Admin account's claim, network, and development Firestore access.</p> : (
          <div className="queue-list">
            {professionals.map((item) => (
              <article className="review-card" key={item.uid}>
                <div className="review-card-main"><strong>{textValue(item.displayName, "Unnamed professional")}</strong><span>{textValue(item.professionalType)} · {textValue(item.specialty)}</span><small>{textValue(item.qualification)} · {Number.isFinite(item.experienceYears) ? item.experienceYears : "—"} years · {textValue(item.city)} · {textValue(item.status)}</small></div>
                {item.status === "pending" && <div className="review-actions"><button className="approve-button" disabled={workingUid === item.uid} onClick={() => void reviewProfessional(item.uid, "approved")} type="button">Approve</button><button className="reject-button" disabled={workingUid === item.uid} onClick={() => void reviewProfessional(item.uid, "rejected")} type="button">Reject</button></div>}
              </article>
            ))}
            {professionals.length === 0 && loadState === "loading" && <p className="empty-state">Loading bounded review queue…</p>}
          </div>
        )}
      </section>

      <section className="queue-panel" aria-labelledby="bookings-title">
        <div className="queue-heading"><div><p className="eyebrow">CARE OPERATIONS</p><h3 id="bookings-title">Recent bookings</h3></div><span className="queue-count">maximum 100</span></div>
        {loadState === "ready" && bookings.length === 0 ? <p className="empty-state">No booking requests have been created in this development project.</p> : loadState === "unavailable" ? <p className="empty-state">The booking queue could not be read. Check this Admin account's claim, network, and development Firestore access.</p> : (
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-card" key={booking.id}>
                <div><strong>{textValue(booking.serviceType).replaceAll("_", " ")}</strong><span>{dateLabel(booking.scheduledAt)}</span><small>Patient {booking.patientUid?.slice(0, 8) || "—"}… · Professional {booking.professionalUid?.slice(0, 8) || "—"}…</small></div>
                <span className={`status-pill status-${booking.status}`}>{textValue(booking.status)}</span>
              </article>
            ))}
            {bookings.length === 0 && loadState === "loading" && <p className="empty-state">Loading bounded booking queue…</p>}
          </div>
        )}
      </section>

      <section className="gateway-panel" aria-labelledby="gateway-title">
        <div className="gateway-panel-heading"><div><p className="eyebrow">WHATSAPP GATEWAY</p><h3 id="gateway-title">Connection and bot controls</h3></div><span className={`gateway-status gateway-${gatewayState}`}>{gatewayState === "ready" ? "Configured" : gatewayState === "checking" ? "Checking" : gatewayState === "unreachable" ? "Unreachable" : "Setup required"}</span></div>
        <p className="gateway-explainer">The Admin UI never stores or displays the gateway API key. Server health is read from the API; pairing and direct-message actions remain disabled until the gateway's exact endpoints are documented.</p>
        <div className="gateway-sections">
          <article><span className="gateway-step">01</span><div><strong>WhatsApp bot pairing</strong><p>Pairing endpoint and live bot status are not in the supplied API contract.</p><button className="quiet-button" disabled type="button">Generate pairing code · endpoint required</button></div></article>
          <article><span className="gateway-step">02</span><div><strong>Direct chat</strong><p>Recipient and message endpoints are not documented; no message will be sent from this screen.</p><button className="quiet-button" disabled type="button">Send message · endpoint required</button></div></article>
          <article><span className="gateway-step">03</span><div><strong>OTP security</strong><p>Gateway-reported limits and test-mode allow-list are not queried by the current API. The screenshot's defaults are reference notes, not live values.</p><button className="quiet-button" disabled type="button">Read live limits · endpoint required</button></div></article>
        </div>
      </section>
      <div className="policy-note"><span aria-hidden="true">i</span><p>Only a Firebase-issued Admin claim can enter. Reads are bounded to 100; the Admin dashboard intentionally omits patient street addresses, phone numbers, and free-text health data.</p></div>
    </section>
  );
}
