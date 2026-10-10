import { Link } from "react-router-dom";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  const brandLogoUrl = import.meta.env.VITE_HOMIGO_BRAND_LOGO_URL?.trim() || "/logos/homigo_lockup_horizontal.png";
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <Link aria-label="HomiGo Care home" className="brand-link" to="/">
            <img src={brandLogoUrl} alt="HomiGo Care" />
          </Link>
          <nav aria-label="Main navigation" className="main-nav">
            <Link to="/services">Care services</Link>
            <a href="/#how-it-works">How it works</a>
            <Link to="/care">My care</Link>
            <Link className="button button-small button-primary" to="/auth">Patient access</Link>
          </nav>
        </div>
      </header>
      <main id="main-content">{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <img src="/logos/homigo_mark.png" alt="" aria-hidden="true" />
          <p>HomiGo Care demo/staging. This site is not a clinical service or emergency-dispatch system.</p>
          <span>© {new Date().getFullYear()} HomiGo Care</span>
        </div>
      </footer>
    </div>
  );
}
