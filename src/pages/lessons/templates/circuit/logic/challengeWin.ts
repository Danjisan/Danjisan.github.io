import type { CircuitNode, ComponentStateWin, ComponentType } from "../types";
import type { DcSimulationResult } from "./sim/types";

export function checkComponentStateWin(
  check: ComponentStateWin,
  nodes: CircuitNode[],
  sim: DcSimulationResult,
): boolean {
  const node = nodes.find((n) => n.type === check.target);
  if (!node) return false;

  if (check.state === "on" && check.target === "led") {
    return sim.ledOn.has(node.id) && !sim.burnedLedIds.has(node.id);
  }
  if (check.state === "on_polarized" && check.target === "led") {
    return (
      sim.ledOn.has(node.id) &&
      !sim.reversedLedIds.has(node.id) &&
      !sim.burnedLedIds.has(node.id)
    );
  }
  if (check.state === "running" && check.target === "dc_motor") {
    return sim.motorRunning.has(node.id);
  }

  return false;
}

export function checkAllWinConditions(
  primary: ComponentStateWin,
  also: ComponentStateWin[] | undefined,
  nodes: CircuitNode[],
  sim: DcSimulationResult,
): boolean {
  const checks = [primary, ...(also ?? [])];
  return checks.every((c) => checkComponentStateWin(c, nodes, sim));
}

export function findNodeByType(nodes: CircuitNode[], type: ComponentType): CircuitNode | undefined {
  return nodes.find((n) => n.type === type);
}
