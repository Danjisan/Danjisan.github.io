import LegalDocLayout from "../../components/LegalDocLayout";
import { LegalMailto, LegalValue } from "../../components/LegalValue";
import { LEGAL_ORG } from "../../content/legalOrg";

export default function CookiesPage() {
  return (
    <LegalDocLayout title="Politică cookies & stocare locală">
      <p className="legal-meta">
        Ultima actualizare: {LEGAL_ORG.policiesUpdatedAt} · Operator:{" "}
        <LegalValue value={LEGAL_ORG.legalName} />
      </p>

      <h2>1. Pe scurt</h2>
      <p>
        ColabMe <strong>nu</strong> folosește momentan cookies de marketing sau
        analytics (Google Analytics, Meta Pixel etc.). Folosim stocare locală{" "}
        <strong>strict necesară</strong> pentru autentificare și securitatea
        resetării parolei.
      </p>
      <p>
        De aceea nu afișăm un „cookie wall” de tip Accept all / Reject. Dacă în
        viitor adăugăm instrumente opționale, vom cere consimțământ înainte de
        activare și vom actualiza această pagină.
      </p>

      <h2>2. Ce folosim acum</h2>
      <div className="legal-table-wrap">
        <table className="legal-table">
          <thead>
            <tr>
              <th>Nume / tip</th>
              <th>Unde</th>
              <th>Scop</th>
              <th>Durată</th>
              <th>Necesar?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sesiune Supabase Auth</td>
              <td>localStorage</td>
              <td>Te ține logat, reînnoiește tokenul</td>
              <td>Până la logout / expirare</td>
              <td>Da</td>
            </tr>
            <tr>
              <td>Flag reset parolă</td>
              <td>sessionStorage</td>
              <td>Finalizează fluxul „am uitat parola” în siguranță</td>
              <td>Doar tab-ul curent</td>
              <td>Da</td>
            </tr>
            <tr>
              <td>Preferințe UI minore</td>
              <td>local / memorie</td>
              <td>Stări de interfață (ex. player video pornit)</td>
              <td>Sesiune sau până la clear browser</td>
              <td>Funcțional</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>3. YouTube</h2>
      <p>
        Unele pagini pot include video. Folosim{" "}
        <code>youtube-nocookie.com</code> și încărcăm playerul{" "}
        <strong>doar după ce apeși play</strong>. Până atunci nu se încarcă
        iframe-ul YouTube. După play, Google / YouTube pot seta propriile
        cookies conform politicilor lor.
      </p>

      <h2>4. Cum controlezi</h2>
      <ul>
        <li>Logout din cont șterge sesiunea Auth din acest browser.</li>
        <li>
          Poți șterge datele site-ului din setările browserului (localStorage /
          cookies pentru colabme.eu).
        </li>
        <li>
          Întrebări: <LegalMailto email={LEGAL_ORG.privacyEmail} />.
        </li>
      </ul>

      <h2>5. Analytics și marketing (stare actuală)</h2>
      <p>
        <strong>Nu sunt active</strong> cookies sau scripturi de analytics /
        publicitate. Dacă vom introduce un astfel de instrument, vom:
      </p>
      <ul>
        <li>actualiza această pagină cu numele tool-ului, scopul și durata;</li>
        <li>
          afișa un banner de consimțământ înainte de încărcarea scripturilor
          non-esențiale;
        </li>
        <li>permite refuzul fără a bloca folosirea de bază a platformei.</li>
      </ul>
    </LegalDocLayout>
  );
}
