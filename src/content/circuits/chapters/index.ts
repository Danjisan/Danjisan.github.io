import { CHAPTER_01 } from "./01-primul-circuit";
import type { Chapter } from "./types";

/** Capitolele de circuite, după id (valoarea din `lessons.metadata.chapter`). */
export const CIRCUIT_CHAPTERS: Record<string, Chapter> = {
  [CHAPTER_01.id]: CHAPTER_01,
};
