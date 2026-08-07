/** Minimum length aligned with registration and OWASP length-over-complexity guidance. */
export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(
  password: string,
  confirm: string,
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Parola trebuie să aibă cel puțin ${MIN_PASSWORD_LENGTH} caractere.`;
  }
  if (password !== confirm) {
    return "Parolele nu coincid.";
  }
  return null;
}
