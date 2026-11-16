import { useCallback, useState } from "react";
import { CAPTCHA_ENABLED } from "../lib/turnstile";

/**
 * Starea CAPTCHA pentru un formular. Tokenul Turnstile se poate folosi o
 * singură dată, deci după fiecare cerere către Supabase (reușită sau nu)
 * se apelează `reset()`, care redesenează widget-ul.
 */
export function useCaptcha() {
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  const reset = useCallback(() => {
    setToken(null);
    setResetKey((k) => k + 1);
  }, []);

  return {
    enabled: CAPTCHA_ENABLED,
    /** Formularul poate fi trimis (CAPTCHA oprit sau rezolvat). */
    ready: !CAPTCHA_ENABLED || token !== null,
    /** De pus în `options.captchaToken` la apelurile Supabase Auth. */
    captchaToken: token ?? undefined,
    reset,
    widgetProps: { onToken: setToken, resetKey },
  };
}
