import { describe, expect, it } from "vitest";
import { CIRCUIT_CHAPTERS } from "../../../../../../content/circuits/chapters";
import type { BoardSetup } from "../../../../../../content/circuits/chapters/types";
import { CIRCUIT_SOLUTIONS } from "../../../../../../content/circuits/solutions";
import { boardToCircuit } from "../board";
import {
  APPROX_BODY,
  isVertical,
  sideDirection,
  terminalPlacements,
  terminalPixelPosition,
  terminalPlacement,
} from "../terminalPositions";
import { pointOnWire, wireCurve, type Point } from "../wireGeometry";
import type { CircuitNode } from "../../types";

/**
 * Mesele desenate de noi nu au voie să aibă fire care trec printr-o piesă sau peste borna altei piese
 * (elevul ar crede că firul e legat acolo). Verificăm pe o masă de laptop și una de telefon.
 */
const BOARDS = [
  { name: "laptop", width: 1000, height: 480 },
  { name: "telefon", width: 375, height: 470 },
];

/** Cât „iertăm” la marginea corpului (px) — firele pot trece razant. */
const BODY_MARGIN = 6;
/** Distanța minimă față de o bornă străină (px). */
const TERMINAL_CLEARANCE = APPROX_BODY.terminalR + 2;

function problems(board: BoardSetup, width: number, height: number): string[] {
  const { nodes, edges } = boardToCircuit(board);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: string[] = [];

  const body = (n: CircuitNode) => {
    const v = isVertical(n);
    const hw = (v ? APPROX_BODY.halfH : APPROX_BODY.halfW) - BODY_MARGIN;
    const hh = (v ? APPROX_BODY.halfW : APPROX_BODY.halfH) - BODY_MARGIN;
    const cx = n.position.x * width;
    const cy = n.position.y * height;
    return { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh };
  };

  for (const e of edges) {
    const a = byId.get(e.from.nodeId);
    const b = byId.get(e.to.nodeId);
    if (!a || !b) continue;
    const pa = terminalPixelPosition(a, e.from.terminal, width, height)!;
    const pb = terminalPixelPosition(b, e.to.terminal, width, height)!;
    const curve = wireCurve(
      pa,
      sideDirection(terminalPlacement(a, e.from.terminal)!.side),
      pb,
      sideDirection(terminalPlacement(b, e.to.terminal)!.side),
    );
    const label = `${e.from.nodeId}:${e.from.terminal}–${e.to.nodeId}:${e.to.terminal}`;

    const samples: Point[] = [];
    for (let i = 3; i <= 57; i++) samples.push(pointOnWire(curve, i / 60));

    for (const n of nodes) {
      const r = body(n);
      if (samples.some((p) => p.x > r.x0 && p.x < r.x1 && p.y > r.y0 && p.y < r.y1)) {
        out.push(`${label} trece prin ${n.id}`);
      }
      for (const t of terminalPlacements(n)) {
        const isEnd =
          (n.id === e.from.nodeId && t.id === e.from.terminal) || (n.id === e.to.nodeId && t.id === e.to.terminal);
        if (isEnd) continue;
        const pt = terminalPixelPosition(n, t.id, width, height)!;
        if (samples.some((p) => Math.hypot(p.x - pt.x, p.y - pt.y) < TERMINAL_CLEARANCE)) {
          out.push(`${label} trece peste ${n.id}:${t.id}`);
        }
      }
    }
  }
  return [...new Set(out)];
}

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
    for (const size of BOARDS) {
      it(`${name} · ${size.name}`, () => {
        expect(problems(board, size.width, size.height)).toEqual([]);
      });
    }
  }
});
