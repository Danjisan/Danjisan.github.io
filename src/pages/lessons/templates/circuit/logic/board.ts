import type { BoardSetup } from "../../../../../content/circuits/chapters/types";
import { COMPONENT_TERMINALS } from "../constants";
import type { CircuitEdge, CircuitNode, TerminalId } from "../types";
import { defaultNodeState } from "./nodeDefaults";
import { getPart } from "./parts";

export interface BoardCircuit {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  lockedNodeIds: Set<string>;
  /** Fixate pe loc, dar se pot roti */
  pinnedNodeIds: Set<string>;
  lockedEdgeIds: Set<string>;
}

export function splitTerminalRef(ref: string): { nodeId: string; terminal: TerminalId } {
  const i = ref.lastIndexOf(":");
  return { nodeId: ref.slice(0, i), terminal: ref.slice(i + 1) as TerminalId };
}

/**
 * Transformă o masă descrisă ca date (piese din catalog + fire) în nodurile și firele editorului.
 * `switchesOn` suprascrie starea întrerupătoarelor (ex. „Pornește” la un pas `predict`).
 */
export function boardToCircuit(board: BoardSetup, opts: { switchesOn?: boolean } = {}): BoardCircuit {
  const lockedNodeIds = new Set<string>();
  const pinnedNodeIds = new Set<string>();
  const nodes: CircuitNode[] = board.parts.flatMap((p) => {
    const part = getPart(p.part);
    if (!part) return [];
    const state: Record<string, unknown> = { ...defaultNodeState(part.type), ...p.state, partId: part.id };
    if (part.type === "switch" && opts.switchesOn !== undefined) state.on = opts.switchesOn;
    if (p.locked === "pinned") pinnedNodeIds.add(p.id);
    else if (p.locked) lockedNodeIds.add(p.id);
    return [{ id: p.id, type: part.type, position: { x: p.x, y: p.y }, state }];
  });
  const edges: CircuitEdge[] = board.wires.map(([a, b], i) => ({
    id: `w${i}`,
    from: splitTerminalRef(a),
    to: splitTerminalRef(b),
  }));
  const lockedEdgeIds = new Set(board.lockedWires ? edges.map((e) => e.id) : []);
  return { nodes, edges, lockedNodeIds, pinnedNodeIds, lockedEdgeIds };
}

/** Probleme de structură într-o masă (piese necunoscute, fire spre terminale inexistente). Gol = ok. */
export function boardProblems(board: BoardSetup): string[] {
  const problems: string[] = [];
  const types = new Map<string, string>();
  for (const p of board.parts) {
    const part = getPart(p.part);
    if (!part) problems.push(`piesă necunoscută: ${p.part}`);
    else types.set(p.id, part.type);
  }
  if (new Set(board.parts.map((p) => p.id)).size !== board.parts.length) problems.push("id-uri de piese duplicate");
  for (const [a, b] of board.wires) {
    for (const ref of [a, b]) {
      const { nodeId, terminal } = splitTerminalRef(ref);
      const type = types.get(nodeId);
      if (!type) problems.push(`fir spre piesă inexistentă: ${ref}`);
      else if (!COMPONENT_TERMINALS[type as keyof typeof COMPONENT_TERMINALS].some((t) => t.id === terminal)) {
        problems.push(`terminal inexistent: ${ref}`);
      }
    }
    if (splitTerminalRef(a).nodeId === splitTerminalRef(b).nodeId) problems.push(`fir pe aceeași piesă: ${a}–${b}`);
  }
  return problems;
}
