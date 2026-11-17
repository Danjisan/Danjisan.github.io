import { describe, expect, it } from "vitest";
import { CIRCUIT_CHAPTERS } from "../../../../../../content/circuits/chapters";
import type { BoardSetup, LessonStep } from "../../../../../../content/circuits/chapters/types";
import { parseCircuitMetadata } from "../../parseMetadata";
import { boardProblems, boardToCircuit } from "../board";
import { simulateCircuit } from "../simulateCircuit";
import { checkWin } from "../winConditions";

const { metadata } = parseCircuitMetadata({});
const simMeta = { models: metadata.models, simulation: metadata.simulation };

function wins(step: Extract<LessonStep, { win: unknown }>, board: BoardSetup): boolean {
  const { nodes, edges } = boardToCircuit(board);
  return checkWin(step.win, {
    nodes,
    sim: simulateCircuit(nodes, edges, simMeta),
    overcurrentCountsAsBurned: true,
    resimulate: (n) => simulateCircuit(n, edges, simMeta),
  });
}

const wireKey = ([a, b]: [string, string]) => [a, b].sort().join("~");

function partCounts(board: BoardSetup | undefined): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of board?.parts ?? []) m.set(p.part, (m.get(p.part) ?? 0) + 1);
  return m;
}

for (const chapter of Object.values(CIRCUIT_CHAPTERS)) {
  describe(`capitolul ${chapter.id}`, () => {
    const allIds = chapter.lessons.flatMap((l) => [l.id, ...l.steps.map((s) => s.id)]);

    it("id-urile mini-lecțiilor și pașilor sunt unice", () => {
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    for (const lesson of chapter.lessons) {
      describe(lesson.id, () => {
        for (const step of lesson.steps) {
          const boards: BoardSetup[] = [];
          if ("board" in step && step.board) boards.push(step.board);
          if ("solution" in step) boards.push(step.solution);

          it(`${step.id}: mesele sunt corecte (piese din catalog, terminale existente)`, () => {
            for (const b of boards) expect(boardProblems(b)).toEqual([]);
          });

          if (step.kind === "predict") {
            it(`${step.id}: are exact un răspuns corect`, () => {
              expect(step.options.filter((o) => o.correct).length).toBe(1);
            });
          }

          if (step.kind === "try" || step.kind === "build" || step.kind === "fix") {
            it(`${step.id}: soluția câștigă`, () => {
              expect(wins(step, step.solution)).toBe(true);
            });

            it(`${step.id}: nu e deja rezolvat la început`, () => {
              expect(wins(step, step.board ?? { parts: [], wires: [] })).toBe(false);
            });

            it(`${step.id}: firele blocate rămân în soluție`, () => {
              if (!step.board?.lockedWires) return;
              const sol = new Set(step.solution.wires.map(wireKey));
              for (const w of step.board.wires) expect(sol.has(wireKey(w)), w.join("–")).toBe(true);
            });
          }

          if (step.kind === "build" || step.kind === "fix") {
            it(`${step.id}: soluția folosește doar piesele de pe masă și din inventar`, () => {
              const available = partCounts(step.board);
              for (const s of step.inventory) available.set(s.part, (available.get(s.part) ?? 0) + s.count);
              for (const [part, count] of partCounts(step.solution)) {
                expect(count, part).toBeLessThanOrEqual(available.get(part) ?? 0);
              }
            });
          }

          if (step.kind === "try") {
            it(`${step.id}: soluția se obține doar cu acțiunile permise`, () => {
              const before = new Set(step.board.wires.map(wireKey));
              const after = new Set(step.solution.wires.map(wireKey));
              const added = [...after].filter((w) => !before.has(w));
              const removed = [...before].filter((w) => !after.has(w));
              if (!step.allow.includes("add_wire")) expect(added).toEqual([]);
              if (!step.allow.includes("remove_wire")) expect(removed).toEqual([]);
              expect(step.solution.parts.map((p) => p.id).sort()).toEqual(step.board.parts.map((p) => p.id).sort());
              if (!step.allow.includes("toggle_switch")) {
                for (const p of step.solution.parts) {
                  const b = step.board.parts.find((x) => x.id === p.id)!;
                  expect(p.state?.on ?? null, p.id).toEqual(b.state?.on ?? null);
                }
              }
            });
          }
        }
      });
    }
  });
}
