import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "../lib/authPassword";
import { supabase } from "../lib/supabase";

type Gate = "checking" | "ready" | "invalid";

const RECOVERY_FLAG_KEY = "colabme_password_recovery";

/** True when the URL still carries an auth redirect (recovery / PKCE). */
function urlHasAuthRedirectParams(): boolean {
  const hash = window.location.hash.replace(/^#/, "");
  const hashParams = new URLSearchParams(hash);
  const query = new URLSearchParams(window.location.search);
  return (
    hashParams.get("type") === "recovery" ||
    query.get("type") === "recovery" ||
    Boolean(hashParams.get("access_token")) ||
    Boolean(query.get("code"))
  );
}

function markRecoveryIntent() {
  try {
    sessionStorage.setItem(RECOVERY_FLAG_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

function consumeRecoveryIntent(): boolean {
  try {
    const ok = sessionStorage.getItem(RECOVERY_FLAG_KEY) === "1";
    sessionStorage.removeItem(RECOVERY_FLAG_KEY);
    return ok;
  } catch {
    return false;
  }
}

function hasRecoveryIntent(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [gate, setGate] = useState<Gate>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let settled = false;
    let timeoutId = 0;

    if (urlHasAuthRedirectParams()) markRecoveryIntent();

    function markReady() {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      consumeRecoveryIntent();
      setGate("ready");
    }

    function markInvalid() {
      if (settled) return;
      settled = true;
      consumeRecoveryIntent();
      setGate("invalid");
    }

    // Listener first so we do not miss PASSWORD_RECOVERY during URL exchange.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") markReady();
    });

    void (async () => {
      const { data } = await supabase.auth.getSession();
      // After PKCE exchange the URL is often cleaned; keep intent in sessionStorage.
      if (data.session && (urlHasAuthRedirectParams() || hasRecoveryIntent())) {
        markReady();
        return;
      }

      timeoutId = window.setTimeout(() => {
        void supabase.auth.getSession().then(({ data: later }) => {
          if (
            later.session &&
            (urlHasAuthRedirectParams() || hasRecoveryIntent())
          ) {
            markReady();
          } else {
            markInvalid();
          }
        });
      }, 2500);
    })();

    return () => {
      window.clearTimeout(timeoutId);
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateNewPassword(password, confirm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setLoading(false);
      setError(
        updateError.message.toLowerCase().includes("session")
          ? "Linkul a expirat sau e invalid. Cere unul nou."
          : "Nu am putut salva parola. Încearcă din nou.",
      );
      return;
    }

    // End recovery session; user must sign in with the new password.
    await supabase.auth.signOut({ scope: "global" });
    setLoading(false);
    navigate("/login?reset=1", { replace: true });
  }

  if (gate === "checking") {
    return (
      <section className="page page-center">
        <div className="auth-card">
          <h1>Resetare parolă</h1>
          <p className="auth-hint">Verificăm linkul…</p>
        </div>
      </section>
    );
  }

  if (gate === "invalid") {
    return (
      <section className="page page-center">
        <div className="auth-card">
          <h1>Link invalid sau expirat</h1>
          <p className="auth-hint">
            Cere un link nou de resetare. Linkurile vechi nu mai pot fi
            refolosite.
          </p>
          <p className="auth-footer">
            <Link to="/forgot-password" className="auth-link">
              Am uitat parola
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page page-center">
      <div className="auth-card">
        <h1>Parolă nouă</h1>
        <p className="auth-hint">
          Alege o parolă de cel puțin {MIN_PASSWORD_LENGTH} caractere. După
          salvare te autentifici din nou.
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Parolă nouă
            <input
              type="password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
              autoFocus
            />
          </label>
          <label className="auth-label">
            Confirmă parola
            <input
              type="password"
              className="auth-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={MIN_PASSWORD_LENGTH}
              autoComplete="new-password"
            />
          </label>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Se salvează…" : "Salvează parola"}
          </button>
        </form>
      </div>
    </section>
  );
}
