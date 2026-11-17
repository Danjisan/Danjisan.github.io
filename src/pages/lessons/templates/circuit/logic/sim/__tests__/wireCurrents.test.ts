import { describe, expect, it } from "vitest";
import { runDcSimulation } from "../dcSimulation";
import { edge, node, testMetadata } from "./testModels";

describe("curentul prin fire", () => {
  it("circuit serie: același curent prin toate firele, dinspre + spre −", () => {
    const nodes = [
      node("bat", "battery"),
      node("sw", "switch", { flipped: false, on: true }),
      node("res", "resistor"),
      node("led", "led"),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }, "w1"),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "res", terminal: "a" }, "w2"),
      // fir desenat „invers” (din LED spre rezistor): curentul trebuie să iasă negativ
      edge({ nodeId: "led", terminal: "+" }, { nodeId: "res", terminal: "b" }, "w3"),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }, "w4"),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    const iLed = sim.readings.get("led")!.current_a;

    expect(sim.wireCurrents.get("w1")).toBeCloseTo(iLed, 6);
    expect(sim.wireCurrents.get("w2")).toBeCloseTo(iLed, 6);
    expect(sim.wireCurrents.get("w3")).toBeCloseTo(-iLed, 6);
    expect(sim.wireCurrents.get("w4")).toBeCloseTo(iLed, 6);
  });

  it("paralel: ramurile au curenții lor, firul comun are suma", () => {
    const nodes = [
      node("bat", "battery"),
      node("j1", "wire_junction"),
      node("j2", "wire_junction"),
      node("res", "resistor"),
      node("led", "led"),
      node("motor", "dc_motor"),
    ];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "j1", terminal: "a" }, "main+"),
      edge({ nodeId: "j1", terminal: "b" }, { nodeId: "res", terminal: "a" }, "toRes"),
      edge({ nodeId: "j1", terminal: "c" }, { nodeId: "motor", terminal: "+" }, "toMotor"),
      edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }, "resLed"),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "j2", terminal: "a" }, "ledBack"),
      edge({ nodeId: "motor", terminal: "-" }, { nodeId: "j2", terminal: "b" }, "motorBack"),
      edge({ nodeId: "j2", terminal: "c" }, { nodeId: "bat", terminal: "-" }, "main-"),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    const iLed = sim.readings.get("led")!.current_a;
    const iMotor = sim.readings.get("motor")!.current_a;

    expect(sim.wireCurrents.get("toRes")).toBeCloseTo(iLed, 6);
    expect(sim.wireCurrents.get("toMotor")).toBeCloseTo(iMotor, 6);
    expect(sim.wireCurrents.get("main+")).toBeCloseTo(iLed + iMotor, 6);
    expect(sim.wireCurrents.get("main-")).toBeCloseTo(iLed + iMotor, 6);
  });

  it("circuit deschis: niciun fir nu are curent", () => {
    const nodes = [node("bat", "battery"), node("sw", "switch", { flipped: false, on: false }), node("led", "led")];
    const edges = [
      edge({ nodeId: "bat", terminal: "+" }, { nodeId: "sw", terminal: "a" }, "w1"),
      edge({ nodeId: "sw", terminal: "b" }, { nodeId: "led", terminal: "+" }, "w2"),
      edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }, "w3"),
    ];
    const sim = runDcSimulation(nodes, edges, testMetadata);
    for (const id of ["w1", "w2", "w3"]) expect(sim.wireCurrents.get(id) ?? 0).toBe(0);
  });

  it("fără rezistor curentul e mult mai mare decât cu rezistor", () => {
    const direct = runDcSimulation(
      [node("bat", "battery"), node("led", "led")],
      [
        edge({ nodeId: "bat", terminal: "+" }, { nodeId: "led", terminal: "+" }, "w1"),
        edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }, "w2"),
      ],
      testMetadata,
    );
    const withRes = runDcSimulation(
      [node("bat", "battery"), node("res", "resistor"), node("led", "led")],
      [
        edge({ nodeId: "bat", terminal: "+" }, { nodeId: "res", terminal: "a" }, "w1"),
        edge({ nodeId: "res", terminal: "b" }, { nodeId: "led", terminal: "+" }, "w2"),
        edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }, "w3"),
      ],
      testMetadata,
    );
    expect(direct.wireCurrents.get("w1")!).toBeGreaterThan(3 * withRes.wireCurrents.get("w1")!);
  });

  it("scurtcircuit direct: firul are curent mare", () => {
    const sim = runDcSimulation(
      [node("bat", "battery")],
      [edge({ nodeId: "bat", terminal: "+" }, { nodeId: "bat", terminal: "-" }, "short")],
      testMetadata,
    );
    expect(sim.shortCircuited).toBe(true);
    expect(Math.abs(sim.wireCurrents.get("short") ?? 0)).toBeGreaterThan(1);
  });
});

describe("piese nelegate pe masă", () => {
  it("un rezistor nelegat nu strică simularea restului circuitului", () => {
    const sim = runDcSimulation(
      [node("bat", "battery"), node("led", "led"), node("res", "resistor"), node("motor", "dc_motor")],
      [
        edge({ nodeId: "bat", terminal: "+" }, { nodeId: "led", terminal: "+" }, "w1"),
        edge({ nodeId: "led", terminal: "-" }, { nodeId: "bat", terminal: "-" }, "w2"),
        // motorul e legat doar la un capăt
        edge({ nodeId: "motor", terminal: "+" }, { nodeId: "bat", terminal: "+" }, "w3"),
      ],
      testMetadata,
    );
    expect(sim.hints).not.toContain("Circuitul nu poate fi analizat — verifică conexiunile.");
    expect(sim.ledOn.has("led")).toBe(true);
    expect(sim.wireCurrents.get("w1")!).toBeGreaterThan(0.05);
    expect(sim.wireCurrents.get("w3")).toBe(0);
  });
});
