import { describe, expect, it } from "vitest";
import { checkComponentStateWin } from "../challengeWin";
import { emptyResult } from "../sim/netlist";
import { node } from "../sim/__tests__/testModels";

describe("checkComponentStateWin", () => {
  it("se uită la toate piesele de tipul cerut, nu doar la prima", () => {
    const nodes = [node("led1", "led"), node("led2", "led")];
    const sim = emptyResult();
    sim.ledOn.add("led2");

    expect(checkComponentStateWin({ target: "led", state: "on" }, nodes, sim)).toBe(true);
  });

  it("un LED ars nu contează ca aprins", () => {
    const nodes = [node("led1", "led")];
    const sim = emptyResult();
    sim.ledOn.add("led1");
    sim.burnedLedIds.add("led1");

    expect(checkComponentStateWin({ target: "led", state: "on" }, nodes, sim)).toBe(false);
  });
});
