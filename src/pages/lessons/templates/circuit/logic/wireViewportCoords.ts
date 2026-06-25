import type { WorkbenchViewport } from "./viewportCoords";

export type TerminalCenterMap = Map<string, { x: number; y: number }>;

/** Zoom efectiv al viewport-ului: CSS `zoom` sau raport layout/visual pentru `scale()` */
export function getViewportZoom(viewportEl: HTMLElement, viewport: WorkbenchViewport): number {
  const cssZoom = Number.parseFloat(getComputedStyle(viewportEl).zoom);
  if (Number.isFinite(cssZoom) && cssZoom > 0) {
    return cssZoom;
  }

  const layoutW = viewportEl.clientWidth;
  const visualW = viewportEl.getBoundingClientRect().width;
  if (layoutW > 0 && visualW > 0) {
    const ratio = visualW / layoutW;
    if (ratio > 0) return ratio;
  }

  return viewport.zoom || 1;
}

/** Pointer ecran → coordonate locale viewport (același spațiu ca viewBox-ul SVG) */
export function clientToViewportLocal(
  clientX: number,
  clientY: number,
  surfaceRect: DOMRect,
  viewport: WorkbenchViewport,
): { x: number; y: number } {
  const zoom = viewport.zoom || 1;
  return {
    x: (clientX - surfaceRect.left - viewport.panX) / zoom,
    y: (clientY - surfaceRect.top - viewport.panY) / zoom,
  };
}

/**
 * Centre vizuale ale terminalelor în px locali pe viewport.
 * Folosește getBoundingClientRect — singura sursă sigură când zoom/pan sunt active.
 */
export function measureTerminalCenters(
  viewportEl: HTMLElement,
  viewport: WorkbenchViewport,
): { centers: TerminalCenterMap; width: number; height: number } {
  const width = viewportEl.clientWidth || 1;
  const height = viewportEl.clientHeight || 1;
  const vr = viewportEl.getBoundingClientRect();
  const zoom = getViewportZoom(viewportEl, viewport);
  const centers: TerminalCenterMap = new Map();

  viewportEl.querySelectorAll<HTMLElement>("[data-circuit-terminal]").forEach((el) => {
    const nodeId = el.getAttribute("data-node-id");
    const terminal = el.getAttribute("data-terminal");
    if (!nodeId || !terminal) return;

    const r = el.getBoundingClientRect();
    centers.set(`${nodeId}:${terminal}`, {
      x: (r.left + r.width / 2 - vr.left) / zoom,
      y: (r.top + r.height / 2 - vr.top) / zoom,
    });
  });

  return { centers, width, height };
}
