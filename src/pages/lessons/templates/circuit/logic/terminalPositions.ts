import { NODE_TERMINAL_SCALE } from "../constants";
import type { CircuitNode, TerminalDef } from "../types";

export function getTerminalWorkbenchPosition(
  node: CircuitNode,
  terminal: TerminalDef,
): { x: number; y: number } {
  return {
    x: node.position.x + terminal.dx * NODE_TERMINAL_SCALE.x,
    y: node.position.y + terminal.dy * NODE_TERMINAL_SCALE.y,
  };
}

export function terminalKey(nodeId: string, terminal: string): string {
  return `${nodeId}:${terminal}`;
}
