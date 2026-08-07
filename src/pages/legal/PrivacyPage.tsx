import { Link } from "react-router-dom";
import LegalDocLayout from "../../components/LegalDocLayout";
import { LegalMailto, LegalValue } from "../../components/LegalValue";
import { LEGAL_ORG } from "../../content/legalOrg";

export default function PrivacyPage() {
  return (
    <LegalDocLayout title="Politică de confidențialitate">
      <p className="legal-meta">
        Ultima actualizare: {LEGAL_ORG.policiesUpdatedAt} · Site:{" "}
        {LEGAL_ORG.siteUrl}
      </p>

      <h2>1. Cine suntem (operatorul)</h2>
      <p>
        Operatorul platformei ColabMe este{" "}
        <LegalValue value={LEGAL_ORG.legalName} />, cu sediul la{" "}
        <LegalValue value={LEGAL_ORG.address} />,{" "}
        <LegalValue value={LEGAL_ORG.registrationId} />.
      </p>
      <p>
        Contact general: <LegalMailto email={LEGAL_ORG.contactEmail} />.
        <br />
        Cereri privind datele personale:{" "}
        <LegalMailto email={LEGAL_ORG.privacyEmail} /> (
        <LegalValue value={LEGAL_ORG.dpoOrContactName} />).
      </p>

      <h2>2. Ce date prelucrăm</h2>
      <ul>
        <li>
          <strong>Cont:</strong> email, parolă (stocată hash de Supabase Auth),
          nume afișat, rol (elev / profesor / părinte / etc.), școală (opțional),
          XP.
        </li>
        <li>
          <strong>Activitate pe platformă:</strong> progres la lecții, sesiuni de
          joc, răspunsuri la întrebări, mesaje din lobby (unde e disponibil).
        </li>
        <li>
          <strong>Tehnice necesare:</strong> sesiune de autentificare în browser
          (localStorage), date minime de securitate / loguri la furnizori.
        </li>
        <li>
          <strong>Emailuri de serviciu:</strong> confirmare cont / resetare
          parolă (trimise prin Supabase).
        </li>
      </ul>
      <p>
        Nu folosim momentan instrumente de publicitate sau analytics de tip
        Google Analytics / Meta Pixel pe site.
      </p>

      <h2>3. Scopuri și temeiuri</h2>
      <ul>
        <li>
          Furnizarea contului și a serviciului educațional (executarea relației
          cu utilizatorul / interes legitim pentru funcționarea platformei).
        </li>
        <li>Securitatea contului (reset parolă, prevenirea abuzului).</li>
        <li>Îmbunătățirea conținutului educațional și moderarea sesiunilor.</li>
        <li>
          Obligații legale, când există (ex. răspuns la autorități, păstrare
          documente).
        </li>
      </ul>

      <h2>4. Unde sunt stocate datele (procesatori)</h2>
      <p>
        Datele de cont și baza de date rulează pe <strong>Supabase</strong>,
        regiune <strong>Central EU (Frankfurt, Germania)</strong>. Site-ul web
        este servit ca fișiere statice (ex. GitHub Pages); domeniul și DNS-ul
        sunt gestionate prin GoDaddy. Emailurile de autentificare sunt trimise
        prin infrastructura Supabase Auth.
      </p>
      <ul>
        <li>
          <strong>Supabase</strong> — autentificare, bază de date, stocare
          fișiere (UE). Operatorul poate încheia / accepta DPA-ul Supabase din
          dashboard-ul proiectului.
        </li>
        <li>
          <strong>GitHub Pages</strong> — livrare site static (fără baza de
          date a conturilor).
        </li>
        <li>
          <strong>GoDaddy</strong> — domeniu / DNS.
        </li>
        <li>
          <strong>YouTube (Google)</strong> — doar dacă apeși play pe un video
          încorporat (mod privacy-enhanced / nocookie).
        </li>
        <li>
          Eventual un server WebSocket pe un host separat (când e activ pentru
          jocuri live) — tot în UE, pe cât posibil.
        </li>
      </ul>

      <h2>5. Minori</h2>
      <p>
        ColabMe este o platformă educațională destinată și elevilor. Conform
        cadrului GDPR pentru România, prelucrarea pe baza consimțământului
        pentru servicii ale societății informaționale vizează, în principiu,
        vârsta de <strong>cel puțin 16 ani</strong>, cu excepția cazului în
        care un părinte sau tutore este de acord.
      </p>
      <ul>
        <li>
          La înregistrare, utilizatorul confirmă că are cel puțin 16 ani sau că
          un părinte / tutore este de acord cu crearea contului.
        </li>
        <li>
          Conturile de tip „elev” sub 16 ani ar trebui create sau supravegheate
          cu acordul părintelui / tutorelui (sau prin intermediul școlii /
          profesorului, unde există un cadru organizat).
        </li>
        <li>
          Dacă aflăm că un minor sub 16 ani are cont fără acord parental valid,
          putem suspenda sau șterge contul și datele asociate, la cerere sau din
          oficiu, și vom răspunde pe{" "}
          <LegalMailto email={LEGAL_ORG.privacyEmail} />.
        </li>
      </ul>

      <h2>6. Cât timp păstrăm datele</h2>
      <ul>
        <li>
          <strong>Cont activ:</strong> pe toată perioada folosirii platformei.
        </li>
        <li>
          <strong>Cont inactiv:</strong> putem șterge sau anonimiza după{" "}
          <strong>24 de luni</strong> fără autentificare, după o notificare pe
          email (dacă e posibil).
        </li>
        <li>
          <strong>Mesaje chat (lobby):</strong> păstrate pentru moderare și
          funcționare; țintim retenție scurtă (ordinul{" "}
          <strong>90 de zile</strong>), apoi ștergere sau anonimizare, pe măsură
          ce infrastructura o permite.
        </li>
        <li>
          <strong>Rezultate joc / progres lecții:</strong> cât timp contul există
          și e util scopului educațional; la ștergerea contului, le eliminăm sau
          le anonimizăm.
        </li>
        <li>
          <strong>Backup-uri</strong> la furnizori: pe durata politicii
          lor (tipic zile / săptămâni), apoi dispar din backup-urile rotative.
        </li>
        <li>
          La cerere de ștergere răspundem în termen rezonabil (țintă:{" "}
          <strong>30 de zile</strong>), cu excepțiile prevăzute de lege.
        </li>
      </ul>

      <h2>7. Drepturile tale</h2>
      <p>Conform GDPR, poți solicita:</p>
      <ul>
        <li>acces la datele tale</li>
        <li>rectificare</li>
        <li>ștergere („dreptul de a fi uitat”), în limitele legii</li>
        <li>restricționare / opoziție, unde se aplică</li>
        <li>portabilitate, unde se aplică</li>
        <li>plângere la autoritatea de supraveghere (în RO: ANSPDCP)</li>
      </ul>
      <p>
        Din <Link to="/profil">Profil</Link> poți: vedea un rezumat al datelor
        reținute, descărca un export JSON și șterge contul (self-service). Poți
        și scrie la <LegalMailto email={LEGAL_ORG.privacyEmail} /> pentru
        cereri suplimentare.
      </p>

      <h2>8. Securitate</h2>
      <p>
        Folosim HTTPS, autentificare prin Supabase, parole hash-uite și Row
        Level Security pe tabele sensibile. Nicio măsură nu e 100% garantată;
        raportează incidente la{" "}
        <LegalMailto email={LEGAL_ORG.privacyEmail} />.
      </p>

      <h2>9. Modificări</h2>
      <p>
        Putem actualiza această politică. Data din antet reflectă ultima
        versiune publicată pe site.
      </p>
    </LegalDocLayout>
  );
}
