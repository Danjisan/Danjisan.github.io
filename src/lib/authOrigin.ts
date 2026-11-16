/**
 * Origins allowed for auth email redirects. Lista trebuie să fie identică
 * cu Supabase Dashboard → Authentication → URL Configuration (Redirect URLs,
 * cu `/auth/confirm` la final). Orice alt origin cade pe colabme.eu.
 */
const ALLOWED_ORIGINS = new Set([
  "https://colabme.eu",
  "https://www.colabme.eu",
  "http://localhost:5173",
]);

/** Safe site origin for password-recovery redirectTo. */
export function getAuthRedirectOrigin(): string {
  const origin = window.location.origin;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return "https://colabme.eu";
}

/**
 * Ținta linkurilor din emailuri (confirmare cont, resetare parolă).
 * Șabloanele Supabase construiesc linkul ca
 * `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=…`
 * — vezi docs/auth-email-templates.md.
 */
export function getAuthConfirmRedirectTo(): string {
  return `${getAuthRedirectOrigin()}/auth/confirm`;
}
