import type { CSSProperties } from "react";

export interface WorkbenchViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export const VIEWPORT_ZOOM_MIN = 0.6;
export const VIEWPORT_ZOOM_MAX = 1.4;
export const VIEWPORT_ZOOM_STEP = 0.1;

export function clampZoom(zoom: number): number {
  return Math.min(VIEWPORT_ZOOM_MAX, Math.max(VIEWPORT_ZOOM_MIN, zoom));
}

/**
 * Ecran → coordonate normalizate 0–1 pe masă.
 * Folosește getBoundingClientRect pe viewport — include pan + zoom (CSS zoom sau scale).
 */
export function clientPointToWorkbenchNorm(
  clientX: number,
  clientY: number,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  const r = viewportEl.getBoundingClientRect();
  return {
    x: (clientX - r.left) / r.width,
    y: (clientY - r.top) / r.height,
  };
}

/** Ecran → px layout în viewport (spațiul SVG / noduri) */
export function clientPointToViewportLayout(
  clientX: number,
  clientY: number,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  const norm = clientPointToWorkbenchNorm(clientX, clientY, viewportEl);
  return {
    x: norm.x * viewportEl.clientWidth,
    y: norm.y * viewportEl.clientHeight,
  };
}

/** Coordonate normalizate 0–1 pe masa de lucru, cu margine */
export function clientToWorkbenchPosition(
  clientX: number,
  clientY: number,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  const margin = 0.07;
  const { x, y } = clientPointToWorkbenchNorm(clientX, clientY, viewportEl);
  return {
    x: Math.min(1 - margin, Math.max(margin, x)),
    y: Math.min(1 - margin, Math.max(margin, y)),
  };
}

/** Poziție normalizată 0–1 (fără clamp) */
export function clientToWorkbenchNormalized(
  clientX: number,
  clientY: number,
  viewportEl: HTMLElement,
): { x: number; y: number } {
  return clientPointToWorkbenchNorm(clientX, clientY, viewportEl);
}

const supportsCssZoom =
  typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("zoom", "1");

export function viewportTransformStyle(viewport: WorkbenchViewport): CSSProperties {
  const pan = `translate(${viewport.panX}px, ${viewport.panY}px)`;

  if (supportsCssZoom) {
    return {
      transform: pan,
      transformOrigin: "0 0",
      zoom: viewport.zoom,
    };
  }

  return {
    transform: `${pan} scale(${viewport.zoom})`,
    transformOrigin: "0 0",
  };
}
