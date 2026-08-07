import { useSearchParams } from "react-router-dom";

export default function HomePage() {
  const [params] = useSearchParams();
  const deleted = params.get("deleted") === "1";

  return (
    <section className="hero">
      {deleted && (
        <p className="auth-info" role="status">
          Contul și datele asociate au fost șterse. Ne pare rău să te vedem
          plecând — poți crea oricând un cont nou.
        </p>
      )}
      <p className="hero-badge">Work in progress</p>
      <h1 className="hero-title">
        Salut, aici e <span className="accent">ColabMe</span>.
      </h1>
      <p className="hero-subtitle">
        Site-ul e în construcție. În curând: proiecte, experimente și mai
        multe.
      </p>
    </section>
  );
}
