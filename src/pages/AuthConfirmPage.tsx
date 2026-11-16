import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { markRecoveryIntent, parseConfirmLink } from "../lib/authRecovery";
import { supabase } from "../lib/supabase";

/**
 * Ținta linkurilor din emailuri (confirmare cont, resetare parolă).
 *
 * Tokenul se verifică abia la click pe buton, nu la încărcarea paginii:
 * filtrele de email (ex. Microsoft 365 la școli) deschid automat linkurile
 * și altfel ar consuma tokenul înaintea omului. `verifyOtp` cu `token_hash`
 * nu depinde de browserul din care s-a făcut cererea, deci linkul merge și
 * deschis pe alt dispozitiv.
 */
export default function AuthConfirmPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const link = parseConfirmLink(search);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleConfirm() {
    if (!link) return;
    setLoading(true);
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: link.tokenHash,
      type: link.type,
    });
    setLoading(false);

    if (error || !data.session) {
      setFailed(true);
      return;
    }

    if (link.type === "recovery") {
      markRecoveryIntent();
      navigate("/reset-password", { replace: true });
      return;
    }

    // Scoate tokenul din bara de adrese / istoric.
    navigate("/auth/confirm", { replace: true });
    setConfirmed(true);
  }

  if (confirmed) {
    return (
      <section className="page page-center">
        <div className="auth-card">
          <h1>Email confirmat</h1>
          <p className="auth-hint">Contul tău e activ și ești autentificat.</p>
          <p className="auth-footer">
            <Link to="/" className="auth-link">
              Mergi la pagina principală
            </Link>
          </p>
        </div>
      </section>
    );
  }

  if (!link || failed) {
    const isRecovery = link?.type === "recovery";
    return (
      <section className="page page-center">
        <div className="auth-card">
          <h1>Link invalid sau expirat</h1>
          <p className="auth-hint">
            Linkul a fost deja folosit, a expirat sau e incomplet.{" "}
            {isRecovery
              ? "Cere un link nou de resetare."
              : "Încearcă să te autentifici; dacă nu merge, scrie-ne din pagina de contact."}
          </p>
          <p className="auth-footer">
            {isRecovery ? (
              <Link to="/forgot-password" className="auth-link">
                Am uitat parola
              </Link>
            ) : (
              <Link to="/login" className="auth-link">
                Mergi la login
              </Link>
            )}
          </p>
        </div>
      </section>
    );
  }

  const isRecovery = link.type === "recovery";
  return (
    <section className="page page-center">
      <div className="auth-card">
        <h1>{isRecovery ? "Resetare parolă" : "Confirmă adresa de email"}</h1>
        <p className="auth-hint">
          {isRecovery
            ? "Apasă butonul ca să alegi o parolă nouă."
            : "Apasă butonul ca să activezi contul ColabMe."}
        </p>
        <button
          type="button"
          className="auth-submit"
          onClick={() => void handleConfirm()}
          disabled={loading}
        >
          {loading
            ? "Se verifică…"
            : isRecovery
              ? "Continuă"
              : "Confirmă emailul"}
        </button>
      </div>
    </section>
  );
}
