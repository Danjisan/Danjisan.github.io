/**
 * Semnal între /auth/confirm și /reset-password: „sesiunea curentă a venit
 * dintr-un link de resetare”, ca /reset-password să nu accepte orice sesiune.
 */
const RECOVERY_FLAG_KEY = "colabme_password_recovery";

export function markRecoveryIntent() {
  try {
    sessionStorage.setItem(RECOVERY_FLAG_KEY, "1");
  } catch {
    /* private mode / blocked storage */
  }
}

export function hasRecoveryIntent(): boolean {
  try {
    return sessionStorage.getItem(RECOVERY_FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

export function consumeRecoveryIntent(): boolean {
  const ok = hasRecoveryIntent();
  try {
    sessionStorage.removeItem(RECOVERY_FLAG_KEY);
  } catch {
    /* ignore */
  }
  return ok;
}

/** Tipurile de link din email pe care le acceptă /auth/confirm. */
export type ConfirmLinkType = "signup" | "recovery";

export type ConfirmLink = { tokenHash: string; type: ConfirmLinkType };

/**
 * Citește `?token_hash=…&type=…` din linkul de email.
 * Întoarce null dacă linkul e incomplet sau are un tip pe care nu-l folosim.
 */
export function parseConfirmLink(search: string): ConfirmLink | null {
  const params = new URLSearchParams(search);
  const tokenHash = params.get("token_hash")?.trim();
  const type = params.get("type");
  if (!tokenHash) return null;
  if (type !== "signup" && type !== "recovery") return null;
  return { tokenHash, type };
}
