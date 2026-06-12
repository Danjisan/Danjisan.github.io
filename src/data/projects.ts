import type { MediaContent } from "../components/media/types";

export interface ProjectMedia {
  content: MediaContent;
  /** Raport lățime/înălțime al casetei (vezi MediaBox). */
  aspect?: number;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  media: ProjectMedia[];
}

/**
 * Proiectele afișate pe pagina Proiecte, în ordine.
 * Modelele 3D locale se pun în public/models/ și se referă ca "/models/nume.glb".
 */
export const PROJECTS: Project[] = [
  {
    id: "colby",
    name: "Colby",
    tagline: "Primul experiment 3D interactiv",
    description:
      "Placeholder — aici va veni descrierea proiectului Colby. Momentan caseta de mai jos folosește modelul de test Duck (Khronos): rotește-l cu degetul sau cu mouse-ul, dă zoom cu pinch sau scroll.",
    media: [
      {
        content: {
          kind: "model",
          src: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb",
        },
        aspect: 1,
      },
      {
        content: {
          kind: "youtube",
          videoId: "lsbWza_1iZw",
          title: "Test video Colby",
        },
      },
      {
        content: {
          kind: "image",
          src: "/branding/ColabMe-logo-white.svg",
          alt: "Logo ColabMe",
        },
      },
    ],
  },
];
