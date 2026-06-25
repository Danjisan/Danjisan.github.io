import { COMPONENT_TERMINALS, TERMINAL_OFFSET_REM } from "../constants";
import type { CircuitNode, TerminalDef, TerminalId } from "../types";

export function isNodeFlipped(node: CircuitNode): boolean {
  return node.state.flipped === true;
}

/** Terminale cu poziții vizuale — dx inversat când componenta e întoarsă */
export function getTerminalDefs(node: CircuitNode): TerminalDef[] {
  const base = COMPONENT_TERMINALS[node.type];
  if (!isNodeFlipped(node)) return base;
  return base.map((t) => ({ ...t, dx: t.dx === 0 ? 0 : -t.dx }));
}

/** Centru terminal în px pe masa de lucru — aliniat cu CSS-ul nodului */
export function getTerminalPixelPosition(
  node: CircuitNode,
  terminal: TerminalDef,
  workbenchWidth: number,
  workbenchHeight: number,
  remPx: number,
): { x: number; y: number } {
  const cx = node.position.x * workbenchWidth;
  const cy = node.position.y * workbenchHeight;
  return {
    x: cx + terminal.dx * TERMINAL_OFFSET_REM.x * remPx,
    y: cy + terminal.dy * TERMINAL_OFFSET_REM.y * remPx,
  };
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
