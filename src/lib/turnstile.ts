/**
 * Cloudflare Turnstile (CAPTCHA) pentru formularele de autentificare.
 *
 * Fără `VITE_TURNSTILE_SITE_KEY` CAPTCHA e oprit în client și formularele
 * merg ca înainte. Ordinea la pornire: întâi cheia în build (site live cu
 * widget-ul vizibil), abia apoi „Enable Captcha protection” în Supabase —
 * altfel Supabase cere tokenul și nimeni nu se mai poate loga.
 */

export const TURNSTILE_SITE_KEY =
  (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined)?.trim() ?? "";

export const CAPTCHA_ENABLED = TURNSTILE_SITE_KEY !== "";

const SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export type TurnstileRenderOptions = {
  sitekey: string;
  language?: string;
  theme?: "auto" | "light" | "dark";
  callback?: (token: string) => void;
  "expired-callback"?: () => void;
  "error-callback"?: () => void;
};

export type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let loading: Promise<TurnstileApi> | null = null;

/** Încarcă scriptul Turnstile o singură dată, la prima nevoie. */
export function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;

  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile indisponibil"));
    };
    script.onerror = () => reject(new Error("Turnstile nu s-a încărcat"));
    document.head.appendChild(script);
  }).catch((err: unknown) => {
    // Permite o nouă încercare (ex. după ce utilizatorul oprește adblock-ul).
    loading = null;
    document.querySelector(`script[src="${SCRIPT_URL}"]`)?.remove();
    throw err;
  });

  return loading;
}
