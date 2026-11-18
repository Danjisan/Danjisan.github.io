import type { CircuitEdge, CircuitNode } from "../types";
import { approxHalfSize, APPROX_BODY, sideDirection, terminalPixelPosition, terminalPlacement, terminalPlacements } from "./terminalPositions";
import type { WorkbenchViewport } from "./viewportCoords";
import { VIEWPORT_ZOOM_MIN } from "./viewportCoords";
import { pointOnWire, wireCurve } from "./wireGeometry";

export interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/**
 * Marginile a tot ce e desenat pe masă (piese, borne, curbele firelor), în px-ii mesei nezoomate.
 * Aceeași geometrie ca la desen și ca în testul de așezare.
 */
export function contentBounds(nodes: CircuitNode[], edges: CircuitEdge[], width: number, height: number): Bounds | null {
  if (nodes.length === 0) return null;
  const b: Bounds = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  const add = (x: number, y: number, r = 0) => {
    b.x0 = Math.min(b.x0, x - r);
    b.y0 = Math.min(b.y0, y - r);
    b.x1 = Math.max(b.x1, x + r);
    b.y1 = Math.max(b.y1, y + r);
  };
  const byId = new Map(nodes.map((n) => [n.id, n]));

  for (const n of nodes) {
    const { halfW, halfH } = approxHalfSize(n);
    const cx = n.position.x * width;
    const cy = n.position.y * height;
    add(cx - halfW, cy - halfH);
    add(cx + halfW, cy + halfH);
    for (const t of terminalPlacements(n)) {
      const p = terminalPixelPosition(n, t.id, width, height);
      if (p) add(p.x, p.y, APPROX_BODY.terminalR);
    }
  }

  for (const e of edges) {
    const a = byId.get(e.from.nodeId);
    const c = byId.get(e.to.nodeId);
    if (!a || !c) continue;
    const pa = terminalPixelPosition(a, e.from.terminal, width, height);
    const pc = terminalPixelPosition(c, e.to.terminal, width, height);
    const ta = terminalPlacement(a, e.from.terminal);
    const tc = terminalPlacement(c, e.to.terminal);
    if (!pa || !pc || !ta || !tc) continue;
    const curve = wireCurve(pa, sideDirection(ta.side), pc, sideDirection(tc.side));
    for (let i = 0; i <= 24; i++) {
      const p = pointOnWire(curve, i / 24);
      add(p.x, p.y, 3);
    }
  }
  return b;
}

/**
 * Vederea care încape tot conținutul, cu o margine. Dacă totul încape deja la zoom 1, întoarce null
 * (nu mișcăm masa degeaba).
 */
export function fitViewport(bounds: Bounds | null, width: number, height: number, margin = 12): WorkbenchViewport | null {
  if (!bounds || width <= 1 || height <= 1) return null;
  const fits = bounds.x0 >= margin / 2 && bounds.y0 >= margin / 2 && bounds.x1 <= width - margin / 2 && bounds.y1 <= height - margin / 2;
  if (fits) return null;
  const bw = bounds.x1 - bounds.x0 + margin * 2;
  const bh = bounds.y1 - bounds.y0 + margin * 2;
  const zoom = Math.max(VIEWPORT_ZOOM_MIN, Math.min(1, width / bw, height / bh));
  const cx = (bounds.x0 + bounds.x1) / 2;
  const cy = (bounds.y0 + bounds.y1) / 2;
  // ecran = pan + zoom * local (origine 0,0): centrul conținutului în centrul mesei
  return { zoom, panX: width / 2 - zoom * cx, panY: height / 2 - zoom * cy };
}
