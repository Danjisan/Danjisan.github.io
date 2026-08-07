/**
 * Date juridice ColabMe — completați / actualizați aici.
 * Orice valoare care începe cu "[COMPLETAȚI:" apare evidențiată pe site.
 * Nu este consultanță juridică; textele legale sunt șablon tehnic.
 *
 * PIN — LEGAL REVIEW: după publicarea din Aug 2026, recitiți Privacy /
 * Cookies / Termeni + legalOrg (diacritice, retenție, minori) și bifați
 * checklist-ul din docs/COLABME.md → „PIN — Legal review”.
 */

export const LEGAL_ORG = {
  /** Denumirea legală completă */
  legalName: "Asociația ColabME (Colaborare Modulară Evolutivă)",

  /** CUI / CIF */
  registrationId: "CUI 54074414",

  /** Adresa sediului */
  address:
    "Str. Dunării, Bl. S3, Sc. B, Ap. 4, Alexandria, județul Teleorman, România",

  /** Email contact general */
  contactEmail: "contact@colabme.eu",

  /** Email pentru cereri GDPR (poate fi același) */
  privacyEmail: "contact@colabme.eu",

  /** Persoană de contact pentru protecția datelor */
  dpoOrContactName:
    "George-Daniel Cerchează — persoană de contact pentru protecția datelor",

  /** Site oficial */
  siteUrl: "https://colabme.eu",

  /** Data ultimei actualizări a textelor */
  policiesUpdatedAt: "2026-08-07",
} as const;

export type LegalOrgKey = keyof typeof LEGAL_ORG;

export function isLegalPlaceholder(value: string): boolean {
  return value.trimStart().startsWith("[COMPLETAȚI:");
}

/** True dacă mai există câmpuri ONG necompletate (în afară de siteUrl / dată). */
export function hasIncompleteLegalOrg(): boolean {
  const skip: LegalOrgKey[] = ["siteUrl", "policiesUpdatedAt"];
  return (Object.keys(LEGAL_ORG) as LegalOrgKey[]).some(
    (key) => !skip.includes(key) && isLegalPlaceholder(LEGAL_ORG[key]),
  );
}
