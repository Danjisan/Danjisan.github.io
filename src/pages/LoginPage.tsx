import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import ResendConfirmation from "../components/ResendConfirmation";
import { describeAuthError, isEmailNotConfirmed } from "../lib/authErrors";
import { authPath, safeNextPath } from "../lib/safeNextPath";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justReset = searchParams.get("reset") === "1";
  const next = safeNextPath(searchParams.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setUnconfirmed(false);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      // Supabase spune „neconfirmat” doar când parola e corectă, deci
      // mesajul nu dezvăluie dacă emailul are cont.
      setUnconfirmed(isEmailNotConfirmed(error));
      setError(describeAuthError(error, "login"));
    } else {
      navigate(next);
    }
  }

  return (
    <section className="page page-center">
      <div className="auth-card">
        <h1>Intră în cont</h1>
        {justReset && (
          <p className="auth-info">
            Parola a fost schimbată. Intră în cont cu parola nouă.
          </p>
        )}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Email
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </label>
          <label className="auth-label">
            Parolă
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          <p className="auth-inline-link">
            <Link to="/forgot-password" className="auth-link">
              Am uitat parola?
            </Link>
          </p>
          {error && <p className="auth-error">{error}</p>}
          {unconfirmed && <ResendConfirmation email={email} />}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Se încarcă…" : "Intră în cont"}
          </button>
        </form>
        <p className="auth-footer">
          Nu ai cont?{" "}
          <Link to={authPath("register", next)} className="auth-link">
            Înregistrează-te
          </Link>
        </p>
        <p className="auth-footer">
          Nu mai știi dacă ai cont? Folosește{" "}
          <Link to="/forgot-password" className="auth-link">
            „Am uitat parola”
          </Link>
          : dacă adresa are cont, primești un link pe email.
        </p>
      </div>
    </section>
  );
}
