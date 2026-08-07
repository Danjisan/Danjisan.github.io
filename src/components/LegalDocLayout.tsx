import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { hasIncompleteLegalOrg } from "../content/legalOrg";

interface LegalDocLayoutProps {
  title: string;
  children: ReactNode;
}

export default function LegalDocLayout({ title, children }: LegalDocLayoutProps) {
  return (
    <section className="page legal-page">
      <h1>{title}</h1>
      {hasIncompleteLegalOrg() && (
        <p className="legal-banner-todo" role="status">
          Unele date ale operatorului sunt încă placeholder. Completați fișierul{" "}
          <code>src/content/legalOrg.ts</code>. Câmpurile marcate cu fundal
          galben trebuie înlocuite.
        </p>
      )}
      <div className="legal-doc">{children}</div>
      <nav className="legal-nav" aria-label="Documente legale">
        <Link to="/privacy">Confidențialitate</Link>
        <Link to="/cookies">Cookies</Link>
        <Link to="/termeni">Termeni</Link>
        <Link to="/contact">Contact</Link>
      </nav>
    </section>
  );
}
