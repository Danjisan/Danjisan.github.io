import type { CircuitEdge, CircuitElectricMetadata, CircuitNode } from "../types";
import { runDcSimulation } from "./sim/dcSimulation";
import type { DcSimulationResult } from "./sim/types";

export type SimulationResult = DcSimulationResult;

export function simulateCircuit(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  metadata: Pick<CircuitElectricMetadata, "models" | "simulation">,
): SimulationResult {
  return runDcSimulation(nodes, edges, metadata);
}

// Re-export pentru compatibilitate graduală
export type { DcSimulationResult };
