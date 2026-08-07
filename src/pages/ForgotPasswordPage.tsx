import { useState } from "react";
import { Link } from "react-router-dom";
import { getPasswordResetRedirectTo } from "../lib/authOrigin";
import { supabase } from "../lib/supabase";

/** Anti-enumeration + basic client throttle after a successful request. */
const RESEND_COOLDOWN_MS = 60_000;

const GENERIC_SUCCESS =
  "Dacă există un cont cu acest email, vei primi un link de resetare. Verifică și folderul Spam.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (Date.now() < cooldownUntil) {
      setInfo(GENERIC_SUCCESS);
      return;
    }

    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: getPasswordResetRedirectTo() },
    );
    setLoading(false);

    // Always show the same success copy when the request is accepted or
    // when Supabase hides whether the address exists. Surface only clear
    // operational failures (rate limit / network).
    if (resetError) {
      const msg = resetError.message.toLowerCase();
      if (msg.includes("rate") || msg.includes("too many")) {
        setError("Prea multe încercări. Așteaptă câteva minute și încearcă din nou.");
        return;
      }
      // Do not leak account existence via error text.
      setInfo(GENERIC_SUCCESS);
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      return;
    }

    setInfo(GENERIC_SUCCESS);
    setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
  }

  return (
    <section className="page page-center">
      <div className="auth-card">
        <h1>Am uitat parola</h1>
        <p className="auth-hint">
          Introdu emailul contului. Îți trimitem un link de resetare (valid o
          perioadă scurtă).
        </p>
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
              autoFocus
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          {info && <p className="auth-info">{info}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Se trimite…" : "Trimite link de resetare"}
          </button>
        </form>
        <p className="auth-footer">
          <Link to="/login" className="auth-link">
            Înapoi la login
          </Link>
        </p>
      </div>
    </section>
  );
}
