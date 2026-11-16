import { useEffect, useRef, useState } from "react";
import { loadTurnstile, TURNSTILE_SITE_KEY } from "../lib/turnstile";

interface CaptchaWidgetProps {
  onToken: (token: string | null) => void;
  /** Când se schimbă, widget-ul e redesenat (token nou). */
  resetKey: number;
}

/** Verificarea anti-robot Cloudflare Turnstile. */
export default function CaptchaWidget({ onToken, resetKey }: CaptchaWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | null = null;
    setLoadFailed(false);
    onTokenRef.current(null);

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          language: "ro",
          theme: "dark",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        });
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [resetKey, attempt]);

  return (
    <div className="auth-captcha">
      <div ref={containerRef} />
      {loadFailed && (
        <p className="auth-error">
          Verificarea anti-robot nu s-a putut încărca. Dacă folosești un
          blocator de reclame, oprește-l pentru acest site, apoi{" "}
          <button
            type="button"
            className="auth-link-button"
            onClick={() => setAttempt((a) => a + 1)}
          >
            încearcă din nou
          </button>
          .
        </p>
      )}
    </div>
  );
}
