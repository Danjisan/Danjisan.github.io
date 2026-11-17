import { describe, expect, it } from "vitest";
import { PARTS } from "../../../../../../content/circuits/parts";
import { resistorBandColors } from "../../components/ComponentIcon";
import { runDcSimulation } from "../sim/dcSimulation";
import { edge, node, testMetadata } from "../sim/__tests__/testModels";
import { buildInventory, canPlacePart, electricalForNode, partOfNode } from "../parts";
import type { CircuitChallenge } from "../../types";

function challenge(extra: Partial<CircuitChallenge>): CircuitChallenge {
  return {
    id: "c",
    order: 1,
    title: "c",
    description: "",
    hint: "",
    win_condition: { type: "component_state", target: "led", state: "on" },
    required_types: [],
    ...extra,
  };
}

describe("catalogul de piese", () => {
  it("id-urile sunt unice", () => {
    const ids = PARTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("nodurile vechi, fără partId, primesc piesa implicită a tipului", () => {
    expect(partOfNode(node("r", "resistor")).id).toBe("resistor-220");
    expect(electricalForNode(testMetadata.models, node("r", "resistor"), "resistor").resistance_ohm).toBe(220);
  });

  it("piesa suprascrie doar valorile ei", () => {
    const blue = node("l", "led", { flipped: false, partId: "led-blue" });
    const e = electricalForNode(testMetadata.models, blue, "led");
    expect(e.forward_voltage_v).toBe(3);
    expect(e.max_current_a).toBe(electricalForNode(testMetadata.models, node("x", "led"), "led").max_current_a);
  });

  it("220 Ω și 1 kΩ în serie: curentul ține cont de amândouă", () => {
    const nodes = [
      node("bat", "battery"),
      node("r1", "resistor", { flipped: false, partId: "resistor-220" }),
      node("r2", "resistor", { flipped: false, partId: "resistor-1k" }),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "r1", terminal: "a" }),
      edge({ nodeId: "r1", terminal: "b" }, { nodeId: "r2", terminal: "a" }),
      edge({ nodeId: "r2", terminal: "b" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    // 9 V / (220 + 1000 + 2 internă) ≈ 7,36 mA
    expect(sim.batteryCurrent_a * 1000).toBeCloseTo(9000 / 1222, 1);
    // pe rezistorul mai mare cade mai multă tensiune
    expect(sim.readings.get("r2")!.voltage_v).toBeGreaterThan(sim.readings.get("r1")!.voltage_v * 4);
  });

  it("LED-ul albastru (3 V) cere mai multă tensiune decât cel roșu, deci primește mai puțin curent", () => {
    const circuit = (partId: string) =>
      runDcSimulation(
        [
          node("bat", "battery", { flipped: false, partId: "battery-4v5" }),
          node("r", "resistor", { flipped: false, partId: "resistor-100" }),
          node("l", "led", { flipped: false, partId }),
        ],
        [
          edge({ nodeId: "bat", terminal: "+" }, { nodeId: "r", terminal: "a" }),
          edge({ nodeId: "r", terminal: "b" }, { nodeId: "l", terminal: "+" }),
          edge({ nodeId: "l", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
        ],
        testMetadata,
      ).readings.get("l")!.current_a;
    expect(circuit("led-red")).toBeGreaterThan(circuit("led-blue"));
  });
});

describe("inventarul", () => {
  it("din required_types: câte o piesă implicită pentru fiecare apariție", () => {
    const inv = buildInventory(
      challenge({ required_types: ["battery", "led", "wire_junction", "wire_junction"] }),
      [],
    );
    expect(inv).toEqual([
      { partId: "battery-9v", count: 1 },
      { partId: "led-red", count: 1 },
      { partId: "junction", count: 2 },
    ]);
  });

  it("inventory explicit are prioritate și ignoră piese necunoscute", () => {
    const inv = buildInventory(
      challenge({
        required_types: ["battery"],
        inventory: [
          { partId: "led-green", count: 2 },
          { partId: "nu-exista", count: 1 },
        ],
      }),
      [],
    );
    expect(inv).toEqual([{ partId: "led-green", count: 2 }]);
  });

  it("limita se aplică pe piesă", () => {
    const inv = [{ partId: "led-red", count: 2 }];
    const one = [node("a", "led", { flipped: false, partId: "led-red" })];
    const two = [...one, node("b", "led", { flipped: false, partId: "led-red" })];
    expect(canPlacePart(one, inv, "led-red")).toBe(true);
    expect(canPlacePart(two, inv, "led-red")).toBe(false);
    expect(canPlacePart(one, inv, "led-blue")).toBe(false);
  });
});

describe("benzile rezistorului", () => {
  it("220 Ω → roșu roșu maro, 1 kΩ → maro negru roșu, 100 Ω → maro negru maro", () => {
    const [red, brown, black] = ["#d32f2f", "#6d3b1f", "#111111"];
    expect(resistorBandColors(220)).toEqual([red, red, brown]);
    expect(resistorBandColors(1000)).toEqual([brown, black, red]);
    expect(resistorBandColors(100)).toEqual([brown, black, brown]);
  });
});
