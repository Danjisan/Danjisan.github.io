export interface WorkbenchViewport {
  zoom: number;
  panX: number;
  panY: number;
}

export const VIEWPORT_ZOOM_MIN = 0.45;
export const VIEWPORT_ZOOM_MAX = 2.5;
export const VIEWPORT_ZOOM_STEP = 0.2;

export function clampZoom(zoom: number): number {
  return Math.min(VIEWPORT_ZOOM_MAX, Math.max(VIEWPORT_ZOOM_MIN, zoom));
}

/** Coordonate normalizate 0–1 pe masa de lucru, cu pan/zoom */
export function clientToWorkbenchPosition(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  viewport: WorkbenchViewport,
): { x: number; y: number } {
  const margin = 0.07;
  const x = (clientX - rect.left - viewport.panX) / viewport.zoom / rect.width;
  const y = (clientY - rect.top - viewport.panY) / viewport.zoom / rect.height;
  return {
    x: Math.min(1 - margin, Math.max(margin, x)),
    y: Math.min(1 - margin, Math.max(margin, y)),
  };
}

/** Poziție normalizată 0–1 pentru fir pending (fără clamp) */
export function clientToWorkbenchNormalized(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  viewport: WorkbenchViewport,
): { x: number; y: number } {
  return {
    x: (clientX - rect.left - viewport.panX) / viewport.zoom / rect.width,
    y: (clientY - rect.top - viewport.panY) / viewport.zoom / rect.height,
  };
}

export function viewportTransformStyle(viewport: WorkbenchViewport): {
  transform: string;
  transformOrigin: string;
} {
  return {
    transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
    transformOrigin: "0 0",
  };
}
