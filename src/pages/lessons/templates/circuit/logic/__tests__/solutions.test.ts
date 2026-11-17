import { describe, expect, it } from "vitest";
import { CIRCUIT_SOLUTIONS } from "../../../../../../content/circuits/solutions";
import { parseCircuitMetadata } from "../../parseMetadata";
import { buildInventory, partOfNode } from "../parts";
import { buildHelpSteps, solutionToCircuit } from "../solutionSteps";
import { isChallengeSolved } from "../validateCircuit";
import lesson from "./fixtures/circuit-electric-de-baza.json";

const { metadata } = parseCircuitMetadata(lesson as unknown as Record<string, unknown>);
const sim = { models: metadata.models, simulation: metadata.simulation };

describe("soluțiile de referință", () => {
  for (const challenge of metadata.challenges) {
    describe(challenge.id, () => {
      const solution = CIRCUIT_SOLUTIONS[challenge.id];

      it("are soluție", () => {
        expect(solution).toBeDefined();
      });

      it("rezolvă provocarea când întrerupătorul e închis", () => {
        const { nodes, edges } = solutionToCircuit(solution, true);
        expect(isChallengeSolved(nodes, edges, challenge, sim)).toBe(true);
      });

      it("nu e rezolvată cu întrerupătorul deschis", () => {
        const { nodes, edges } = solutionToCircuit(solution, false);
        expect(isChallengeSolved(nodes, edges, challenge, sim)).toBe(false);
      });

      it("folosește doar piese din inventarul provocării", () => {
        const inventory = buildInventory(challenge, metadata.components);
        const { nodes } = solutionToCircuit(solution);
        const used = new Map<string, number>();
        for (const n of nodes) used.set(partOfNode(n).id, (used.get(partOfNode(n).id) ?? 0) + 1);
        for (const [partId, count] of used) {
          const slot = inventory.find((s) => s.partId === partId);
          expect(slot, partId).toBeDefined();
          expect(count).toBeLessThanOrEqual(slot!.count);
        }
      });

      it("ajutorul are un pas pentru piese, câte unul pe fir și unul pentru întrerupător", () => {
        const steps = buildHelpSteps(solution, metadata.models);
        expect(steps.length).toBe(1 + solution.wires.length + 1);
        expect(steps[0].text).toMatch(/^Pune pe masă/);
        expect(steps[1].text).toMatch(/^Leagă \+ de la Baterie.* cu A de la Întrerupător/);
      });
    });
  }
});
