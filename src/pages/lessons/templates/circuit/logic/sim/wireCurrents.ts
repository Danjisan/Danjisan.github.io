import type { CircuitEdge, CircuitNode, TerminalId } from "../../types";
import { terminalKey } from "../terminalPositions";
import type { MnaSolution } from "./types";

/** Sub acest prag (A) considerăm că prin fir nu trece curent. */
export const WIRE_CURRENT_EPSILON_A = 1e-6;

/**
 * Curentul (A, sens convențional) pe care fiecare piesă îl împinge în rețeaua de fire,
 * pe fiecare terminal. Pozitiv = iese din piesă în fir.
 */
function terminalInjections(nodes: CircuitNode[], solution: MnaSolution): Map<string, number> {
  const inj = new Map<string, number>();
  const add = (nodeId: string, t: TerminalId, i: number) => {
    const k = terminalKey(nodeId, t);
    inj.set(k, (inj.get(k) ?? 0) + i);
  };
  const branch = (id: string) => solution.branchCurrents.get(id);

  for (const node of nodes) {
    const id = node.id;
    switch (node.type) {
      case "battery": {
        // Rezistența internă e legată între sursă și borna −; curentul ei intră în rețea pe −.
        const i = branch(`${id}:ri`) ?? 0;
        add(id, "-", i);
        add(id, "+", -i);
        break;
      }
      case "resistor":
      case "switch": {
        const i = branch(id) ?? 0; // a → b
        add(id, "b", i);
        add(id, "a", -i);
        break;
      }
      case "dc_motor": {
        const i = branch(id) ?? 0; // + → −
        add(id, "-", i);
        add(id, "+", -i);
        break;
      }
      case "led": {
        const i = branch(id) ?? branch(`${id}:open`) ?? 0; // + → −
        add(id, "-", i);
        add(id, "+", -i);
        break;
      }
      case "potentiometer": {
        const iaw = branch(`${id}:aw`) ?? 0; // a → wiper
        const iwb = branch(`${id}:wb`) ?? 0; // wiper → b
        add(id, "a", -iaw);
        add(id, "wiper", iaw - iwb);
        add(id, "b", iwb);
        break;
      }
      case "wire_junction":
        break;
    }
  }
  return inj;
}

/**
 * Curentul prin fiecare fir, în sens convențional de la `edge.from` spre `edge.to` (A).
 *
 * Simulatorul unește firele în noduri electrice, deci nu știe direct ce curent trece prin fiecare fir.
 * Îl reconstruim: fiecare grup de fire legate e un graf; pe un arbore de acoperire, curentul printr-un
 * fir = suma curenților injectați de piese în partea „de dedesubt” a firului. Firele care închid bucle
 * fără nicio piesă (fir paralel cu alt fir) primesc 0.
 */
export function computeWireCurrents(
  nodes: CircuitNode[],
  edges: CircuitEdge[],
  solution: MnaSolution,
): Map<string, number> {
  const pinInj = terminalInjections(nodes, solution);

  // Terminalele unui nod de legătură sunt același punct electric → un singur vârf.
  const junctionIds = new Set(nodes.filter((n) => n.type === "wire_junction").map((n) => n.id));
  const vertexOf = (nodeId: string, t: TerminalId) =>
    junctionIds.has(nodeId) ? `j:${nodeId}` : terminalKey(nodeId, t);

  const vertexInj = new Map<string, number>();
  for (const [pin, i] of pinInj) vertexInj.set(pin, (vertexInj.get(pin) ?? 0) + i);

  const adjacency = new Map<string, { edge: CircuitEdge; other: string; fromSide: boolean }[]>();
  const link = (v: string, entry: { edge: CircuitEdge; other: string; fromSide: boolean }) => {
    const list = adjacency.get(v);
    if (list) list.push(entry);
    else adjacency.set(v, [entry]);
  };
  for (const edge of edges) {
    const a = vertexOf(edge.from.nodeId, edge.from.terminal);
    const b = vertexOf(edge.to.nodeId, edge.to.terminal);
    link(a, { edge, other: b, fromSide: true });
    link(b, { edge, other: a, fromSide: false });
  }

  const result = new Map<string, number>();
  for (const edge of edges) result.set(edge.id, 0);

  const visited = new Set<string>();
  for (const root of adjacency.keys()) {
    if (visited.has(root)) continue;

    // BFS: ordinea de vizitare + firul prin care am ajuns în fiecare vârf.
    const order: string[] = [];
    const parentEdge = new Map<string, { edge: CircuitEdge; parent: string; childIsFrom: boolean }>();
    visited.add(root);
    const queue = [root];
    while (queue.length > 0) {
      const v = queue.shift()!;
      order.push(v);
      for (const { edge, other, fromSide } of adjacency.get(v) ?? []) {
        if (visited.has(other)) continue;
        visited.add(other);
        // `other` e copil; e capătul `from` al firului dacă `v` e pe partea `to`.
        parentEdge.set(other, { edge, parent: v, childIsFrom: !fromSide });
        queue.push(other);
      }
    }

    // De la frunze spre rădăcină: ce injectează subarborele iese prin firul spre părinte.
    const subtree = new Map<string, number>();
    for (let k = order.length - 1; k >= 0; k--) {
      const v = order[k];
      const s = (subtree.get(v) ?? 0) + (vertexInj.get(v) ?? 0);
      const pe = parentEdge.get(v);
      if (!pe) continue;
      subtree.set(pe.parent, (subtree.get(pe.parent) ?? 0) + s);
      // Curentul curge de la copil spre părinte cu valoarea s.
      result.set(pe.edge.id, pe.childIsFrom ? s : -s);
    }
  }

  for (const [id, i] of result) {
    if (Math.abs(i) < WIRE_CURRENT_EPSILON_A) result.set(id, 0);
  }
  return result;
}
