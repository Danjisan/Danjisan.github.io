import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../lib/types";

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "elev", label: "Elev", description: "Accesezi lecții și concursuri" },
  { value: "profesor", label: "Profesor", description: "Creezi conținut și moderezi sesiuni" },
  { value: "parinte", label: "Părinte", description: "Urmărești activitatea elevului" },
  { value: "anonim", label: "Vizitator", description: "Acces limitat, fără școală" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("elev");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? "Eroare la creare cont.");
      setLoading(false);
      return;
    }

    // Actualizăm rolul în profil (trigger-ul creează profilul cu rol 'anonim')
    await supabase
      .from("user_profiles")
      .update({ role })
      .eq("id", data.user.id);

    setLoading(false);

    if (data.session) {
      navigate("/");
    } else {
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
          <fieldset className="auth-role-fieldset">
            <legend className="auth-label">Tip cont</legend>
            <div className="auth-role-grid">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={`auth-role-card ${role === r.value ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                  />
                  <span className="auth-role-label">{r.label}</span>
                  <span className="auth-role-desc">{r.description}</span>
                </label>
              ))}
            </div>
          </fieldset>
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
