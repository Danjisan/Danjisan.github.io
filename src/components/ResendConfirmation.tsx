import { useEffect, useState } from "react";
import { getAuthConfirmRedirectTo } from "../lib/authOrigin";
import { describeAuthError } from "../lib/authErrors";
import { supabase } from "../lib/supabase";

const COOLDOWN_SECONDS = 60;

/**
 * Buton „Retrimite emailul de confirmare”. Mesajul de succes e același
 * indiferent dacă emailul are cont neconfirmat sau nu, ca să nu dezvăluim
 * ce adrese sunt înregistrate.
 */
export default function ResendConfirmation({ email }: { email: string }) {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [sending, setSending] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [secondsLeft]);

  async function handleResend() {
    const address = email.trim();
    if (!address) return;
    setSending(true);
    setInfo(null);
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: address,
      options: { emailRedirectTo: getAuthConfirmRedirectTo() },
    });
    setSending(false);

    if (resendError) {
      setError(describeAuthError(resendError, "resend"));
      return;
    }
    setInfo("Am trimis din nou emailul de confirmare. Verifică și folderul Spam.");
    setSecondsLeft(COOLDOWN_SECONDS);
  }

  return (
    <div className="auth-resend">
      <button
        type="button"
        className="auth-link-button"
        onClick={() => void handleResend()}
        disabled={sending || secondsLeft > 0 || !email.trim()}
      >
        {sending
          ? "Se trimite…"
          : secondsLeft > 0
            ? `Retrimite emailul de confirmare (${secondsLeft}s)`
            : "Retrimite emailul de confirmare"}
      </button>
      {info && <p className="auth-info">{info}</p>}
      {error && <p className="auth-error">{error}</p>}
    </div>
  );
}
