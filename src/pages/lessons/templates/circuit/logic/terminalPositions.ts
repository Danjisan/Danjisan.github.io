import type { CSSProperties } from "react";
import { COMPONENT_TERMINALS, TERMINAL_BODY_OVERLAP_REM, TERMINAL_SIZE_REM } from "../constants";
import type { CircuitNode, TerminalDef, TerminalId } from "../types";

const terminalOutsetRem = TERMINAL_SIZE_REM / 2 - TERMINAL_BODY_OVERLAP_REM;

export function isNodeFlipped(node: CircuitNode): boolean {
  return node.state.flipped === true;
}

/** Terminale cu poziții vizuale — dx inversat când componenta e întoarsă */
export function getTerminalDefs(node: CircuitNode): TerminalDef[] {
  const base = COMPONENT_TERMINALS[node.type];
  if (!isNodeFlipped(node)) return base;
  return base.map((t) => ({ ...t, dx: t.dx === 0 ? 0 : -t.dx }));
}

/** Centru terminal lângă marginea corpului — suprapunere ușoară peste chenar */
export function terminalEdgeStyle(term: TerminalDef): CSSProperties {
  const o = `${terminalOutsetRem}rem`;
  if (term.dy < 0) {
    return { left: "50%", top: 0, transform: `translate(-50%, calc(-50% - ${o}))` };
  }
  if (term.dx < 0) {
    return { left: 0, top: "50%", transform: `translate(calc(-50% - ${o}), -50%)` };
  }
  if (term.dx > 0) {
    return { right: 0, top: "50%", transform: `translate(calc(50% + ${o}), -50%)` };
  }
  return { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };
}

/** Fallback px — doar până la prima măsurare DOM în WireLayer */
export function getTerminalPixelPosition(
  node: CircuitNode,
  terminal: TerminalDef,
  workbenchWidth: number,
  workbenchHeight: number,
  _remPx: number,
): { x: number; y: number } {
  const cx = node.position.x * workbenchWidth;
  const cy = node.position.y * workbenchHeight;
  const bodyHalfW = 36;
  const bodyHalfH = 28;
  const termR = 13;
  let x = cx;
  let y = cy;
  if (terminal.dy < 0) y -= bodyHalfH + termR;
  else if (terminal.dx < 0) x -= bodyHalfW + termR;
  else if (terminal.dx > 0) x += bodyHalfW + termR;
  return { x, y };
}

export function getTerminalPixelPositionById(
  node: CircuitNode,
  terminalId: TerminalId,
  workbenchWidth: number,
  workbenchHeight: number,
  remPx: number,
): { x: number; y: number } | null {
  const def = getTerminalDefs(node).find((t) => t.id === terminalId);
  if (!def) return null;
  return getTerminalPixelPosition(node, def, workbenchWidth, workbenchHeight, remPx);
}

export function terminalKey(nodeId: string, terminal: string): string {
  return `${nodeId}:${terminal}`;
}
