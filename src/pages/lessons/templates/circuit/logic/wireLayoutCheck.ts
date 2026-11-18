import type { BoardSetup } from "../../../../../content/circuits/chapters/types";
import { boardToCircuit } from "./board";
import {
  APPROX_BODY,
  approxHalfSize,
  sideDirection,
  terminalPlacements,
  terminalPixelPosition,
  terminalPlacement,
} from "./terminalPositions";
import { pointOnWire, wireCurve, type Point } from "./wireGeometry";
import type { CircuitEdge, CircuitNode } from "../types";

/**
 * Verifică o masă desenată de noi: niciun fir nu trece printr-o piesă sau peste borna altei piese.
 * Folosită de teste (wireLayout.test.ts) pentru toate mesele din capitole și provocări.
 */
export const LAYOUT_BOARD_SIZES = [
  { name: "laptop", width: 1000, height: 480 },
  { name: "telefon", width: 375, height: 470 },
];

/** Cât „iertăm” la marginea corpului (px) — firele pot trece razant. */
const BODY_MARGIN = 6;
/** Distanța minimă față de o bornă străină (px). */
const TERMINAL_CLEARANCE = APPROX_BODY.terminalR + 2;

export function wireLayoutProblems(board: BoardSetup, width: number, height: number): string[] {
  const { nodes, edges } = boardToCircuit(board);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: string[] = [];

  const body = (n: CircuitNode) => {
    const size = approxHalfSize(n);
    const hw = size.halfW - BODY_MARGIN;
    const hh = size.halfH - BODY_MARGIN;
    const cx = n.position.x * width;
    const cy = n.position.y * height;
    return { x0: cx - hw, x1: cx + hw, y0: cy - hh, y1: cy + hh };
  };

  // Piesele și bornele trebuie să încapă pe masă (pe telefon, o bornă de la margine poate ieși afară).
  for (const n of nodes) {
    const { halfW: hw, halfH: hh } = approxHalfSize(n);
    const cx = n.position.x * width;
    const cy = n.position.y * height;
    const terminals = terminalPlacements(n).map((t) => terminalPixelPosition(n, t.id, width, height)!);
    const xs = [cx - hw, cx + hw, ...terminals.map((t) => t.x - APPROX_BODY.terminalR), ...terminals.map((t) => t.x + APPROX_BODY.terminalR)];
    const ys = [cy - hh, cy + hh, ...terminals.map((t) => t.y - APPROX_BODY.terminalR), ...terminals.map((t) => t.y + APPROX_BODY.terminalR)];
    if (Math.min(...xs) < 0 || Math.max(...xs) > width || Math.min(...ys) < 0 || Math.max(...ys) > height) {
      out.push(`${n.id} iese din masă`);
    }
  }

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
  if (board.allowCrossings) return [...new Set(out)];

  // Firele nu se încrucișează între ele (o încrucișare arată ca o legătură). Două fire care pleacă
  // din aceeași bornă se ating firesc acolo, deci ignorăm capetele comune.
  const polylines = edges.flatMap((e) => {
    const a = byId.get(e.from.nodeId);
    const b = byId.get(e.to.nodeId);
    if (!a || !b) return [];
    const pa = terminalPixelPosition(a, e.from.terminal, width, height)!;
    const pb = terminalPixelPosition(b, e.to.terminal, width, height)!;
    const curve = wireCurve(
      pa,
      sideDirection(terminalPlacement(a, e.from.terminal)!.side),
      pb,
      sideDirection(terminalPlacement(b, e.to.terminal)!.side),
    );
    const pts: Point[] = [];
    for (let i = 0; i <= 40; i++) pts.push(pointOnWire(curve, i / 40));
    return [{ e, pts, ends: [`${e.from.nodeId}:${e.from.terminal}`, `${e.to.nodeId}:${e.to.terminal}`] }];
  });
  const cross = (p1: Point, p2: Point, p3: Point, p4: Point) => {
    const d = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const d1 = d(p3, p4, p1);
    const d2 = d(p3, p4, p2);
    const d3 = d(p1, p2, p3);
    const d4 = d(p1, p2, p4);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  for (let i = 0; i < polylines.length; i++) {
    for (let j = i + 1; j < polylines.length; j++) {
      const A = polylines[i];
      const B = polylines[j];
      const shared = A.ends.filter((x) => B.ends.includes(x));
      const nearShared = (pt: Point) =>
        shared.some((key) => {
          const [nodeId, t] = [key.slice(0, key.lastIndexOf(":")), key.slice(key.lastIndexOf(":") + 1)];
          const n = byId.get(nodeId)!;
          const tp = terminalPixelPosition(n, t as never, width, height)!;
          return Math.hypot(pt.x - tp.x, pt.y - tp.y) < 40;
        });
      let hit = false;
      for (let a = 0; a < A.pts.length - 1 && !hit; a++) {
        if (nearShared(A.pts[a])) continue;
        for (let b = 0; b < B.pts.length - 1; b++) {
          if (nearShared(B.pts[b])) continue;
          if (cross(A.pts[a], A.pts[a + 1], B.pts[b], B.pts[b + 1])) {
            hit = true;
            break;
          }
        }
      }
      if (hit) {
        const name = (e: CircuitEdge) => `${e.from.nodeId}:${e.from.terminal}–${e.to.nodeId}:${e.to.terminal}`;
        out.push(`${name(A.e)} se încrucișează cu ${name(B.e)}`);
      }
    }
  }

  return [...new Set(out)];
}

