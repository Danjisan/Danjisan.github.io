/**
 * Origins allowed for auth email redirects (must also be listed in
 * Supabase Dashboard → Authentication → URL Configuration).
 */
const ALLOWED_ORIGINS = new Set([
  "https://colabme.eu",
  "https://www.colabme.eu",
  "https://danjisan.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

/** Safe site origin for password-recovery redirectTo. */
export function getAuthRedirectOrigin(): string {
  const origin = window.location.origin;
  if (ALLOWED_ORIGINS.has(origin)) return origin;
  return "https://colabme.eu";
}

export function getPasswordResetRedirectTo(): string {
  return `${getAuthRedirectOrigin()}/reset-password`;
}
