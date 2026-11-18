/**
 * Schema capitolelor de circuite (vezi docs/circuit-step2.md).
 * Doar date: capitolele pot fi mutate mai târziu în baza de date sau într-un editor.
 */

/** O piesă pusă pe masă la începutul unui pas. */
export interface BoardPart {
  id: string;
  /** Id din catalog (src/content/circuits/parts.ts) */
  part: string;
  x: number;
  y: number;
  /** Starea inițială, ex. `{ on: true }` pentru întrerupător, `{ flipped: true }` pentru LED întors */
  state?: Record<string, unknown>;
  /**
   * true = nu poate fi mutată, ștearsă sau rotită (dar poate fi folosită, ex. întrerupătorul se apasă).
   * "pinned" = nu poate fi mutată sau ștearsă, dar se poate roti (ex. un LED montat invers, de îndreptat).
   */
  locked?: boolean | "pinned";
}

/** Fundal „din viața reală” desenat sub piese (vezi components/CircuitScene.tsx). */
export type SceneId = "flashlight" | "nightlamp" | "bike";

export interface BoardSetup {
  /** Piesele stau pe un desen (lanternă, cameră…); LED-urile aprinse luminează */
  scene?: SceneId;
  parts: BoardPart[];
  /** ["bat:+", "sw:a"] */
  wires: [string, string][];
  /** Firele de la început nu se pot șterge */
  lockedWires?: boolean;
  /**
   * Doar pentru mese „stricate” (ex. LED legat invers): firele au voie să se încrucișeze, fiindcă
   * repararea chiar înseamnă inversarea lor. Masa reparată (soluția) trebuie să rămână curată.
   */
  allowCrossings?: boolean;
}

/** Ce are voie elevul să facă la un pas `try`. */
export type BoardAction = "toggle_switch" | "flip" | "pot" | "add_wire" | "remove_wire";

export type WinCondition =
  | { is: "led_on"; part?: string }
  | { is: "led_off"; part?: string }
  | { is: "motor_running"; part?: string }
  | { is: "current"; part: string; min_ma?: number; max_ma?: number }
  | { is: "brighter"; a: string; b: string }
  | { is: "no_failure" }
  | { is: "max_parts"; count: number }
  | { is: "led_burned"; part?: string }
  /** Întrerupătoarele chiar comandă LED-ul: închise → aprins, deschise → stins */
  | { is: "switch_controls"; led?: string };

export interface ConceptStep {
  kind: "concept";
  id: string;
  title?: string;
  /** Scurt: 1–2 fraze. Restul merge în `aside`. */
  text: string;
  /** Casetă „Știai că?”, închisă implicit — detalii pentru cine e curios */
  aside?: string;
  /** Circuit „viu” de privit (se simulează, nu se poate modifica) */
  board?: BoardSetup;
}

export interface PredictStep {
  kind: "predict";
  id: string;
  question: string;
  board: BoardSetup;
  options: { text: string; correct?: boolean }[];
  /** După „Pornește”: întrerupătoarele se închid și simularea pornește */
  explain_after: string;
}

export interface TryStep {
  kind: "try";
  id: string;
  goal: string;
  board: BoardSetup;
  allow: BoardAction[];
  win: WinCondition[];
  explain_after: string;
  /** Starea de după acțiune — doar pentru teste */
  solution: BoardSetup;
}

export interface BuildStep {
  kind: "build" | "fix";
  id: string;
  /** Pentru `fix`: situația din viața reală */
  story?: string;
  goal: string;
  /** Lipsă = masă goală */
  board?: BoardSetup;
  inventory: { part: string; count: number }[];
  win: WinCondition[];
  limits?: { max_burned?: number };
  /** Dezvăluite pe rând, la cerere */
  hints: string[];
  /** Doar la pașii grei: butonul „Arată-mi cum” desenează `solution` */
  help?: "show_solution";
  explain_after: string;
  solution: BoardSetup;
}

export type LessonStep = ConceptStep | PredictStep | TryStep | BuildStep;

export interface MiniLesson {
  id: string;
  title: string;
  /** XP: 1 → 10, 2 → 20, 3 → 30 */
  difficulty: 1 | 2 | 3;
  steps: LessonStep[];
  /** Ce ai învățat — o frază, la final */
  summary: string;
  /** Piese care apar în atelier după ce termini */
  unlocksParts?: string[];
}

export interface Chapter {
  id: string;
  title: string;
  intro: string;
  lessons: MiniLesson[];
}

export const XP_BY_DIFFICULTY: Record<MiniLesson["difficulty"], number> = { 1: 10, 2: 20, 3: 30 };
