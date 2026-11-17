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

  it("LED și motor în paralel (noduri de legătură) → ambele active", () => {
    const swClosed = node("sw", "switch", { flipped: false, on: true });
    const j1 = node("j1", "wire_junction");
    const j2 = node("j2", "wire_junction");
    const nodes = [bat, swClosed, j1, j2, res, led, motor];
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
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.isClosed).toBe(true);
    expect(sim.ledOn.has("led")).toBe(true);
    expect(sim.motorRunning.has("motor")).toBe(true);
  });
});

describe("runDcSimulation — cazuri neliniare și potențiometru", () => {
  const bat = node("bat", "battery");

  it("LED singur în paralel cu două LED-uri în serie → doar LED-ul singur se aprinde", () => {
    const nodes = [
      bat,
      node("res", "resistor"),
      node("j1", "wire_junction"),
      node("j2", "wire_junction"),
      node("ledA", "led"),
      node("ledB", "led"),
      node("ledC", "led"),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "j1", terminal: "a" }),
      edge({ nodeId: "j1", terminal: "b" }, { nodeId: "ledA", terminal: "+" }),
      edge({ nodeId: "j1", terminal: "c" }, { nodeId: "ledB", terminal: "+" }),
      edge({ nodeId: "ledB", terminal: "-" }, { nodeId: "ledC", terminal: "+" }),
      edge({ nodeId: "ledA", terminal: "-" }, { nodeId: "j2", terminal: "a" }),
      edge({ nodeId: "ledC", terminal: "-" }, { nodeId: "j2", terminal: "b" }),
      edge({ nodeId: "j2", terminal: "c" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.ledOn.has("ledA")).toBe(true);
    expect(sim.ledOn.has("ledB")).toBe(false);
    expect(sim.ledOn.has("ledC")).toBe(false);
  });

  it("două LED-uri în serie cu rezistor → ambele aprinse, același curent", () => {
    const nodes = [bat, node("res", "resistor"), node("ledA", "led"), node("ledB", "led")];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "ledA", terminal: "+" }),
      edge({ nodeId: "ledA", terminal: "-" }, { nodeId: "ledB", terminal: "+" }),
      edge({ nodeId: "ledB", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    const iA = sim.readings.get("ledA")?.current_a ?? 0;
    const iB = sim.readings.get("ledB")?.current_a ?? 0;

    expect(sim.ledOn.has("ledA")).toBe(true);
    expect(sim.ledOn.has("ledB")).toBe(true);
    expect(Math.abs(iA - iB)).toBeLessThan(1e-6);
  });

  it("LED invers în serie → marcat invers și stins", () => {
    const nodes = [bat, node("res", "resistor"), node("led", "led")];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "res", terminal: "a" }),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "-" }),
      edge({ nodeId: "led", terminal: "+" }, { nodeId: "bat", terminal: "-" }),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);

    expect(sim.reversedLedIds.has("led")).toBe(true);
    expect(sim.ledOn.has("led")).toBe(false);
  });

  function potCircuitCurrent(value: number): number {
    const nodes = [
      bat,
      node("pot", "potentiometer", { flipped: false, value }),
      node("motor", "dc_motor"),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "pot", terminal: "a" }),
      edge({ nodeId: "pot", terminal: "wiper" }, { nodeId: "motor", terminal: "+" }),
      edge({ nodeId: "pot", terminal: "b" }, { nodeId: "pot", terminal: "wiper" }),
      edge({ nodeId: "motor", terminal: "-" }, { nodeId: "bat", terminal: "-" }),
    ];
    return runDcSimulation(nodes, edges, testMetadata).batteryCurrent_a;
  }

  it("potențiometrul la 0 nu e tratat ca 50%", () => {
    expect(potCircuitCurrent(0)).toBeGreaterThan(potCircuitCurrent(0.5));
    expect(potCircuitCurrent(0.5)).toBeGreaterThan(potCircuitCurrent(1));
  });
});
