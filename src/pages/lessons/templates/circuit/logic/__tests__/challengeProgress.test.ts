import { describe, expect, it } from "vitest";
import type { CircuitChallenge } from "../../types";
import { challengeStatuses, firstUnsolvedIndex, startingIndex } from "../challengeProgress";

function challenge(id: string, order: number): CircuitChallenge {
  return {
    id,
    order,
    title: id,
    description: "",
    hint: "",
    win_condition: { type: "component_state", target: "led", state: "on" },
    required_types: [],
  };
}

const list = [challenge("c1", 1), challenge("c2", 2), challenge("c3", 3)];

describe("challengeProgress", () => {
  it("la început doar prima e deschisă", () => {
    expect(challengeStatuses(list, new Set())).toEqual(["open", "locked", "locked"]);
    expect(startingIndex(list, new Set())).toBe(0);
  });

  it("după primele două rezolvate, a treia e următoarea", () => {
    const solved = new Set(["c1", "c2"]);
    expect(challengeStatuses(list, solved)).toEqual(["solved", "solved", "open"]);
    expect(startingIndex(list, solved)).toBe(2);
  });

  it("toate rezolvate → pornește de la ultima, nimic blocat", () => {
    const solved = new Set(["c1", "c2", "c3"]);
    expect(firstUnsolvedIndex(list, solved)).toBe(-1);
    expect(challengeStatuses(list, solved)).toEqual(["solved", "solved", "solved"]);
    expect(startingIndex(list, solved)).toBe(2);
  });

  it("id-uri vechi din stocare care nu mai există sunt ignorate", () => {
    const solved = new Set(["vechi"]);
    expect(challengeStatuses(list, solved)).toEqual(["open", "locked", "locked"]);
  });
});
