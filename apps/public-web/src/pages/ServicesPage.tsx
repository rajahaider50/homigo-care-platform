import { Link } from "react-router-dom";
import { BrandIcon } from "../components/BrandIcon";

const items = [
  { icon: "user-medical" as const, title: "Doctor and nurse visits", availability: "Not live yet", tone: "muted", description: "Professional verification, care discovery and booking are being built for a later milestone. No professional availability or appointment is represented by this demo." },
  { icon: "passport" as const, title: "Health Passport", availability: "Not live yet", tone: "muted", description: "Patient-controlled health-record access is planned for a later milestone. Do not upload medical or identity documents to this public demo." },
  { icon: "siren" as const, title: "SOS support", availability: "Not connected to responders", tone: "warning", description: "The demo does not dispatch emergency services. For emergencies, contact local emergency services directly." },
  { icon: "lock" as const, title: "Secure patient account", availability: "M1 foundation", tone: "active", description: "Firebase email/password and Google sign-in options are available. Email verification is required before a minimal patient profile can be created." },
];

export function ServicesPage() {
  return (
    <>
      <section className="page-hero page-container">
        <div className="page-hero-copy"><p className="eyebrow">SERVICE OVERVIEW · DEMO STATUS</p><h1>Know what’s ready—and what isn’t.</h1><p>HomiGo Care is being built in stages. These labels describe the current M1 demo, not a promise of availability.</p></div>
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
        <aside className="service-disclaimer"><BrandIcon name="info" size={22} /><p><strong>Demo boundaries</strong><br />This website is a non-commercial staging demo. It is not a clinical service and does not store health records, create bookings, or notify emergency responders.</p></aside>
        <div className="service-cta"><div><h2>Start with secure access.</h2><p>Test the real Firebase account and verification flow.</p></div><Link className="button button-primary" to="/auth">Patient access <BrandIcon name="arrow-right" size={18} /></Link></div>
      </section>
    </>
  );
}
