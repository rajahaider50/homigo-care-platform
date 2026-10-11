import { Link } from "react-router-dom";
import { BrandIcon } from "../components/BrandIcon";

const serviceHighlights = [
  { icon: "user-medical" as const, title: "Doctor and nurse visits", text: "Approved-provider discovery and development booking requests are implemented. A provider appears only after Admin approval.", status: "M2 workflow built" },
  { icon: "passport" as const, title: "Health Passport", text: "Patient-controlled health-record sharing is not implemented in this milestone.", status: "Not in M2" },
  { icon: "siren" as const, title: "SOS support", text: "This development build does not dispatch emergency services or notify responders.", status: "Not connected" },
];

export function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="hero-inner page-container">
          <div className="hero-copy">
            <span className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> HOME CARE, WITH CLARITY</span>
            <h1>Care at home should feel <em>closer.</em></h1>
            <p className="hero-lede">HomiGo Care’s M2 development build connects verified patient accounts to approved-provider discovery and a first booking workflow. It is not a clinical service.</p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" to="/auth">Patient access <BrandIcon name="arrow-right" size={18} /></Link>
              <Link className="button button-outline" to="/care">Explore My Care</Link>
            </div>
            <p className="hero-footnote"><BrandIcon name="lock" size={16} /> New account registration uses live server-side WhatsApp OTP verification.</p>
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
            <div className="floating-note note-bottom"><span className="status-dot" /> Booking flow built · dev data only</div>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Development capabilities">
        <div className="page-container trust-strip-inner">
          <div><BrandIcon name="shield-check" size={22} /><span><strong>Email and Google sign-in</strong><small>Firebase verification and password recovery are connected</small></span></div>
          <div><BrandIcon name="user" size={22} /><span><strong>Provider discovery and bookings</strong><small>Uses approved profiles and deployed development rules</small></span></div>
          <div><BrandIcon name="info" size={22} /><span><strong>Clear development limits</strong><small>No health records, payments, or emergency dispatch</small></span></div>
        </div>
      </section>

      <section className="section-block page-container" id="services">
        <div className="section-heading section-heading-split">
          <div><p className="eyebrow">M2 DEVELOPMENT WORKFLOW</p><h2>Care services, clearly explained.</h2></div>
          <Link className="text-link" to="/services">See all service status <BrandIcon name="arrow-right" size={18} /></Link>
        </div>
        <div className="service-grid">
          {serviceHighlights.map((service) => (
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
        <div className="steps-intro"><p className="eyebrow">THE FIRST VERTICAL SLICE</p><h2>From verified access to a visit request.</h2><p>The discovery and booking workflow reads live development data only. New patients are protected by server-side WhatsApp OTP verification.</p></div>
          <ol className="steps-list">
            <li><span>01</span><div><h3>Sign in or verify an account</h3><p>Email and Google sign-in are wired; new registration requires a live WhatsApp OTP proof.</p></div></li>
            <li><span>02</span><div><h3>Browse approved professionals</h3><p>Only Admin-approved profiles appear. The app does not invent or seed provider records.</p></div></li>
            <li><span>03</span><div><h3>Request a development visit</h3><p>A booking request can be created for an approved professional; it is not a confirmed clinical appointment.</p></div></li>
          </ol>
        </div>
      </section>

      <section className="closing-cta page-container">
        <div><p className="eyebrow">M2 · DEVELOPMENT ONLY</p><h2>Explore the patient workflow.</h2><p>No clinical care, emergency dispatch, or production patient records are provided by this site.</p></div>
        <Link className="button button-light" to="/care">Open My Care <BrandIcon name="arrow-right" size={18} /></Link>
      </section>
    </>
  );
}
