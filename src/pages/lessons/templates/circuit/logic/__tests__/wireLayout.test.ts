import { describe, expect, it } from "vitest";
import { CIRCUIT_CHAPTERS } from "../../../../../../content/circuits/chapters";
import type { BoardSetup } from "../../../../../../content/circuits/chapters/types";
import { CIRCUIT_SOLUTIONS } from "../../../../../../content/circuits/solutions";
import { LAYOUT_BOARD_SIZES, wireLayoutProblems } from "../wireLayoutCheck";

/**
 * Mesele desenate de noi nu au voie să aibă fire care trec printr-o piesă sau peste borna altei piese
 * (elevul ar crede că firul e legat acolo). Verificăm pe o masă de laptop și una de telefon.
 */
function allBoards(): { name: string; board: BoardSetup }[] {
  const list: { name: string; board: BoardSetup }[] = [];
  for (const chapter of Object.values(CIRCUIT_CHAPTERS)) {
    for (const lesson of chapter.lessons) {
      for (const step of lesson.steps) {
        if ("board" in step && step.board) list.push({ name: `${step.id} (început)`, board: step.board });
        if ("solution" in step) list.push({ name: `${step.id} (soluție)`, board: step.solution });
      }
    }
  }
  for (const [id, solution] of Object.entries(CIRCUIT_SOLUTIONS)) {
    list.push({ name: `provocarea ${id}`, board: solution });
  }
  return list;
}

describe("firele din mesele noastre nu trec prin piese", () => {
  for (const { name, board } of allBoards()) {
    for (const size of LAYOUT_BOARD_SIZES) {
      it(`${name} · ${size.name}`, () => {
        expect(wireLayoutProblems(board, size.width, size.height)).toEqual([]);
      });
    }
  }
});
