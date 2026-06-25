import type { ComponentType } from "../types";
import { clientToWorkbenchPosition as clientToWorkbenchPositionFromViewport } from "./viewportCoords";

export function defaultNodeState(type: ComponentType): Record<string, unknown> {
  const base = { flipped: false };
  switch (type) {
    case "switch":
      return { ...base, on: false };
    case "potentiometer":
      return { ...base, value: 0.5 };
    default:
      return base;
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
  viewportEl: HTMLElement,
): { x: number; y: number } {
  return clientToWorkbenchPositionFromViewport(clientX, clientY, viewportEl);
}

export function isInsideRect(clientX: number, clientY: number, rect: DOMRect): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  );
}
