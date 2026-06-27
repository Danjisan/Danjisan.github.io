import type { CircuitEdge, CircuitNode, CircuitTerminalRef, TerminalId } from "../types";
import { terminalKey } from "./terminalPositions";

export interface DirectedSimulationResult {
  isClosed: boolean;
  ledOn: Set<string>;
  motorRunning: Set<string>;
  reversedLedIds: Set<string>;
  hints: string[];
}

function parseKey(key: string): CircuitTerminalRef {
  const sep = key.lastIndexOf(":");
  return {
    nodeId: key.slice(0, sep),
    terminal: key.slice(sep + 1) as TerminalId,
  };
}

function wireNeighbors(key: string, edges: CircuitEdge[]): string[] {
  const neighbors: string[] = [];
  for (const edge of edges) {
    const fromKey = terminalKey(edge.from.nodeId, edge.from.terminal);
    const toKey = terminalKey(edge.to.nodeId, edge.to.terminal);
    if (fromKey === key) neighbors.push(toKey);
    if (toKey === key) neighbors.push(fromKey);
  }
  return neighbors;
}

function internalForwardNeighbors(key: string, node: CircuitNode): string[] {
  const { terminal } = parseKey(key);
  const { type, state } = node;

  if (type === "switch" && !state.on) return [];

  if (type === "resistor" || type === "switch") {
    if (terminal === "a") return [terminalKey(node.id, "b")];
    if (terminal === "b") return [terminalKey(node.id, "a")];
  }

  if (type === "potentiometer") {
    if (terminal === "a") return [terminalKey(node.id, "wiper")];
    if (terminal === "wiper") return [terminalKey(node.id, "a"), terminalKey(node.id, "b")];
    if (terminal === "b") return [terminalKey(node.id, "wiper")];
  }

  if (type === "led" || type === "dc_motor") {
    if (terminal === "+") return [terminalKey(node.id, "-")];
  }

  return [];
}

function internalUndirectedNeighbors(key: string, node: CircuitNode): string[] {
  const { terminal } = parseKey(key);
  const { type, state } = node;

  if (type === "switch" && !state.on) return [];

  if (type === "resistor" || type === "switch") {
    if (terminal === "a") return [terminalKey(node.id, "b")];
    if (terminal === "b") return [terminalKey(node.id, "a")];
  }

  if (type === "potentiometer") {
    if (terminal === "a") return [terminalKey(node.id, "wiper")];
    if (terminal === "wiper") return [terminalKey(node.id, "a"), terminalKey(node.id, "b")];
    if (terminal === "b") return [terminalKey(node.id, "wiper")];
  }

  if (type === "led" || type === "dc_motor") {
    if (terminal === "+") return [terminalKey(node.id, "-")];
    if (terminal === "-") return [terminalKey(node.id, "+")];
  }

  if (type === "wire_junction") {
    return (["a", "b", "c"] as TerminalId[])
      .filter((t) => t !== terminal)
      .map((t) => terminalKey(node.id, t));
  }

  return [];
}

function allDirectedNeighbors(
  key: string,
  nodeMap: Map<string, CircuitNode>,
  edges: CircuitEdge[],
): string[] {
  const { nodeId } = parseKey(key);
  const node = nodeMap.get(nodeId);
  if (!node) return wireNeighbors(key, edges);
  return [...wireNeighbors(key, edges), ...internalForwardNeighbors(key, node)];
}

function allUndirectedNeighbors(
  key: string,
  nodeMap: Map<string, CircuitNode>,
  edges: CircuitEdge[],
): string[] {
  const { nodeId } = parseKey(key);
  const node = nodeMap.get(nodeId);
  if (!node) return wireNeighbors(key, edges);
  return [...wireNeighbors(key, edges), ...internalUndirectedNeighbors(key, node)];
}

function findDirectedPath(
  startKey: string,
  goalKey: string,
  nodeMap: Map<string, CircuitNode>,
  edges: CircuitEdge[],
): string[] | null {
  const visited = new Set<string>([startKey]);
  const queue: string[][] = [[startKey]];

  while (queue.length > 0) {
    const path = queue.shift()!;
    const current = path[path.length - 1];

    if (current === goalKey) return path;

    for (const next of allDirectedNeighbors(current, nodeMap, edges)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }

  return null;
}

/** Terminale conectate la rețeaua bateriei (fire + legături interne ale componentelor). */
export function collectBatteryReachablePins(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
): Set<string> {
  const battery = nodes.find((n) => n.type === "battery");
  if (!battery) return new Set();

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const seeds = [terminalKey(battery.id, "+"), terminalKey(battery.id, "-")];
  const visited = new Set<string>(seeds);
  const queue = [...seeds];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of allUndirectedNeighbors(current, nodeMap, edges)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return visited;
}

/** Circuit extern închis: drum de la baterie + la − prin fire și componente (fără „scurt” intern al bateriei). */
export function isBatteryLoopClosed(nodes: CircuitNode[], edges: CircuitEdge[]): boolean {
  const battery = nodes.find((n) => n.type === "battery");
  if (!battery) return false;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return isUndirectedClosed(
    terminalKey(battery.id, "+"),
    terminalKey(battery.id, "-"),
    nodeMap,
    edges,
  );
}

function isUndirectedClosed(
  startKey: string,
  goalKey: string,
  nodeMap: Map<string, CircuitNode>,
  edges: CircuitEdge[],
): boolean {
  const visited = new Set<string>([startKey]);
  const queue = [startKey];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === goalKey) return true;
    for (const next of allUndirectedNeighbors(current, nodeMap, edges)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return false;
}

function hasWireAt(key: string, edges: CircuitEdge[]): boolean {
  return edges.some((e) => {
    const fromKey = terminalKey(e.from.nodeId, e.from.terminal);
    const toKey = terminalKey(e.to.nodeId, e.to.terminal);
    return fromKey === key || toKey === key;
  });
}

function isPolarizedOnPath(path: string[], nodeId: string): boolean {
  const plusKey = terminalKey(nodeId, "+");
  const minusKey = terminalKey(nodeId, "-");

  for (let i = 0; i < path.length - 1; i++) {
    if (path[i] === plusKey && path[i + 1] === minusKey) return true;
  }
  return false;
}

function directedReachable(
  startKey: string,
  nodeMap: Map<string, CircuitNode>,
  edges: CircuitEdge[],
): Set<string> {
  const visited = new Set<string>([startKey]);
  const queue = [startKey];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const next of allDirectedNeighbors(current, nodeMap, edges)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return visited;
}

export function analyzeDirectedCircuit(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
): DirectedSimulationResult {
  const ledOn = new Set<string>();
  const motorRunning = new Set<string>();
  const reversedLedIds = new Set<string>();
  const hints: string[] = [];

  const battery = nodes.find((n) => n.type === "battery");
  if (!battery) {
    return { isClosed: false, ledOn, motorRunning, reversedLedIds, hints };
  }

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const startKey = terminalKey(battery.id, "+");
  const goalKey = terminalKey(battery.id, "-");

  const path = findDirectedPath(startKey, goalKey, nodeMap, edges);
  const isClosed = path !== null;

  if (path) {
    for (const node of nodes) {
      if (node.type === "led" && isPolarizedOnPath(path, node.id)) {
        ledOn.add(node.id);
      }
      if (node.type === "dc_motor" && isPolarizedOnPath(path, node.id)) {
        motorRunning.add(node.id);
      }
    }
  }

  const undirectedClosed = isUndirectedClosed(startKey, goalKey, nodeMap, edges);
  const reachable = directedReachable(startKey, nodeMap, edges);

  for (const node of nodes) {
    if (node.type !== "led") continue;

    const plusKey = terminalKey(node.id, "+");
    const minusKey = terminalKey(node.id, "-");
    if (!hasWireAt(plusKey, edges) || !hasWireAt(minusKey, edges)) continue;
    if (ledOn.has(node.id)) continue;

    const minusReachable = reachable.has(minusKey);
    const plusReachable = reachable.has(plusKey);

    if (undirectedClosed && minusReachable && !plusReachable) {
      reversedLedIds.add(node.id);
    } else if (undirectedClosed && plusReachable && minusReachable && !isPolarizedOnPath(path ?? [], node.id)) {
      reversedLedIds.add(node.id);
    }
  }

  const openSwitch = nodes.find((n) => n.type === "switch" && !n.state.on);
  if (openSwitch && !undirectedClosed && edges.length > 0) {
    hints.push("Întrerupătorul e deschis — închide-l ca să circule curentul.");
  }

  if (reversedLedIds.size > 0) {
    hints.push("LED-ul pare montat invers — verifică polaritatea (+/−).");
  } else if (!isClosed && edges.length > 0 && undirectedClosed) {
    hints.push("Circuitul e conectat, dar polaritatea sau ordinea nu e corectă.");
  } else if (!isClosed && edges.length > 0 && !hints.length) {
    hints.push("Circuitul nu e închis — verifică că toate componentele sunt legate.");
  }

  return { isClosed, ledOn, motorRunning, reversedLedIds, hints };
}
