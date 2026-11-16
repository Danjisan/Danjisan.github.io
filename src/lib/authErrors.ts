/**
 * Erorile Supabase Auth traduse în română.
 *
 * Regula de bază: niciun mesaj nu spune dacă un email are cont sau nu.
 * „User already registered” la înregistrare e tratat ca succes (vezi
 * `isAlreadyRegistered`), iar la login rămâne „Email sau parolă incorecte.”
 */

export type AuthErrorLike = {
  code?: string;
  message?: string;
  status?: number;
  name?: string;
} | null | undefined;

export type AuthContext = "signup" | "login" | "resend";

function code(error: AuthErrorLike): string {
  return error?.code ?? "";
}

function message(error: AuthErrorLike): string {
  return (error?.message ?? "").toLowerCase();
}

function isRateLimited(error: AuthErrorLike): boolean {
  return (
    error?.status === 429 ||
    code(error).startsWith("over_") ||
    message(error).includes("rate limit") ||
    message(error).includes("too many")
  );
}

function isNetworkError(error: AuthErrorLike): boolean {
  return (
    error?.name === "AuthRetryableFetchError" ||
    message(error).includes("failed to fetch") ||
    message(error).includes("network")
  );
}

export const CAPTCHA_FAILED_MESSAGE =
  "Verificarea anti-robot a eșuat sau a expirat. Fă-o din nou și reîncearcă.";

/** Tokenul CAPTCHA lipsește, a expirat sau a fost respins de Supabase. */
export function isCaptchaFailed(error: AuthErrorLike): boolean {
  return code(error) === "captcha_failed" || message(error).includes("captcha");
}

/** Contul există, dar emailul nu a fost confirmat (doar la login). */
export function isEmailNotConfirmed(error: AuthErrorLike): boolean {
  return (
    code(error) === "email_not_confirmed" ||
    message(error).includes("email not confirmed")
  );
}

/** La înregistrare: emailul are deja cont. */
export function isAlreadyRegistered(error: AuthErrorLike): boolean {
  return (
    code(error) === "user_already_exists" ||
    code(error) === "email_exists" ||
    message(error).includes("already registered")
  );
}

/** Mesaj în română pentru o eroare Supabase Auth. */
export function describeAuthError(
  error: AuthErrorLike,
  context: AuthContext,
): string {
  if (isNetworkError(error)) {
    return "Nu ne-am putut conecta la server. Verifică internetul și încearcă din nou.";
  }
  if (isRateLimited(error)) {
    return "Prea multe încercări. Așteaptă câteva minute și încearcă din nou.";
  }

  if (isCaptchaFailed(error)) {
    return CAPTCHA_FAILED_MESSAGE;
  }

  const c = code(error);
  if (context === "login") {
    if (isEmailNotConfirmed(error)) {
      return "Contul nu e confirmat încă. Deschide linkul din emailul de confirmare.";
    }
    return "Email sau parolă incorecte.";
  }

  if (c === "weak_password" || message(error).includes("password should")) {
    return "Parola e prea slabă. Alege una mai lungă sau mai greu de ghicit.";
  }
  if (
    c === "email_address_invalid" ||
    c === "validation_failed" ||
    message(error).includes("invalid email") ||
    message(error).includes("is invalid")
  ) {
    return "Adresa de email nu e validă.";
  }
  if (c === "signup_disabled" || c === "email_provider_disabled") {
    return "Înregistrarea e închisă momentan. Revino mai târziu.";
  }

  return context === "signup"
    ? "Nu am putut crea contul. Încearcă din nou."
    : "Nu am putut trimite emailul. Încearcă din nou.";
}
