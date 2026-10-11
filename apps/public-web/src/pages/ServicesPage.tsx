import { Link } from "react-router-dom";
import { BrandIcon } from "../components/BrandIcon";

const items = [
  { icon: "user-medical" as const, title: "Doctor and nurse visits", availability: "M2 · dev workflow built", tone: "active", description: "Approved-provider discovery, future-dated booking requests, patient cancellation, professional response states, and bounded Admin review are implemented. The dev Firestore rules are deployed; a provider appears only after Admin approval." },
  { icon: "passport" as const, title: "Health Passport", availability: "Not in this milestone", tone: "muted", description: "Patient-controlled medical-record upload and access are not implemented. Do not upload medical or identity documents to this staging project." },
  { icon: "siren" as const, title: "SOS support", availability: "Not connected to responders", tone: "warning", description: "The demo does not dispatch emergency services. For emergencies, contact local emergency services directly." },
  { icon: "lock" as const, title: "Secure patient account", availability: "OTP-gated source flow", tone: "active", description: "The server adapter now requires an explicit gateway verification result and a one-use Firebase-backed proof before account creation or phone linking. Live use still needs gateway and least-privilege Firebase Admin configuration." },
];

export function ServicesPage() {
  return (
    <>
      <section className="page-hero page-container">
        <div className="page-hero-copy"><p className="eyebrow">SERVICE OVERVIEW · DEVELOPMENT</p><h1>Know what’s built—and what still needs setup.</h1><p>These labels reflect tested source behavior, local emulator checks, and the current external-service blockers. They are not a promise of clinical availability.</p></div>
        <div className="page-hero-symbol"><img src="/logos/homigo_mark.png" alt="" aria-hidden="true" /></div>
      </section>
      <section className="service-status-section page-container">
        <div className="service-status-list">
          {items.map((item) => (
            <article className="service-status-card" key={item.title}>
              <div className="service-icon"><BrandIcon name={item.icon} size={24} /></div>
              <div className="service-status-copy"><h2>{item.title}</h2><p>{item.description}</p></div>
              <span className={`status-chip status-${item.tone}`}>{item.availability}</span>
            </article>
          ))}
        </div>
        <aside className="service-disclaimer"><BrandIcon name="info" size={22} /><p><strong>Development boundaries</strong><br />This is a development project, not a clinical service. No emergency dispatch, health records, payment capture, or production patient data are supported. Booking writes use the deployed rules in the selected Firebase development project; new registration still awaits live WhatsApp gateway configuration.</p></aside>
        <div className="service-cta"><div><h2>Try the patient workflow.</h2><p>Sign in with a verified patient account to browse approved providers and create a development booking request.</p></div><Link className="button button-primary" to="/care">Open My Care <BrandIcon name="arrow-right" size={18} /></Link></div>
      </section>
    </>
  );
}
