import type { CircuitSolution } from "../../../../../content/circuits/solutions";
import type { CircuitEdge, CircuitNode, ComponentModel, ComponentType, TerminalId } from "../types";
import { defaultNodeState } from "./nodeDefaults";
import { getPart, modelForPart } from "./parts";

export interface SolutionCircuit {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
}

function splitRef(ref: string): { nodeId: string; terminal: TerminalId } {
  const i = ref.lastIndexOf(":");
  return { nodeId: ref.slice(0, i), terminal: ref.slice(i + 1) as TerminalId };
}

/** Circuitul complet al soluției; `switchesOn` închide întrerupătoarele. */
export function solutionToCircuit(solution: CircuitSolution, switchesOn = true): SolutionCircuit {
  const nodes: CircuitNode[] = solution.parts.flatMap((p) => {
    const part = getPart(p.part);
    if (!part) return [];
    const state: Record<string, unknown> = { ...defaultNodeState(part.type), partId: part.id };
    if (part.type === "switch") state.on = switchesOn;
    return [{ id: p.id, type: part.type, position: { x: p.x, y: p.y }, state }];
  });
  const edges: CircuitEdge[] = solution.wires.map(([a, b], i) => ({
    id: `w${i}`,
    from: splitRef(a),
    to: splitRef(b),
  }));
  return { nodes, edges };
}

export interface HelpStep {
  text: string;
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  /** Firul adăugat la pasul ăsta (evidențiat) */
  newEdgeId: string | null;
}

/**
 * Numele afișate ale pieselor din soluție. Când două piese au același nume (ex. două noduri),
 * le numerotăm: „Nodul de legătură 1”, „Nodul de legătură 2”. Numărul apare și pe desen.
 */
export function solutionPartNames(
  solution: CircuitSolution,
  models: Record<ComponentType, ComponentModel>,
): { names: Map<string, string>; badges: Map<string, string> } {
  const base = new Map<string, string>();
  for (const p of solution.parts) {
    const part = getPart(p.part);
    base.set(p.id, part ? modelForPart(part, models).label : p.id);
  }
  const totals = new Map<string, number>();
  for (const label of base.values()) totals.set(label, (totals.get(label) ?? 0) + 1);

  const names = new Map<string, string>();
  const badges = new Map<string, string>();
  const seen = new Map<string, number>();
  for (const p of solution.parts) {
    const label = base.get(p.id)!;
    if ((totals.get(label) ?? 0) > 1) {
      const n = (seen.get(label) ?? 0) + 1;
      seen.set(label, n);
      names.set(p.id, `${label} ${n}`);
      badges.set(p.id, String(n));
    } else {
      names.set(p.id, label);
    }
  }
  return { names, badges };
}

const TERMINAL_NAMES: Record<string, string> = { "+": "+", "-": "−", a: "A", b: "B", c: "C", wiper: "W" };

/**
 * Pașii din „Ajutor”: întâi piesele, apoi câte un fir, la final se închid întrerupătoarele.
 */
export function buildHelpSteps(
  solution: CircuitSolution,
  models: Record<ComponentType, ComponentModel>,
): HelpStep[] {
  const open = solutionToCircuit(solution, false);
  const closed = solutionToCircuit(solution, true);
  const { names } = solutionPartNames(solution, models);
  const labelOf = (nodeId: string) => names.get(nodeId) ?? nodeId;
  const describe = (ref: { nodeId: string; terminal: TerminalId }) =>
    `${TERMINAL_NAMES[ref.terminal] ?? ref.terminal} de la ${labelOf(ref.nodeId)}`;

  const partNames = solution.parts.map((p) => labelOf(p.id));
  const steps: HelpStep[] = [
    {
      text: `Pune pe masă: ${partNames.join(", ")}.`,
      nodes: open.nodes,
      edges: [],
      newEdgeId: null,
    },
  ];

  open.edges.forEach((edge, i) => {
    steps.push({
      text: `Leagă ${describe(edge.from)} cu ${describe(edge.to)}.`,
      nodes: open.nodes,
      edges: open.edges.slice(0, i + 1),
      newEdgeId: edge.id,
    });
  });

  if (open.nodes.some((n) => n.type === "switch")) {
    steps.push({
      text: "Închide întrerupătorul. Uită-te cum pornesc electronii prin fire.",
      nodes: closed.nodes,
      edges: closed.edges,
      newEdgeId: null,
    });
  }
  return steps;
}
