import { Link } from "react-router-dom";
import { LegalMailto, LegalValue } from "../components/LegalValue";
import { LEGAL_ORG, hasIncompleteLegalOrg } from "../content/legalOrg";

export default function ContactPage() {
  return (
    <section className="page legal-page">
      <h1>Contact</h1>
      {hasIncompleteLegalOrg() && (
        <p className="legal-banner-todo" role="status">
          Completați datele ONG în <code>src/content/legalOrg.ts</code> —
          apar și aici evidențiate.
        </p>
      )}
      <div className="legal-doc">
        <p>
          <strong>
            <LegalValue value={LEGAL_ORG.legalName} />
          </strong>
        </p>
        <p>
          <LegalValue value={LEGAL_ORG.address} />
        </p>
        <p>
          CUI / înregistrare:{" "}
          <LegalValue value={LEGAL_ORG.registrationId} />
        </p>
        <p>
          Email: <LegalMailto email={LEGAL_ORG.contactEmail} />
        </p>
        <p>
          GDPR / privacy: <LegalMailto email={LEGAL_ORG.privacyEmail} /> (
          <LegalValue value={LEGAL_ORG.dpoOrContactName} />)
        </p>
        <p>
          Documente: <Link to="/privacy">Confidențialitate</Link>
          {" · "}
          <Link to="/cookies">Cookies</Link>
          {" · "}
          <Link to="/termeni">Termeni</Link>
        </p>
      </div>
    </section>
  );
}
