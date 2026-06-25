import { COMPONENT_TERMINALS, NODE_TERMINAL_SCALE } from "../constants";
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

export function getTerminalWorkbenchPosition(
  node: CircuitNode,
  terminal: TerminalDef,
): { x: number; y: number } {
  return {
    x: node.position.x + terminal.dx * NODE_TERMINAL_SCALE.x,
    y: node.position.y + terminal.dy * NODE_TERMINAL_SCALE.y,
  };
}

export function getTerminalWorkbenchPositionById(
  node: CircuitNode,
  terminalId: TerminalId,
): { x: number; y: number } | null {
  const def = getTerminalDefs(node).find((t) => t.id === terminalId);
  if (!def) return null;
  return getTerminalWorkbenchPosition(node, def);
}

export function terminalKey(nodeId: string, terminal: string): string {
  return `${nodeId}:${terminal}`;
}
