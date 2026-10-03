import { Link, useSearchParams } from "react-router-dom";
import ColabMeLogo from "../components/ColabMeLogo";

const AXES = [
  ["DIGITAL", "REAL"],
  ["TEORIE", "PRACTICĂ"],
  ["SOCIAL", "ECONOMIC"],
] as const;

const PILLARS = [
  {
    id: "co",
    word: "Co",
    title: "Comunitate și colaborare",
    paragraphs: [
      "Conținutul se construiește împreună. Profesorii, elevii și partenerii lucrează pe platformă: propun lecții, le discută și le îmbunătățesc. Partea socială este modul în care apare materialul educațional.",
      "Conținutul educațional publicat aici este open source. Poate fi folosit, adaptat și dus mai departe, ca următorii să pornească de la ce există deja.",
    ],
  },
  {
    id: "lab",
    word: "lab",
    title: "Laboratorul virtual",
    paragraphs: [
      "Teoria se verifică în simulator, înainte de lumea reală. Lecțiile folosesc laboratoare virtuale în care repeți un experiment, schimbi o variabilă și vezi ce se întâmplă — fără costul și riscul din teren.",
    ],
  },
  {
    id: "me",
    word: "Me",
    title: "Modular evolution",
    paragraphs: [
      "Ce testezi virtual continuă în aplicații practice. Modular evolution înseamnă că fiecare lecție, experiment sau proiect este un modul care se leagă de următorul.",
      "Circuitul se întoarce în comunități și pe ColabMe. Universitățile și profesorii parteneri folosesc ce se întâmplă în teren ca să îmbunătățească lecțiile, laboratoarele și platforma.",
    ],
  },
] as const;

export default function HomePage() {
  const [params] = useSearchParams();
  const deleted = params.get("deleted") === "1";

  return (
    <section className="home">
      {deleted && (
        <p className="auth-info" role="status">
          Contul și datele asociate au fost șterse. Ne pare rău să te vedem
          plecând — poți crea oricând un cont nou.
        </p>
      )}

      <header className="home-intro">
        <div className="home-brand">
          <ColabMeLogo className="colabme-logo--hero" />
        </div>

        <h1 className="home-lead">
          Un proces complet de educație, de la teorie și practică în mediul
          virtual la aplicații practice în lumea reală.
        </h1>

        <p className="home-triad" aria-label="Co, lab, Me">
          <span className="home-triad-word home-triad-word--co">Co</span>
          <span className="home-triad-sep" aria-hidden="true">
            –
          </span>
          <span className="home-triad-word home-triad-word--lab">lab</span>
          <span className="home-triad-sep" aria-hidden="true">
            –
          </span>
          <span className="home-triad-word home-triad-word--me">Me</span>
        </p>

        <p className="home-intro-copy">
          Conținut educațional realizat prin colaborare în platforma ColabMe și
          în laboratoare virtuale, folosite pentru a testa experimente și
          situații cu aplicații în lumea reală.
        </p>
      </header>

      {PILLARS.map((pillar) => (
        <section
          key={pillar.id}
          className={`home-pillar home-pillar--${pillar.id}`}
        >
          <p className="home-pillar-word">{pillar.word}</p>
          <h2 className="home-pillar-title">{pillar.title}</h2>
          {pillar.paragraphs.map((paragraph) => (
            <p key={paragraph} className="home-copy">
              {paragraph}
            </p>
          ))}
        </section>
      ))}

      <section className="home-axes" aria-label="Cele trei axe ColabMe">
        <p className="home-axes-caption">
          Un proiect pe trei axe interconectate.
        </p>
        <ul className="home-axes-list">
          {AXES.map(([left, right]) => (
            <li key={left} className="home-axis">
              <span className="home-axis-pole">{left}</span>
              <span className="home-axis-link" aria-hidden="true">
                ⇔
              </span>
              <span className="home-axis-pole">{right}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="home-cta">
        Poți afla mai multe pe pagina <Link to="/roadmap">Roadmap</Link> sau
        poți încerca ce există deja în <Link to="/lectii">Lumea Lecțiilor</Link>{" "}
        și în <Link to="/lobby">Lumea Online</Link>.
      </p>

      <section className="home-block home-block--why">
        <h2 className="home-heading">De ce facem asta?</h2>
        <p className="home-copy">
          Pentru că vrem să trăim într-o lume mai bună, iar nivelul de educație
          al societății determină nivelul ei de trai.
        </p>
      </section>
    </section>
  );
}
