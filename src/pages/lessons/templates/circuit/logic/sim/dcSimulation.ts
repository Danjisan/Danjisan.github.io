import type {
  BranchElectricalReading,
  CircuitEdge,
  CircuitElectricMetadata,
  CircuitNode,
} from "../../types";
import { isBatteryLoopClosed } from "../directedCircuit";
import { terminalKey } from "../terminalPositions";
import { electricalFor } from "./electricalFor";
import {
  buildLedConductingStamps,
  buildNetlist,
  emptyResult,
  hasWireOnTerminal,
  isNodeBurned,
  ledOpenStamp,
} from "./netlist";
import { nodeVoltage, solveMna } from "./mnaSolve";
import type { CircuitStamp, DcSimulationResult } from "./types";

function pinV(
  solution: ReturnType<typeof solveMna>,
  pinToNode: Map<string, number>,
  nodeId: string,
  terminal: "+" | "-",
): number {
  if (!solution) return 0;
  const n = pinToNode.get(terminalKey(nodeId, terminal));
  if (n === undefined) return 0;
  return nodeVoltage(solution, n);
}

function makeReading(voltage_v: number, current_a: number): BranchElectricalReading {
  return {
    voltage_v,
    current_a,
    power_w: Math.abs(voltage_v * current_a),
  };
}

export function runDcSimulation(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  metadata: Pick<CircuitElectricMetadata, "models" | "simulation">,
): DcSimulationResult {
  const result = emptyResult();
  const { models, simulation } = metadata;

  for (const node of nodes) {
    if (isNodeBurned(node)) result.burnedLedIds.add(node.id);
  }

  const netlist = buildNetlist(nodes, edges, models);
  if (!netlist) return result;

  const battery = nodes.find((n) => n.type === "battery");
  if (!battery) return result;

  const batPlus = netlist.pinToNode.get(terminalKey(battery.id, "+"));
  const batMinus = netlist.pinToNode.get(terminalKey(battery.id, "-"));
  if (batPlus !== undefined && batPlus === batMinus) {
    result.shortCircuited = true;
    result.isClosed = true;
    result.newFailures.push("short_circuit");
    result.hints.push(simulation.failure_messages.short_circuit);
    return result;
  }

  const externallyClosed = isBatteryLoopClosed(nodes, edges);
  if (!externallyClosed) {
    if (edges.length > 0) {
      const openSwitch = nodes.find((n) => n.type === "switch" && !n.state.on);
      if (openSwitch) {
        result.hints.push("Întrerupătorul e deschis — închide-l ca să circule curentul.");
      } else {
        result.hints.push("Circuitul nu e închis — verifică că toate componentele sunt legate.");
      }
    }
    return result;
  }

  const ledNodes = nodes.filter((n) => n.type === "led");
  const probeOpenStamps = ledNodes
    .filter((n) => !isNodeBurned(n))
    .map((n) => ledOpenStamp(n.id, netlist.pinToNode));

  const probeSolution = solveMna(netlist, probeOpenStamps);

  if (!probeSolution) {
    result.hints.push("Circuitul nu poate fi analizat — verifică conexiunile.");
    return result;
  }

  const conductingLedIds = new Set<string>();

  for (const led of ledNodes) {
    if (isNodeBurned(led)) continue;

    const wired = hasWireOnTerminal(edges, led.id, "+") && hasWireOnTerminal(edges, led.id, "-");
    if (!wired) continue;

    const vPlus = pinV(probeSolution, netlist.pinToNode, led.id, "+");
    const vMinus = pinV(probeSolution, netlist.pinToNode, led.id, "-");
    const vDrop = vPlus - vMinus;
    const elec = electricalFor(models, "led");

    if (vDrop < -0.15) {
      result.reversedLedIds.add(led.id);
      continue;
    }

    if (vDrop >= elec.forward_voltage_v * 0.85) {
      conductingLedIds.add(led.id);
    }
  }

  const finalStamps: CircuitStamp[] = [];
  let nodeCount = netlist.nodeCount;

  for (const led of ledNodes) {
    if (isNodeBurned(led)) continue;
    if (!hasWireOnTerminal(edges, led.id, "+") || !hasWireOnTerminal(edges, led.id, "-")) continue;

    if (conductingLedIds.has(led.id)) {
      const elec = electricalFor(models, "led");
      finalStamps.push(
        ...buildLedConductingStamps(
          led.id,
          netlist.pinToNode,
          elec.forward_voltage_v,
          elec.on_resistance_ohm,
          nodeCount++,
        ),
      );
    } else {
      finalStamps.push(ledOpenStamp(led.id, netlist.pinToNode));
    }
  }

  const solution = solveMna(netlist, finalStamps, nodeCount);
  if (!solution) {
    result.hints.push("Circuitul nu poate fi analizat — verifică conexiunile.");
    return result;
  }

  const batteryCurrent = Math.abs(solution.branchCurrents.get(battery.id) ?? 0);
  result.batteryCurrent_a = batteryCurrent;
  result.shortCircuited = batteryCurrent > simulation.short_circuit_current_a;
  result.isClosed = true;

  if (result.shortCircuited) {
    result.newFailures.push("short_circuit");
    result.hints.push(simulation.failure_messages.short_circuit);
    return result;
  }

  for (const node of nodes) {
    const id = node.id;

    if (node.type === "resistor") {
      const i = solution.branchCurrents.get(id) ?? 0;
      const v = Math.abs(i) * electricalFor(models, "resistor").resistance_ohm;
      result.readings.set(id, makeReading(v, Math.abs(i)));
    }

    if (node.type === "switch" && node.state.on === true) {
      const i = Math.abs(solution.branchCurrents.get(id) ?? 0);
      const v = i * electricalFor(models, "switch").contact_resistance_ohm;
      result.readings.set(id, makeReading(v, i));
    }

    if (node.type === "dc_motor") {
      const wired =
        hasWireOnTerminal(edges, id, "+") && hasWireOnTerminal(edges, id, "-");
      if (!wired) continue;
      const i = solution.branchCurrents.get(id) ?? 0;
      const r = electricalFor(models, "dc_motor").winding_resistance_ohm;
      const v = Math.abs(i) * r;
      result.readings.set(id, makeReading(v, Math.abs(i)));
      if (Math.abs(i) >= electricalFor(models, "dc_motor").min_run_current_a) {
        result.motorRunning.add(id);
      }
    }

    if (node.type === "battery") {
      const v = electricalFor(models, "battery").voltage_v;
      result.readings.set(id, makeReading(v, batteryCurrent));
    }

    if (node.type === "led") {
      if (isNodeBurned(node)) {
        result.readings.set(id, makeReading(0, 0));
        continue;
      }

      const wired =
        hasWireOnTerminal(edges, id, "+") && hasWireOnTerminal(edges, id, "-");
      if (!wired) continue;

      const vPlus = pinV(solution, netlist.pinToNode, id, "+");
      const vMinus = pinV(solution, netlist.pinToNode, id, "-");
      const vDrop = vPlus - vMinus;
      const elec = electricalFor(models, "led");
      const i = Math.abs(solution.branchCurrents.get(id) ?? 0);

      result.readings.set(id, makeReading(Math.abs(vDrop), i));

      if (result.reversedLedIds.has(id)) {
        result.newFailures.push("led_reverse");
        result.hints.push(simulation.failure_messages.led_reverse);
        continue;
      }

      if (conductingLedIds.has(id) && i > 1e-6) {
        result.ledOn.add(id);
      }

      if (i > elec.max_current_a) {
        result.overcurrentLedIds.add(id);
        result.ledOvercurrent.set(id, { current_a: i, max_a: elec.max_current_a });
      }
    }
  }

  return result;
}
