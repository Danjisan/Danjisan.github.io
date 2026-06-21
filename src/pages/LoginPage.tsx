import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError("Email sau parolă incorecte.");
    } else {
      navigate("/");
    }
  }

  return (
    <section className="page page-center">
      <div className="auth-card">
        <h1>Intră în cont</h1>
        {justRegistered && (
          <p className="auth-info">
            Cont creat! Verifică emailul și confirmă adresa, apoi loghează-te.
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
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Se încarcă…" : "Intră în cont"}
          </button>
        </form>
        <p className="auth-footer">
          Nu ai cont?{" "}
          <Link to="/register" className="auth-link">
            Înregistrează-te
          </Link>
        </p>
      </div>
    </section>
  );
}
