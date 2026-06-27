import { describe, expect, it } from "vitest";
import { checkComponentStateWin } from "../challengeWin";
import { isChallengeSolved } from "../validateCircuit";
import { edge, node, testMetadata } from "../sim/__tests__/testModels";
import type { CircuitChallenge } from "../../types";

describe("isChallengeSolved", () => {
  const serieChallenge: CircuitChallenge = {
    id: "led-basic",
    order: 1,
    title: "LED",
    description: "",
    hint: "",
    required_types: ["battery", "switch", "resistor", "led"],
    win_condition: { type: "component_state", target: "led", state: "on" },
  };

  const parallelChallenge: CircuitChallenge = {
    id: "led-motor-parallel",
    order: 3,
    title: "Parallel",
    description: "",
    hint: "",
    required_types: [
      "battery",
      "switch",
      "resistor",
      "led",
      "dc_motor",
      "wire_junction",
      "wire_junction",
    ],
    win_condition: {
      type: "component_state",
      target: "dc_motor",
      state: "running",
      also: [{ target: "led", state: "on" }],
    },
  };

  it("serie LED — rezolvată când LED aprins", () => {
    const nodes = [
      node("bat", "battery"),
      node("sw", "switch", { on: true }),
      node("res", "resistor"),
      node("led", "led"),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    expect(isChallengeSolved(nodes, edges, serieChallenge, testMetadata)).toBe(true);
  });

  it("provocare paralel — motor + LED cu noduri de legătură", () => {
    const nodes = [
      node("bat", "battery"),
      node("sw", "switch", { on: true }),
      node("j1", "wire_junction"),
      node("j2", "wire_junction"),
      node("res", "resistor"),
      node("led", "led"),
      node("motor", "dc_motor"),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "j1", terminal: "a" }),
      edge({ nodeId: "j1", terminal: "b" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "j1", terminal: "c" }, { nodeId: "motor", terminal: "+" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "j2", terminal: "a" }),
      edge({ nodeId: "motor", terminal: "-" }, { nodeId: "j2", terminal: "b" }),
      edge({ nodeId: "j2", terminal: "c" }, { nodeId: "bat", terminal: "-" }),
    ];
    expect(isChallengeSolved(nodes, edges, parallelChallenge, testMetadata)).toBe(true);
  });

  it("on_polarized eșuează când LED e invers", () => {
    const sim = {
      ledOn: new Set<string>(),
      reversedLedIds: new Set(["led"]),
      burnedLedIds: new Set<string>(),
      motorRunning: new Set<string>(),
    } as Parameters<typeof checkComponentStateWin>[2];

    expect(
      checkComponentStateWin({ target: "led", state: "on_polarized" }, [node("led", "led")], sim),
    ).toBe(false);
  });
});
