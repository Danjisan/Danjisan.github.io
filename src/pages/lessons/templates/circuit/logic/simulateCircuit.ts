import type { CircuitEdge, CircuitNode } from "../types";
import { analyzeDirectedCircuit, type DirectedSimulationResult } from "./directedCircuit";

export type SimulationResult = DirectedSimulationResult;

export function simulateCircuit(nodes: CircuitNode[], edges: CircuitEdge[]): SimulationResult {
  return analyzeDirectedCircuit(nodes, edges);
}
