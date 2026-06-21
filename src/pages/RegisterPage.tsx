import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      // Supabase trimite email de confirmare; redirecționăm spre login
      navigate("/login?registered=1");
    }
  }

  return (
    <section className="page page-center">
      <div className="auth-card">
        <h1>Cont nou</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Nume afișat
            <input
              type="text"
              className="auth-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              autoComplete="nickname"
            />
          </label>
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
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Se creează contul…" : "Creează cont"}
          </button>
        </form>
        <p className="auth-footer">
          Ai deja cont?{" "}
          <Link to="/login" className="auth-link">
            Intră în cont
          </Link>
        </p>
      </div>
    </section>
  );
}
