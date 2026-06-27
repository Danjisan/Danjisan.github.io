import { COMPONENT_TERMINALS } from "../../constants";
import type { CircuitEdge, CircuitNode, CircuitElectricMetadata, TerminalId } from "../../types";
import { collectBatteryReachablePins } from "../directedCircuit";
import { terminalKey } from "../terminalPositions";
import { electricalFor } from "./electricalFor";
import type { BuiltNetlist, CircuitStamp, ResistorStamp } from "./types";
import { UnionFind } from "./unionFind";

const OPEN_RESISTANCE = 1e12;

function collectPinKeys(nodes: CircuitNode[]): string[] {
  const keys: string[] = [];
  for (const node of nodes) {
    const terminals = COMPONENT_TERMINALS[node.type];
    for (const t of terminals) {
      keys.push(terminalKey(node.id, t.id));
    }
  }
  return keys;
}

function pinNode(pinToNode: Map<string, number>, pinKey: string): number {
  const n = pinToNode.get(pinKey);
  if (n === undefined) throw new Error(`Pin fără nod: ${pinKey}`);
  return n;
}

export function buildNetlist(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  models: CircuitElectricMetadata["models"],
): BuiltNetlist | null {
  const battery = nodes.find((n) => n.type === "battery");
  if (!battery) return null;

  const pinKeys = collectPinKeys(nodes);
  const uf = new UnionFind(pinKeys);

  for (const edge of edges) {
    uf.union(
      terminalKey(edge.from.nodeId, edge.from.terminal),
      terminalKey(edge.to.nodeId, edge.to.terminal),
    );
  }

  const groundPin = terminalKey(battery.id, "-");
  const groundRoot = uf.find(groundPin);

  const roots = uf.roots();
  const rootOrder = [groundRoot, ...roots.filter((r) => r !== groundRoot)];
  const rootToNode = new Map<string, number>();
  rootOrder.forEach((root, idx) => rootToNode.set(root, idx));

  let nextNode = rootOrder.length;
  const allocInternal = () => nextNode++;

  const pinToNode = new Map<string, number>();
  for (const pin of pinKeys) {
    pinToNode.set(pin, rootToNode.get(uf.find(pin))!);
  }

  const batteryReachable = collectBatteryReachablePins(nodes, edges);

  /** Stamp doar componente cu toate terminalele cablate și legate de rețeaua bateriei */
  const shouldStamp = (nodeId: string, terminals: TerminalId[]): boolean => {
    if (!terminals.every((t) => hasWireOnTerminal(edges, nodeId, t))) return false;
    return terminals.some((t) => batteryReachable.has(terminalKey(nodeId, t)));
  };

  const stamps: CircuitStamp[] = [];

  for (const node of nodes) {
    const id = node.id;

    switch (node.type) {
      case "battery": {
        const elec = electricalFor(models, "battery");
        const nPlus = pinNode(pinToNode, terminalKey(id, "+"));
        const nMinus = pinNode(pinToNode, terminalKey(id, "-"));
        const nInt = allocInternal();
        stamps.push({
          kind: "vsource",
          nPositive: nPlus,
          nNegative: nInt,
          volts: elec.voltage_v,
          componentId: id,
        });
        stamps.push({
          kind: "resistor",
          n1: nInt,
          n2: nMinus,
          ohms: Math.max(elec.internal_resistance_ohm, 0.01),
          componentId: `${id}:ri`,
        });
        break;
      }
      case "resistor": {
        if (!shouldStamp(id, ["a", "b"])) break;
        const elec = electricalFor(models, "resistor");
        stamps.push({
          kind: "resistor",
          n1: pinNode(pinToNode, terminalKey(id, "a")),
          n2: pinNode(pinToNode, terminalKey(id, "b")),
          ohms: Math.max(elec.resistance_ohm, 0.01),
          componentId: id,
        });
        break;
      }
      case "switch": {
        if (node.state.on === true && shouldStamp(id, ["a", "b"])) {
          const elec = electricalFor(models, "switch");
          stamps.push({
            kind: "resistor",
            n1: pinNode(pinToNode, terminalKey(id, "a")),
            n2: pinNode(pinToNode, terminalKey(id, "b")),
            ohms: Math.max(elec.contact_resistance_ohm, 0.001),
            componentId: id,
          });
        }
        break;
      }
      case "dc_motor": {
        if (!shouldStamp(id, ["+", "-"])) break;
        const elec = electricalFor(models, "dc_motor");
        stamps.push({
          kind: "resistor",
          n1: pinNode(pinToNode, terminalKey(id, "+")),
          n2: pinNode(pinToNode, terminalKey(id, "-")),
          ohms: Math.max(elec.winding_resistance_ohm, 0.01),
          componentId: id,
        });
        break;
      }
      case "potentiometer": {
        if (!shouldStamp(id, ["a", "b", "wiper"])) break;
        const elec = electricalFor(models, "potentiometer");
        const alpha = Math.min(1, Math.max(0, Number(node.state.value) || 0.5));
        const rTotal = Math.max(elec.total_resistance_ohm, 1);
        const nA = pinNode(pinToNode, terminalKey(id, "a"));
        const nW = pinNode(pinToNode, terminalKey(id, "wiper"));
        const nB = pinNode(pinToNode, terminalKey(id, "b"));
        stamps.push({
          kind: "resistor",
          n1: nA,
          n2: nW,
          ohms: Math.max(alpha * rTotal, 0.01),
          componentId: `${id}:aw`,
        });
        stamps.push({
          kind: "resistor",
          n1: nW,
          n2: nB,
          ohms: Math.max((1 - alpha) * rTotal, 0.01),
          componentId: `${id}:wb`,
        });
        break;
      }
      case "led":
        break;
    }
  }

  return {
    stamps,
    pinToNode,
    groundNode: 0,
    nodeCount: nextNode,
  };
}

export function buildLedConductingStamps(
  nodeId: string,
  pinToNode: Map<string, number>,
  vf: number,
  rOn: number,
  internalNode: number,
): CircuitStamp[] {
  const nPlus = pinNode(pinToNode, terminalKey(nodeId, "+"));
  const nMinus = pinNode(pinToNode, terminalKey(nodeId, "-"));
  return [
    {
      kind: "vsource",
      nPositive: nPlus,
      nNegative: internalNode,
      volts: vf,
      componentId: `${nodeId}:vf`,
    },
    {
      kind: "resistor",
      n1: internalNode,
      n2: nMinus,
      ohms: Math.max(rOn, 0.01),
      componentId: nodeId,
    },
  ];
}

export function ledOpenStamp(nodeId: string, pinToNode: Map<string, number>): ResistorStamp {
  return {
    kind: "resistor",
    n1: pinNode(pinToNode, terminalKey(nodeId, "+")),
    n2: pinNode(pinToNode, terminalKey(nodeId, "-")),
    ohms: OPEN_RESISTANCE,
    componentId: `${nodeId}:open`,
  };
}

export function hasWireOnTerminal(
  edges: CircuitEdge[],
  nodeId: string,
  terminal: TerminalId,
): boolean {
  const key = terminalKey(nodeId, terminal);
  return edges.some(
    (e) =>
      terminalKey(e.from.nodeId, e.from.terminal) === key ||
      terminalKey(e.to.nodeId, e.to.terminal) === key,
  );
}

export function isNodeBurned(node: CircuitNode): boolean {
  return node.type === "led" && node.state.burned === true;
}

export function emptyResult(): import("./types").DcSimulationResult {
  return {
    isClosed: false,
    ledOn: new Set(),
    motorRunning: new Set(),
    reversedLedIds: new Set(),
    burnedLedIds: new Set(),
    overcurrentLedIds: new Set(),
    shortCircuited: false,
    batteryCurrent_a: 0,
    hints: [],
    readings: new Map(),
    ledOvercurrent: new Map(),
    newFailures: [],
  };
}
