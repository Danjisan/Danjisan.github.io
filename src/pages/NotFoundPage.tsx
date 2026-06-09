import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="page page-center">
      <h1>404</h1>
      <p>Pagina asta nu există (încă).</p>
      <Link to="/" className="button-link">
        Înapoi acasă
      </Link>
    </section>
  );
}
