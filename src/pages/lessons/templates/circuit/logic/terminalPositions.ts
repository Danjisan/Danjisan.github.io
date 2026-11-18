import type { CSSProperties } from "react";
import { COMPONENT_TERMINALS, TERMINAL_BODY_OVERLAP_REM, TERMINAL_SIZE_REM } from "../constants";
import type { CircuitNode, ComponentType, TerminalDef, TerminalId } from "../types";

/**
 * Unde stau bornele pe o piesă.
 *
 * Bornele nu se mișcă singure: stau pe o latură a piesei (stânga / dreapta / sus / jos), iar
 * piesa se poate roti în pași de 90°. Pentru scene realiste, o piesă poate avea alt aranjament
 * (ex. LED cu ambele picioare jos), ales de exercițiu prin `state.layout`.
 */

export type TerminalSide = "left" | "right" | "top" | "bottom" | "center";

export interface TerminalPlacement {
  id: TerminalId;
  side: TerminalSide;
  /** Poziția pe latură, 0..1 (0.5 = la mijloc) */
  at: number;
  label?: string;
}

export type NodeRotation = 0 | 90 | 180 | 270;

/** Aranjamente alternative, după tip. Lipsă = cel din COMPONENT_TERMINALS. */
const TERMINAL_LAYOUTS: Partial<Record<ComponentType, Record<string, TerminalPlacement[]>>> = {
  led: {
    // Ca un LED adevărat: ambele picioare jos, piciorul lung (+) în dreapta.
    legs: [
      { id: "-", side: "bottom", at: 0.36, label: "−" },
      { id: "+", side: "bottom", at: 0.64, label: "+" },
    ],
  },
};

const terminalOutsetRem = TERMINAL_SIZE_REM / 2 - TERMINAL_BODY_OVERLAP_REM;

/** Rotirea piesei; nodurile vechi cu `flipped: true` înseamnă 180°. */
export function nodeRotation(node: CircuitNode): NodeRotation {
  const r = Number(node.state.rotation);
  if (r === 90 || r === 180 || r === 270) return r;
  if (r === 0) return 0;
  return node.state.flipped === true ? 180 : 0;
}

export function nextRotation(node: CircuitNode): NodeRotation {
  return ((nodeRotation(node) + 90) % 360) as NodeRotation;
}

function sideOf(def: TerminalDef): TerminalSide {
  if (def.dy < 0) return "top";
  if (def.dy > 0) return "bottom";
  if (def.dx < 0) return "left";
  if (def.dx > 0) return "right";
  return "center";
}

const CLOCKWISE: Record<Exclude<TerminalSide, "center">, Exclude<TerminalSide, "center">> = {
  left: "top",
  top: "right",
  right: "bottom",
  bottom: "left",
};

function rotateSide(side: TerminalSide, rotation: NodeRotation): TerminalSide {
  if (side === "center") return side;
  let s = side;
  for (let i = 0; i < rotation / 90; i++) s = CLOCKWISE[s];
  return s;
}

/** Bornele piesei, cu latura finală (după aranjament și rotire). */
export function terminalPlacements(node: CircuitNode): TerminalPlacement[] {
  const layoutName = typeof node.state.layout === "string" ? node.state.layout : null;
  const base: TerminalPlacement[] =
    (layoutName && TERMINAL_LAYOUTS[node.type]?.[layoutName]) ||
    COMPONENT_TERMINALS[node.type].map((t) => ({ id: t.id, side: sideOf(t), at: 0.5, label: t.label }));
  const rotation = nodeRotation(node);
  if (rotation === 0) return base;
  // La 180° și 270° ordinea pe latură se inversează (piesa e întoarsă).
  const flipAt = rotation === 180 || rotation === 270;
  return base.map((t) => ({ ...t, side: rotateSide(t.side, rotation), at: flipAt ? 1 - t.at : t.at }));
}

export function terminalPlacement(node: CircuitNode, terminal: TerminalId): TerminalPlacement | undefined {
  return terminalPlacements(node).find((t) => t.id === terminal);
}

/** Direcția în care „iese” un fir din bornă (spre exteriorul piesei). */
export function sideDirection(side: TerminalSide): { x: number; y: number } {
  switch (side) {
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
    case "top":
      return { x: 0, y: -1 };
    case "bottom":
      return { x: 0, y: 1 };
    default:
      return { x: 0, y: 0 };
  }
}

/** Centrul bornei lângă marginea corpului — suprapunere ușoară peste chenar. */
export function terminalEdgeStyle(term: TerminalPlacement): CSSProperties {
  const o = `${terminalOutsetRem}rem`;
  const along = `${term.at * 100}%`;
  switch (term.side) {
    case "top":
      return { left: along, top: 0, transform: `translate(-50%, calc(-50% - ${o}))` };
    case "bottom":
      return { left: along, top: "100%", transform: `translate(-50%, calc(-50% + ${o}))` };
    case "left":
      return { left: 0, top: along, transform: `translate(calc(-50% - ${o}), -50%)` };
    case "right":
      return { left: "100%", top: along, transform: `translate(calc(-50% + ${o}), -50%)` };
    default:
      return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
  }
}

/** Mărimea aproximativă a unei piese pe masă (px), pentru calcule fără DOM (teste, primul render). */
export const APPROX_BODY = { halfW: 46, halfH: 38, terminalR: 13 };

/** Poziția bornei în px, fără DOM: folosită până la prima măsurare și în teste. */
export function terminalPixelPosition(
  node: CircuitNode,
  terminal: TerminalId,
  boardWidth: number,
  boardHeight: number,
): { x: number; y: number } | null {
  const t = terminalPlacement(node, terminal);
  if (!t) return null;
  const vertical = isVertical(node);
  const halfW = vertical ? APPROX_BODY.halfH : APPROX_BODY.halfW;
  const halfH = vertical ? APPROX_BODY.halfW : APPROX_BODY.halfH;
  const cx = node.position.x * boardWidth;
  const cy = node.position.y * boardHeight;
  const along = (t.at - 0.5) * 2;
  const r = APPROX_BODY.terminalR;
  switch (t.side) {
    case "left":
      return { x: cx - halfW - r, y: cy + along * halfH };
    case "right":
      return { x: cx + halfW + r, y: cy + along * halfH };
    case "top":
      return { x: cx + along * halfW, y: cy - halfH - r };
    case "bottom":
      return { x: cx + along * halfW, y: cy + halfH + r };
    default:
      return { x: cx, y: cy };
  }
}

/** Piesa e așezată vertical (rotită la 90° sau 270°). */
export function isVertical(node: CircuitNode): boolean {
  const r = nodeRotation(node);
  return r === 90 || r === 270;
}

export function terminalKey(nodeId: string, terminal: string): string {
  return `${nodeId}:${terminal}`;
}
