import type { BuiltNetlist, CircuitStamp, MnaSolution, ResistorStamp } from "./types";

function nodeVAt(voltages: number[], node: number): number {
  return voltages[node] ?? 0;
}

/** Rezolvă MNA DC; nod 0 = masă. `nodeCount` poate fi > netlist.nodeCount dacă extraStamps adaugă noduri interne. */
export function solveMna(
  netlist: BuiltNetlist,
  extraStamps: CircuitStamp[] = [],
  nodeCount = netlist.nodeCount,
): MnaSolution | null {
  const stamps: CircuitStamp[] = [...netlist.stamps, ...extraStamps];
  const n = nodeCount;
  if (n < 2) return null;

  const vSources = stamps.filter((s): s is Extract<CircuitStamp, { kind: "vsource" }> => s.kind === "vsource");
  const resistors = stamps.filter((s): s is ResistorStamp => s.kind === "resistor");

  const m = vSources.length;
  const size = n - 1 + m;
  if (size === 0) {
    return { nodeVoltages: new Array(n).fill(0), sourceCurrents: [], branchCurrents: new Map() };
  }

  const A: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
  const b = new Array(size).fill(0);

  for (const r of resistors) {
    const g = 1 / r.ohms;
    const a = r.n1;
    const c = r.n2;
    if (a !== 0) {
      const ia = a - 1;
      A[ia][ia] += g;
    }
    if (c !== 0) {
      const ic = c - 1;
      A[ic][ic] += g;
    }
    if (a !== 0 && c !== 0) {
      const ia = a - 1;
      const ic = c - 1;
      A[ia][ic] -= g;
      A[ic][ia] -= g;
    }
  }

  for (let j = 0; j < m; j++) {
    const vs = vSources[j];
    const row = n - 1 + j;
    const np = vs.nPositive;
    const nn = vs.nNegative;

    if (np !== 0) {
      A[np - 1][row] += 1;
      A[row][np - 1] += 1;
    }
    if (nn !== 0) {
      A[nn - 1][row] -= 1;
      A[row][nn - 1] -= 1;
    }
    b[row] = vs.volts;
  }

  const x = solveLinear(A, b);
  if (!x) return null;

  /** Indexat pe număr nod: voltages[0]=masă, voltages[i]=tensiune nod i */
  const nodeVoltages = [0, ...x.slice(0, n - 1)];
  const sourceCurrents = x.slice(n - 1);

  const branchCurrents = new Map<string, number>();
  for (const r of resistors) {
    const i = (nodeVAt(nodeVoltages, r.n1) - nodeVAt(nodeVoltages, r.n2)) / r.ohms;
    branchCurrents.set(r.componentId, i);
  }

  for (let j = 0; j < m; j++) {
    branchCurrents.set(vSources[j].componentId, sourceCurrents[j]);
  }

  return { nodeVoltages, sourceCurrents, branchCurrents };
}

function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const aug = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivot][col])) pivot = row;
    }
    if (Math.abs(aug[pivot][col]) < 1e-12) return null;

    [aug[col], aug[pivot]] = [aug[pivot], aug[col]];

    const div = aug[col][col];
    for (let j = col; j <= n; j++) aug[col][j] /= div;

    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      if (Math.abs(factor) < 1e-15) continue;
      for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
    }
  }

  return aug.map((row) => row[n]);
}

export function nodeVoltage(solution: MnaSolution, node: number): number {
  return solution.nodeVoltages[node] ?? 0;
}