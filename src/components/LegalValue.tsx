import { isLegalPlaceholder } from "../content/legalOrg";

interface LegalValueProps {
  value: string;
}

/** Afișează o valoare ONG; evidențiază dacă e încă placeholder. */
export function LegalValue({ value }: LegalValueProps) {
  if (isLegalPlaceholder(value)) {
    return <mark className="legal-todo">{value}</mark>;
  }
  return <span>{value}</span>;
}

interface LegalMailtoProps {
  email: string;
  label?: string;
}

export function LegalMailto({ email, label }: LegalMailtoProps) {
  if (isLegalPlaceholder(email)) {
    return <mark className="legal-todo">{email}</mark>;
  }
  return <a href={`mailto:${email}`}>{label ?? email}</a>;
}
