export type MilestoneStatus = "done" | "in-progress" | "planned";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  /** Cale către imagine, ex. "/roadmap/concept.webp" (fișier pus în public/roadmap/) */
  image?: string;
}

/**
 * Milestone-urile roadmap-ului, în ordinea de pe drum.
 * Adaugă / editează intrări aici — pagina se actualizează automat.
 */
export const MILESTONES: Milestone[] = [
  {
    id: "concept",
    title: "Idee & concept",
    description:
      "Definirea conceptului ColabMe și a direcției proiectului. Placeholder — editează textul ăsta.",
    status: "done",
  },
  {
    id: "site",
    title: "Site-ul public",
    description:
      "Prima versiune a site-ului: structură, meniu, pagini de bază. Placeholder — editează textul ăsta.",
    status: "in-progress",
  },
  {
    id: "login",
    title: "Conturi & login",
    description:
      "Autentificare prin serviciu extern (BaaS). Placeholder — editează textul ăsta.",
    status: "planned",
  },
  {
    id: "profiles",
    title: "Profiluri",
    description:
      "Profiluri de utilizator. Placeholder — editează textul ăsta.",
    status: "planned",
  },
  {
    id: "collab",
    title: "Colaborare",
    description:
      "Funcțiile principale de colaborare. Placeholder — editează textul ăsta.",
    status: "planned",
  },
  {
    id: "launch",
    title: "Lansare oficială",
    description: "Versiunea 1.0, publică. Placeholder — editează textul ăsta.",
    status: "planned",
  },
];
