import { Link } from "react-router-dom";
import LegalDocLayout from "../../components/LegalDocLayout";
import { LegalMailto, LegalValue } from "../../components/LegalValue";
import { LEGAL_ORG } from "../../content/legalOrg";

export default function TermsPage() {
  return (
    <LegalDocLayout title="Termeni și condiții">
      <p className="legal-meta">
        Ultima actualizare: {LEGAL_ORG.policiesUpdatedAt} ·{" "}
        <LegalValue value={LEGAL_ORG.legalName} />
      </p>

      <h2>1. Acceptarea termenilor</h2>
      <p>
        Folosind ColabMe ({LEGAL_ORG.siteUrl}) accepți acești termeni și{" "}
        <Link to="/privacy">Politica de confidențialitate</Link>. Dacă nu ești
        de acord, nu crea un cont și nu folosi zonele autentificate.
      </p>

      <h2>2. Serviciul</h2>
      <p>
        ColabMe este o platformă educațională (lecții, laborator virtual,
        activități competitive). Platforma este în dezvoltare; funcțiile pot
        apărea, se pot schimba sau pot fi indisponibile temporar. Accesul poate
        fi gratuit, în beta / early access, sau pe bază de licențe — după
        cum anunțăm pe site.
      </p>

      <h2>3. Conturi și roluri</h2>
      <ul>
        <li>Ești responsabil pentru păstrarea parolei în siguranță.</li>
        <li>
          Rolurile (elev, profesor, părinte etc.) definesc ce poți face pe
          platformă; abuzul poate duce la suspendarea contului.
        </li>
        <li>
          Informațiile pe care le introduci (inclusiv în chat) trebuie să fie
          legale, respectuoase și adecvate unui mediu școlar.
        </li>
        <li>
          Nu te da drept altcineva și nu creezi conturi automate în masă fără
          acordul nostru.
        </li>
      </ul>

      <h2>4. Minori, școli și profesori</h2>
      <ul>
        <li>
          Dacă ai sub 16 ani, ai nevoie de acordul părintelui / tutorelui
          pentru cont (confirmat la înregistrare).
        </li>
        <li>
          Profesorii și școlile care folosesc ColabMe cu elevi sunt responsabili
          să respecte regulile interne ale școlii și consimțămintele necesare
          față de părinți / tutori.
        </li>
        <li>
          Conținutul creat de profesori (ex. întrebări) trebuie să fie
          adecvat vârstei și materiei; ne rezervăm dreptul de a-l modera.
        </li>
        <li>
          Detalii despre prelucrarea datelor: vezi{" "}
          <Link to="/privacy">Politica de confidențialitate</Link>.
        </li>
      </ul>

      <h2>5. Conținutul utilizatorilor</h2>
      <p>
        Întrebările create de profesori, mesajele din lobby și alte contribuții
        rămân asociate contului. Ne acorzi o licență neexclusivă de a le
        afișa și stoca pe platformă pentru funcționarea serviciului. Ne
        rezervăm dreptul de a modera sau elimina conținut care încalcă legea
        sau aceste reguli.
      </p>

      <h2>6. Proprietate intelectuală</h2>
      <p>
        Marca ColabMe, designul, lecțiile, textele și asset-urile create de
        asociație aparțin <LegalValue value={LEGAL_ORG.legalName} /> sau
        licențiatorilor săi. Nu redistribui, nu vinzi și nu pretinzi
        proprietatea asupra acestui conținut fără acord scris.
      </p>
      <p>
        Platforma poate folosi biblioteci open-source (ex. React, Three.js,
        Supabase client) sub licențele proprii ale autorilor — acestea rămân
        ale lor. Conținutul pe care îl încarci tu rămâne al tău, sub rezerva
        licenței de mai sus.
      </p>

      <h2>7. Limitarea răspunderii</h2>
      <p>
        Serviciul este oferit „ca atare”, în măsura permisă de lege. Nu
        garantăm disponibilitate neîntreruptă. ColabMe nu înlocuiește
        curriculumul oficial al școlii, evaluarea școlară sau sfatul unui
        cadru didactic, și nu este sfat medical sau juridic.
      </p>

      <h2>8. Încetare</h2>
      <p>
        Poți înceta folosirea oricând. Poți cere ștergerea contului la{" "}
        <LegalMailto email={LEGAL_ORG.privacyEmail} />. Putem suspenda sau
        închide conturile care încalcă termenii sau pun în pericol platforma
        ori alți utilizatori.
      </p>

      <h2>9. Contact</h2>
      <p>
        <LegalValue value={LEGAL_ORG.legalName} />
        <br />
        <LegalValue value={LEGAL_ORG.address} />
        <br />
        <LegalMailto email={LEGAL_ORG.contactEmail} />
      </p>

      <h2>10. Legea aplicabilă</h2>
      <p>
        Acești termeni sunt guvernați de legea română. Eventualele dispute se
        soluționează pe cale amiabilă; în caz contrar, sunt competente
        instanțele române de la sediul asociației (Alexandria, județul
        Teleorman), dacă legea nu prevede altfel pentru consumatori.
      </p>
    </LegalDocLayout>
  );
}
