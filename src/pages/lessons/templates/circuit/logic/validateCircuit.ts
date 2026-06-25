import type {
  CircuitChallenge,
  CircuitEdge,
  CircuitNode,
  CircuitTerminalRef,
  ComponentType,
} from "../types";
import { analyzeDirectedCircuit } from "./directedCircuit";

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
  const placed = new Set(nodes.map((n) => n.type));
  return required.every((t) => placed.has(t));
}

export function isChallengeSolved(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  challenge: CircuitChallenge,
): boolean {
  if (!requiredTypesPlaced(nodes, challenge.required_types)) return false;

  const sim = analyzeDirectedCircuit(nodes, edges);
  if (!sim.isClosed) return false;

  const { target, state } = challenge.win_condition;
  const targetNode = nodes.find((n) => n.type === target);
  if (!targetNode) return false;

  if (state === "on" && target === "led") {
    return sim.ledOn.has(targetNode.id);
  }
  if (state === "running" && target === "dc_motor") {
    return sim.motorRunning.has(targetNode.id);
  }

  return false;
}
