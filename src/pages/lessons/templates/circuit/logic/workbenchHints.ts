import type { WorkbenchHint } from "../types";

/** Hint-uri din metadata care nu se afișează în editor (texte vechi pentru layout cu inventar în pagină) */
const LEGACY_LAYOUT_HINT_IDS = new Set(["intro", "inventory-zone", "workbench-zone"]);

export function hintsForEditor(hints: WorkbenchHint[]): WorkbenchHint[] {
  return hints.filter((h) => !LEGACY_LAYOUT_HINT_IDS.has(h.id));
}
