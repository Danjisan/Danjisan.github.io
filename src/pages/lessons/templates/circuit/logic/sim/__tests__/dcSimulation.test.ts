import { describe, expect, it } from "vitest";
import { runDcSimulation } from "../dcSimulation";
import { edge, node, testMetadata } from "./testModels";

describe("runDcSimulation", () => {
  const bat = node("bat", "battery");
  const sw = node("sw", "switch", { flipped: false, on: true });
  const led = node("led", "led");
  const res = node("res", "resistor");
  const motor = node("motor", "dc_motor");

  it("serie cu rezistor după LED (~29 mA, fără ardere)", () => {
    const nodes = [bat, sw, led, res];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    const iMa = (sim.readings.get("led")?.current_a ?? 0) * 1000;

    expect(sim.isClosed).toBe(true);
    expect(sim.ledOn.has("led")).toBe(true);
    expect(iMa).toBeGreaterThan(26);
    expect(iMa).toBeLessThan(33);
    expect(sim.ledOvercurrent.has("led")).toBe(false);
  });

  it("serie cu rezistor înainte de LED — același curent (±1 mA)", () => {
    const nodes = [bat, sw, res, led];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    const iMa = (sim.readings.get("led")?.current_a ?? 0) * 1000;

    expect(sim.ledOn.has("led")).toBe(true);
    expect(iMa).toBeGreaterThan(26);
    expect(iMa).toBeLessThan(33);
    expect(sim.ledOvercurrent.has("led")).toBe(false);
  });

  it("LED direct pe baterie → overcurrent", () => {
    const nodes = [bat, led];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    const iMa = (sim.readings.get("led")?.current_a ?? 0) * 1000;

    expect(sim.isClosed).toBe(true);
    expect(iMa).toBeGreaterThan(80);
    expect(sim.ledOvercurrent.has("led")).toBe(true);
  });

  it("motor cu un singur terminal cablat → nu rulează", () => {
    const nodes = [bat, motor];
    const edges = [edge({ nodeId: "bat", terminal: "+" }, { nodeId: "motor", terminal: "+" })];
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.motorRunning.has("motor")).toBe(false);
    expect(sim.isClosed).toBe(false);
  });

  it("întrerupător deschis → circuit deschis", () => {
    const swOpen = node("sw", "switch", { flipped: false, on: false });
    const nodes = [bat, swOpen, res, led];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.isClosed).toBe(false);
    expect(sim.ledOn.has("led")).toBe(false);
  });

  it("motor în buclă închisă → rulează", () => {
    const swClosed = node("sw", "switch", { flipped: false, on: true });
    const nodes = [bat, swClosed, motor];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "motor", terminal: "+" }),
      edge({ nodeId: "motor", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.isClosed).toBe(true);
    expect(sim.motorRunning.has("motor")).toBe(true);
  });

  it("LED și motor în paralel → ambele active", () => {
    const swClosed = node("sw", "switch", { flipped: false, on: true });
    const nodes = [bat, swClosed, res, led, motor];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "motor", terminal: "+" }),
      edge({ nodeId: "motor", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.isClosed).toBe(true);
    expect(sim.ledOn.has("led")).toBe(true);
    expect(sim.motorRunning.has("motor")).toBe(true);
  });
});
