import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "../lib/authPassword";
import ResendConfirmation from "../components/ResendConfirmation";
import { describeAuthError, isAlreadyRegistered } from "../lib/authErrors";
import { getAuthConfirmRedirectTo } from "../lib/authOrigin";
import { authPath, safeNextPath } from "../lib/safeNextPath";
import { supabase } from "../lib/supabase";
import type { UserRole } from "../lib/types";

const ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: "elev", label: "Elev", description: "Accesezi lecții și concursuri" },
  { value: "profesor", label: "Profesor", description: "Creezi conținut și moderezi sesiuni (după verificare)" },
  { value: "parinte", label: "Părinte", description: "Urmărești activitatea elevului" },
  { value: "anonim", label: "Vizitator", description: "Acces limitat, fără școală" },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("elev");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [ageOk, setAgeOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!acceptTerms) {
      setError("Trebuie să accepți Termenii și Politica de confidențialitate.");
      return;
    }
    if (!ageOk) {
      setError(
        "Confirmă că ai cel puțin 16 ani sau că un părinte/tutore este de acord.",
      );
      return;
    }

    const passwordError = validateNewPassword(password, password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getAuthConfirmRedirectTo(),
        data: {
          display_name: displayName,
          // Doar o cerere: trigger-ul din DB acceptă elev / parinte / anonim,
          // iar „profesor” rămâne în așteptare până la aprobarea unui admin.
          requested_role: role,
          accepted_terms_at: new Date().toISOString(),
          age_or_guardian_confirmed: true,
        },
      },
    });

    setLoading(false);

    // Email deja înregistrat: arătăm același ecran ca la succes, ca să nu
    // dezvăluim ce adrese au cont. (Cu „Confirm email” pornit, Supabase
    // oricum nu întoarce eroare în cazul ăsta.)
    if (signUpError && !isAlreadyRegistered(signUpError)) {
      setError(describeAuthError(signUpError, "signup"));
      return;
    }

    if (data?.session) {
      navigate(next);
      return;
    }

    setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <section className="page page-center">
        <div className="auth-card">
          <h1>Verifică-ți emailul</h1>
          <p className="auth-hint">
            Ți-am trimis un link de confirmare la <strong>{sentTo}</strong>.
            Deschide-l ca să activezi contul (verifică și folderul Spam), apoi
            intră în cont.
          </p>
          <ResendConfirmation email={sentTo} />
          <p className="auth-footer">
            Ai deja cont cu acest email? Nu primești un mail nou —{" "}
            <Link to="/forgot-password" className="auth-link">
              folosește „Am uitat parola”
            </Link>
            .
          </p>
          <p className="auth-footer">
            <Link to={authPath("login", next)} className="auth-link">
              Mergi la login
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-center">
      <div className="auth-card auth-card-wide">
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
              minLength={MIN_PASSWORD_LENGTH}
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
            {role === "profesor" && (
              <p className="auth-hint">
                Contul de profesor se activează după ce îl verificăm. Până
                atunci poți folosi platforma ca vizitator.
              </p>
            )}
          </fieldset>

          <label className="auth-check">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              required
            />
            <span>
              Am citit și accept{" "}
              <Link to="/termeni" className="auth-link" target="_blank" rel="noreferrer">
                Termenii
              </Link>{" "}
              și{" "}
              <Link to="/privacy" className="auth-link" target="_blank" rel="noreferrer">
                Politica de confidențialitate
              </Link>
              .
            </span>
          </label>

          <label className="auth-check">
            <input
              type="checkbox"
              checked={ageOk}
              onChange={(e) => setAgeOk(e.target.checked)}
              required
            />
            <span>
              Confirm că am cel puțin 16 ani sau că un părinte / tutore este de
              acord cu crearea acestui cont.
            </span>
          </label>

          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Se creează contul…" : "Creează cont"}
          </button>
        </form>
        <p className="auth-footer">
          Ai deja cont?{" "}
          <Link to={authPath("login", next)} className="auth-link">
            Intră în cont
          </Link>
        </p>
      </div>
    </section>
  );
}
