import { Link } from "react-router-dom";
import { BrandIcon } from "../components/BrandIcon";

const upcomingServices = [
  { icon: "user-medical" as const, title: "Doctor and nurse care", text: "Professional discovery and booking are planned for a later milestone.", status: "Not live yet" },
  { icon: "passport" as const, title: "Health Passport", text: "Patient-controlled record sharing is planned for a later milestone.", status: "In development" },
  { icon: "siren" as const, title: "SOS support", text: "This demo does not dispatch emergency services or notify responders.", status: "Not connected" },
];

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-inner page-container">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> HOME CARE, WITH CLARITY</span>
            <h1>Care at home should feel <em>closer.</em></h1>
            <p className="hero-lede">HomiGo Care is building a thoughtful way to begin a care journey at home. This demo starts with a secure patient account and clear information about what is—and is not—available yet.</p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" to="/auth">Create a patient account <BrandIcon name="arrow-right" size={18} /></Link>
              <Link className="button button-outline" to="/services">Explore care services</Link>
            </div>
            <p className="hero-footnote"><BrandIcon name="lock" size={16} /> Patient profile setup requires a verified email.</p>
          </div>

          <div className="hero-visual" aria-label="HomiGo Care brand illustration">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-brand-card">
              <img className="hero-mark" src="/logos/homigo_mark.png" alt="" aria-hidden="true" />
              <span className="hero-card-label">A secure first step</span>
              <div className="hero-pulse-icon"><BrandIcon name="heart-pulse" size={42} /></div>
              <span className="hero-card-title">Care begins with trust.</span>
              <span className="hero-card-subtitle">Verified access · minimal profile</span>
            </div>
            <div className="floating-note note-top"><BrandIcon name="shield-check" size={18} /><span>Privacy-minded by design</span></div>
            <div className="floating-note note-bottom"><span className="status-dot" /> No bookings are shown as available</div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Demo capabilities">
        <div className="page-container trust-strip-inner">
          <div><BrandIcon name="shield-check" size={22} /><span><strong>Real Firebase sign-in</strong><small>Email verification and Google options</small></span></div>
          <div><BrandIcon name="user" size={22} /><span><strong>Minimum profile only</strong><small>No health records in this milestone</small></span></div>
          <div><BrandIcon name="info" size={22} /><span><strong>Honest demo status</strong><small>Unavailable features stay clearly marked</small></span></div>
        </div>
      </section>

      <section className="section-block page-container" id="services">
        <div className="section-heading section-heading-split">
          <div><p className="eyebrow">WHAT WE’RE BUILDING</p><h2>Care services, clearly explained.</h2></div>
          <Link className="text-link" to="/services">See all service status <BrandIcon name="arrow-right" size={18} /></Link>
        </div>
        <div className="service-grid">
          {upcomingServices.map((service) => (
            <article className="service-card" key={service.title}>
              <div className="service-icon"><BrandIcon name={service.icon} size={25} /></div>
              <span className="status-chip">{service.status}</span>
              <h3>{service.title}</h3>
              <p>{service.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps-section" id="how-it-works">
        <div className="page-container steps-inner">
          <div className="steps-intro"><p className="eyebrow">A SIMPLE FIRST STEP</p><h2>Start with what’s ready.</h2><p>Account security is the first working slice. Care discovery and operational workflows will be added only after their real integrations are in place.</p></div>
          <ol className="steps-list">
            <li><span>01</span><div><h3>Create a patient account</h3><p>Use email and password or Google sign-in.</p></div></li>
            <li><span>02</span><div><h3>Verify your email</h3><p>Firebase confirms your address before a profile is saved.</p></div></li>
            <li><span>03</span><div><h3>Follow the next release</h3><p>Booking, Health Passport and SOS are not active in this demo.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="closing-cta page-container">
        <div><p className="eyebrow">READY WHEN YOU ARE</p><h2>Take the secure first step.</h2><p>Create an account to test the real Firebase authentication flow.</p></div>
        <Link className="button button-light" to="/auth">Go to patient access <BrandIcon name="arrow-right" size={18} /></Link>
      </section>
    </>
  );
}
