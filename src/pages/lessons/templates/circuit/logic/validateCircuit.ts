import type {
  CircuitChallenge,
  CircuitEdge,
  CircuitElectricMetadata,
  CircuitNode,
  CircuitTerminalRef,
  ComponentType,
} from "../types";
import { checkAllWinConditions } from "./challengeWin";
import { simulateCircuit } from "./simulateCircuit";

export function edgesShareEndpoint(edge: CircuitEdge, ref: CircuitTerminalRef): boolean {
  return (
    (edge.from.nodeId === ref.nodeId && edge.from.terminal === ref.terminal) ||
    (edge.to.nodeId === ref.nodeId && edge.to.terminal === ref.terminal)
  );
}

export function hasEdgeAtTerminal(edges: CircuitEdge[], ref: CircuitTerminalRef): boolean {
  return edges.some((e) => edgesShareEndpoint(e, ref));
}

export function requiredTypesPlaced(
  nodes: CircuitNode[],
  required: ComponentType[],
): boolean {
  const placedCounts = new Map<ComponentType, number>();
  for (const node of nodes) {
    placedCounts.set(node.type, (placedCounts.get(node.type) ?? 0) + 1);
  }

  const requiredCounts = new Map<ComponentType, number>();
  for (const type of required) {
    requiredCounts.set(type, (requiredCounts.get(type) ?? 0) + 1);
  }

  for (const [type, count] of requiredCounts) {
    if ((placedCounts.get(type) ?? 0) < count) return false;
  }
  return true;
}

export function isChallengeSolved(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  challenge: CircuitChallenge,
  metadata: Pick<CircuitElectricMetadata, "models" | "simulation">,
): boolean {
  if (!requiredTypesPlaced(nodes, challenge.required_types)) return false;

  const sim = simulateCircuit(nodes, edges, metadata);
  if (!sim.isClosed) return false;

  const { target, state, also } = challenge.win_condition;
  return checkAllWinConditions({ target, state }, also, nodes, sim);
}
