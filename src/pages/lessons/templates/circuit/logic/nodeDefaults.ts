import type { ComponentType } from "../types";

export function defaultNodeState(type: ComponentType): Record<string, unknown> {
  switch (type) {
    case "switch":
      return { on: false };
    case "potentiometer":
      return { value: 0.5 };
    default:
      return {};
  }
}

/** Ține nodurile în interiorul mesei, cu margine pentru dimensiunea placeholder-ului */
export function clampWorkbenchPosition(x: number, y: number): { x: number; y: number } {
  const margin = 0.07;
  return {
    x: Math.min(1 - margin, Math.max(margin, x)),
    y: Math.min(1 - margin, Math.max(margin, y)),
  };
}

export function clientToWorkbenchPosition(
  clientX: number,
  clientY: number,
  rect: DOMRect,
): { x: number; y: number } {
  return clampWorkbenchPosition(
    (clientX - rect.left) / rect.width,
    (clientY - rect.top) / rect.height,
  );
}

export function isInsideRect(clientX: number, clientY: number, rect: DOMRect): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}
