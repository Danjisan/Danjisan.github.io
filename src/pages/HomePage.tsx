import { Link, useSearchParams } from "react-router-dom";
import ColabMeLogo from "../components/ColabMeLogo";

const AXES = [
  ["DIGITAL", "REAL"],
  ["TEORIE", "PRACTICĂ"],
  ["SOCIAL", "ECONOMIC"],
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

      <header className="home-brand">
        <ColabMeLogo className="colabme-logo--hero" />
      </header>

      <section className="home-block home-block--why">
        <h1 className="home-heading">De ce facem asta?</h1>
        <p className="home-copy">
          Pentru că vrem să trăim într-o lume mai bună, iar nivelul de educație
          al societății determină nivelul ei de trai.
        </p>
      </section>

      <section className="home-block home-block--what">
        <h2 className="home-heading">Ce este ColabMe?</h2>
        <p className="home-copy">
          ColabMe este o platformă educațională care leagă teoria de practică,
          de la mediul virtual până la aplicații în lumea reală.
        </p>
      </section>

      <section className="home-axes" aria-label="Cele trei axe ColabMe">
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
        <p className="home-axes-caption">
          Un proiect pe trei axe interconectate.
        </p>
      </section>

      <p className="home-cta">
        Poți afla mai multe pe pagina{" "}
        <Link to="/roadmap">Roadmap</Link> sau poți încerca ce există deja în{" "}
        <Link to="/lectii">Lumea Lecțiilor</Link> și în{" "}
        <Link to="/lobby">Lumea Online</Link>.
      </p>
    </section>
  );
}
