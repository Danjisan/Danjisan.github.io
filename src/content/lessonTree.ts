import type { WorldIconId } from "../pages/lessons/world/WorldIcon";

/**
 * Structura Lumii Lecțiilor: materie → capitole → (subcapitole) → lecții.
 * Lecțiile se leagă prin `slug` de tabelul `lessons` din Supabase.
 * Lecțiile publicate care nu apar aici se afișează direct în materia lor (după `category`).
 */

export interface LessonLeaf {
  kind: "lesson";
  slug: string;
  /** Iconița pătratului; lipsă → glifa template-ului */
  icon?: WorldIconId;
}

export interface ChapterNode {
  kind: "chapter";
  /** Folosit în URL: /lectii/capitol/<materie>/<id>/... */
  id: string;
  title: string;
  description: string;
  icon: WorldIconId;
  children: TreeNode[];
}

export type TreeNode = ChapterNode | LessonLeaf;

export interface Subject {
  id: string;
  title: string;
  /** Valoarea `category` din tabelul `lessons` */
  category: string;
  children: TreeNode[];
}

export const SUBJECTS: Subject[] = [
  {
    id: "biologie",
    title: "Biologie",
    category: "Biologie",
    children: [
      {
        kind: "chapter",
        id: "microorganisme",
        title: "Microorganisme",
        description: "Lumea vie pe care n-o vezi cu ochiul liber: bacterii, forme și cum le recunoști.",
        icon: "microbe",
        children: [{ kind: "lesson", slug: "bacterii-morfologie", icon: "microbe" }],
      },
      {
        kind: "chapter",
        id: "plante",
        title: "Plante",
        description: "Cum crește o plantă și de ce are nevoie: lumină, apă, sol și răbdare.",
        icon: "plant",
        children: [{ kind: "lesson", slug: "planta-tamagotchi", icon: "sprout" }],
      },
    ],
  },
  {
    id: "fizica",
    title: "Fizică",
    category: "Fizică",
    children: [
      {
        kind: "chapter",
        id: "electricitate",
        title: "Electricitate",
        description: "Baterii, fire, becuri și LED-uri: construiește circuite și vezi cum circulă curentul.",
        icon: "bolt",
        children: [
          { kind: "lesson", slug: "primul-circuit", icon: "bulb" },
        ],
      },
    ],
  },
  {
    id: "chimie",
    title: "Chimie",
    category: "Chimie",
    children: [
      {
        kind: "chapter",
        id: "reactii-chimice",
        title: "Reacții chimice",
        description: "Amestecă substanțe și observă ce se transformă: bule, gaze, culori.",
        icon: "flask",
        children: [{ kind: "lesson", slug: "reactii-chimice-simple", icon: "molecule" }],
      },
    ],
  },
];

export function findSubject(id: string | null | undefined): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

/** Găsește lanțul de capitole pentru `ids` (ex. ["electricitate"]); null dacă un id lipsește. */
export function resolveChapterPath(subject: Subject, ids: string[]): ChapterNode[] | null {
  const path: ChapterNode[] = [];
  let level: TreeNode[] = subject.children;
  for (const id of ids) {
    const next = level.find((n): n is ChapterNode => n.kind === "chapter" && n.id === id);
    if (!next) return null;
    path.push(next);
    level = next.children;
  }
  return path;
}

/** Toate slug-urile din arbore (pentru a găsi lecțiile neîncadrate). */
export function collectSlugs(nodes: TreeNode[], out: Set<string> = new Set()): Set<string> {
  for (const n of nodes) {
    if (n.kind === "lesson") out.add(n.slug);
    else collectSlugs(n.children, out);
  }
  return out;
}

export function subjectUrl(subjectId: string): string {
  return `/lectii?m=${subjectId}`;
}

export function chapterUrl(subjectId: string, chapterIds: string[]): string {
  return `/lectii/capitol/${[subjectId, ...chapterIds].join("/")}`;
}

/** Unde te întorci din lecție: capitolul care o conține, altfel materia (după `category`), altfel /lectii. */
export function lessonBackUrl(slug: string, category?: string | null): string {
  for (const subject of SUBJECTS) {
    const ids = findChapterIds(subject.children, slug);
    if (ids) return ids.length ? chapterUrl(subject.id, ids) : subjectUrl(subject.id);
  }
  const bySubject = SUBJECTS.find((s) => s.category === category);
  return bySubject ? subjectUrl(bySubject.id) : "/lectii";
}

function findChapterIds(nodes: TreeNode[], slug: string): string[] | null {
  for (const n of nodes) {
    if (n.kind === "lesson") {
      if (n.slug === slug) return [];
    } else {
      const inner = findChapterIds(n.children, slug);
      if (inner) return [n.id, ...inner];
    }
  }
  return null;
}
