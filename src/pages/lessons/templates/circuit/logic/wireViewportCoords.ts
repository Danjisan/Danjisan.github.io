import { clientPointToViewportLayout } from "./viewportCoords";

export type TerminalNorm = { x: number; y: number };

/** Pointer ecran → coordonate locale viewport (spațiul layout al SVG-ului) */
export function clientToViewportLocal(
  clientX: number,
  clientY: number,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  return clientPointToViewportLayout(clientX, clientY, viewportEl);
}

/**
 * Centre terminale în coordonate normalizate 0–1 pe viewport (layout).
 * Invariant la zoom/pan: măsurăm o dată la schimbare layout, nu la fiecare zoom.
 */
export function measureTerminalNorms(viewportEl: HTMLElement): Map<string, TerminalNorm> {
  const r = viewportEl.getBoundingClientRect();
  const w = r.width || 1;
  const h = r.height || 1;
  const norms = new Map<string, TerminalNorm>();

  viewportEl.querySelectorAll<HTMLElement>("[data-circuit-terminal]").forEach((el) => {
    const nodeId = el.getAttribute("data-node-id");
    const terminal = el.getAttribute("data-terminal");
    if (!nodeId || !terminal) return;
    const tr = el.getBoundingClientRect();
    norms.set(`${nodeId}:${terminal}`, {
      x: (tr.left + tr.width / 2 - r.left) / w,
      y: (tr.top + tr.height / 2 - r.top) / h,
    });
  });

  return norms;
}

export function normToViewportPixel(
  norm: TerminalNorm,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  return {
    x: norm.x * viewportEl.clientWidth,
    y: norm.y * viewportEl.clientHeight,
  };
}
