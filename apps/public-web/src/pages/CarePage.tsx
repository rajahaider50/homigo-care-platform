import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getIdTokenResult, reload } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { BrandIcon } from "../components/BrandIcon";
import { db, firebaseConfigured } from "../firebase";
import { ensureVerifiedPatientProfile } from "../lib/profile";

type Gate = "loading" | "unconfigured" | "sign-in" | "email" | "whatsapp" | "professional" | "ready" | "unavailable";
type Professional = { uid: string; displayName: string; professionalType: "doctor" | "nurse"; specialty: string; qualification: string; experienceYears: number; city: string; availability: string };
type Booking = { id: string; patientUid: string; professionalUid: string; serviceType: string; scheduledAt: unknown; address: string; status: string };

function defaultSchedule(): string {
  const date = new Date(Date.now() + 3 * 60 * 60 * 1000);
  date.setMinutes(Math.ceil(date.getMinutes() / 30) * 30, 0, 0);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function scheduleMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value && typeof value.toMillis === "function") return value.toMillis() as number;
  return 0;
}

function scheduleLabel(value: unknown): string {
  const milliseconds = scheduleMillis(value);
  return milliseconds > 0 ? new Date(milliseconds).toLocaleString() : "Schedule unavailable";
}

export function CarePage() {
  const { user, loading: authLoading } = useAuth();
  const [gate, setGate] = useState<Gate>("loading");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [professionalUid, setProfessionalUid] = useState("");
  const [scheduledInput, setScheduledInput] = useState(defaultSchedule);
  const [address, setAddress] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (authLoading) { setGate("loading"); return; }
    if (!user) { setGate("sign-in"); return; }
    if (!firebaseConfigured || !db) { setGate("unconfigured"); return; }
    let active = true;
    setGate("loading");
    (async () => {
      await reload(user);
      const token = await getIdTokenResult(user, true);
      if (!user.emailVerified) { if (active) setGate("email"); return; }
      if (token.claims.whatsapp_verified !== true || typeof token.claims.whatsapp_number !== "string") { if (active) setGate("whatsapp"); return; }
      const profile = await getDoc(doc(db, "profiles", user.uid));
      if (!profile.exists()) await ensureVerifiedPatientProfile(user);
      else if (profile.data().role !== "patient") { if (active) setGate("professional"); return; }
      const approvedQuery = query(collection(db, "professional_profiles"), where("status", "==", "approved"), limit(20));
      const bookingQuery = query(collection(db, "bookings"), where("patientUid", "==", user.uid), limit(50));
      const [professionalSnapshot, bookingSnapshot] = await Promise.all([getDocs(approvedQuery), getDocs(bookingQuery)]);
      if (!active) return;
      const providerRows = professionalSnapshot.docs.map((snapshot) => {
        const data = snapshot.data();
        return {
          uid: snapshot.id,
          displayName: typeof data.displayName === "string" ? data.displayName : "HomiGo professional",
          professionalType: data.professionalType === "nurse" ? "nurse" : "doctor",
          specialty: typeof data.specialty === "string" ? data.specialty : "Home care",
          qualification: typeof data.qualification === "string" ? data.qualification : "Verified profile",
          experienceYears: typeof data.experienceYears === "number" ? data.experienceYears : 0,
          city: typeof data.city === "string" ? data.city : "Service area not listed",
          availability: typeof data.availability === "string" ? data.availability : "Contact after request",
        } satisfies Professional;
      });
      setProfessionals(providerRows);
      setBookings(bookingSnapshot.docs.map((snapshot) => ({ id: snapshot.id, ...snapshot.data() } as Booking)).sort((left, right) => scheduleMillis(left.scheduledAt) - scheduleMillis(right.scheduledAt)));
      if (!professionalUid && providerRows.length) setProfessionalUid(providerRows[0].uid);
      setGate("ready");
      setNotice("");
    })().catch(() => {
      if (active) {
        setGate("unavailable");
        setNotice("The live development Firestore rules or service connection did not permit this request. No providers or bookings were invented.");
      }
    });
    return () => { active = false; };
  }, [authLoading, user?.uid, refreshKey]);

  const selectedProfessional = useMemo(() => professionals.find((item) => item.uid === professionalUid) ?? null, [professionals, professionalUid]);

  async function requestBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!db || !user || !selectedProfessional) return;
    const scheduledAtDate = new Date(scheduledInput);
    if (!Number.isFinite(scheduledAtDate.getTime()) || scheduledAtDate.getTime() <= Date.now()) {
      setNotice("Choose a future date and time for the visit.");
      return;
    }
    const cleanAddress = address.trim();
    if (cleanAddress.length < 10 || cleanAddress.length > 250) {
      setNotice("Enter a service address between 10 and 250 characters. Do not add medical history here.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      await addDoc(collection(db, "bookings"), {
        patientUid: user.uid,
        professionalUid: selectedProfessional.uid,
        serviceType: selectedProfessional.professionalType === "doctor" ? "doctor_visit" : "nurse_visit",
        scheduledAt: Timestamp.fromDate(scheduledAtDate),
        address: cleanAddress,
        status: "requested",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNotice("Booking request saved. This is a development workflow; no professional has accepted the visit yet.");
      setAddress("");
      setRefreshKey((value) => value + 1);
    } catch {
      setNotice("The request was not saved. Check your verified account and the deployed Firestore rules before retrying.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!db) return;
    setBusy(true);
    setNotice("");
    try {
      await updateDoc(doc(db, "bookings", bookingId), { status: "cancelled", updatedAt: serverTimestamp() });
      setNotice("Booking request cancelled.");
      setRefreshKey((value) => value + 1);
    } catch {
      setNotice("This booking could not be cancelled. Only your requested or accepted bookings can be cancelled.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="care-page page-container">
      <header className="care-page-heading">
        <div><p className="eyebrow">M2 · DEVELOPMENT WORKFLOW</p><h1>Care at home</h1><p>Browse only Admin-approved profiles, request a visit, and track your own booking status.</p></div>
        <div className="care-heading-mark"><BrandIcon name="home" size={34} /></div>
      </header>

      {notice && <p className="care-notice" role="status">{notice}</p>}
      {gate === "loading" && <div className="care-state" role="status">Checking verified account and development service…</div>}
      {gate === "unconfigured" && <div className="care-state"><h2>Firebase is not connected</h2><p>No account or booking data can be read in this build.</p></div>}
      {gate === "sign-in" && <div className="care-state"><h2>Sign in to continue</h2><p>Booking is available only to a verified patient account.</p><Link className="button button-primary" to="/auth">Patient sign-in</Link></div>}
      {gate === "email" && <div className="care-state"><h2>Verify your email first</h2><p>Patient profile and booking access require a verified Firebase email.</p><Link className="button button-primary" to="/auth">Continue verification</Link></div>}
      {gate === "whatsapp" && <div className="care-state"><h2>Verify WhatsApp first</h2><p>Only a server-issued WhatsApp verification claim unlocks patient records and booking.</p><Link className="button button-primary" to="/auth">Verify WhatsApp</Link></div>}
      {gate === "professional" && <div className="care-state"><h2>This is a professional account</h2><p>Professional onboarding and booking response actions are available in the mobile development workflow.</p></div>}
      {gate === "unavailable" && <div className="care-state"><h2>Development data is unavailable</h2><p>The current project rules or network did not allow this bounded query. The UI will not show mock professionals.</p><button className="button button-outline" onClick={() => setRefreshKey((value) => value + 1)} type="button">Try again</button></div>}

      {gate === "ready" && (
        <div className="care-layout">
          <section className="care-panel" aria-labelledby="professional-list-title">
            <div className="care-panel-heading"><div><p className="eyebrow">APPROVED PROVIDERS</p><h2 id="professional-list-title">Available in your development project</h2></div><span className="care-count">{professionals.length} shown · max 20</span></div>
            {professionals.length === 0 ? <p className="care-empty">No approved professional profiles are published yet. Admin review must be completed before a provider appears here.</p> : (
              <div className="professional-list">
                {professionals.map((professional) => (
                  <button aria-pressed={professionalUid === professional.uid} className={`professional-card ${professionalUid === professional.uid ? "professional-selected" : ""}`} key={professional.uid} onClick={() => setProfessionalUid(professional.uid)} type="button">
                    <span className="professional-avatar"><BrandIcon name={professional.professionalType === "doctor" ? "stethoscope" : "heart-pulse"} size={23} /></span>
                    <span className="professional-details"><strong>{professional.displayName}</strong><span>{professional.professionalType === "doctor" ? "Doctor" : "Nurse"} · {professional.specialty}</span><small>{professional.qualification} · {professional.experienceYears} years · {professional.city}</small><small>{professional.availability}</small></span>
                    <BrandIcon name="check-circle" size={18} className="provider-check" />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="care-panel booking-form-panel" aria-labelledby="booking-form-title">
            <p className="eyebrow">REQUEST A HOME VISIT</p><h2 id="booking-form-title">Choose a time</h2>
            {selectedProfessional ? (
              <form className="care-form" onSubmit={requestBooking}>
                <p className="selected-provider"><strong>{selectedProfessional.displayName}</strong><span>{selectedProfessional.professionalType === "doctor" ? "Doctor visit" : "Nurse visit"} · {selectedProfessional.city}</span></p>
                <label><span>Preferred date and time</span><input min={defaultSchedule()} onChange={(event) => setScheduledInput(event.target.value)} required type="datetime-local" value={scheduledInput} /></label>
                <label><span>Service address</span><textarea maxLength={250} minLength={10} onChange={(event) => setAddress(event.target.value)} placeholder="House, street, area, city" required rows={3} value={address} /></label>
                <small className="care-form-note">This is a service address only. Do not enter diagnosis, medical history, CNIC, or payment information.</small>
                <button className="button button-primary button-full" disabled={busy} type="submit">{busy ? "Saving request…" : "Request visit"}</button>
              </form>
            ) : <p className="care-empty">Choose an approved professional to continue.</p>}
          </section>

          <section className="care-panel my-bookings-panel" aria-labelledby="my-bookings-title">
            <div className="care-panel-heading"><div><p className="eyebrow">YOUR REQUESTS</p><h2 id="my-bookings-title">My bookings</h2></div><span className="care-count">max 50</span></div>
            {bookings.length === 0 ? <p className="care-empty">You have no booking requests in this development project.</p> : (
              <div className="patient-booking-list">
                {bookings.map((booking) => (
                  <article className="patient-booking-card" key={booking.id}>
                    <div><strong>{booking.serviceType === "nurse_visit" ? "Nurse visit" : "Doctor visit"}</strong><span>{scheduleLabel(booking.scheduledAt)}</span><small>Status: {booking.status}</small></div>
                    {booking.status === "requested" || booking.status === "accepted" ? <button className="cancel-booking" disabled={busy} onClick={() => void cancelBooking(booking.id)} type="button">Cancel request</button> : <span className={`booking-state-pill state-${booking.status}`}>{booking.status}</span>}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      <p className="care-disclaimer"><BrandIcon name="info" size={18} /> Development-only booking data. No emergency dispatch, clinical advice, insurance, or production patient records.</p>
    </section>
  );
}
