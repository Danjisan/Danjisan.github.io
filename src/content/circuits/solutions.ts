/**
 * Soluții de referință pentru provocările de circuite, după id-ul provocării.
 *
 * Folosite de:
 * - butonul „Ajutor”, care le desenează pas cu pas;
 * - testele, care verifică faptul că fiecare provocare chiar se poate rezolva.
 *
 * Doar date. Poziții normalizate pe masă (0..1). Un fir e ["piesă:terminal", "piesă:terminal"].
 * Întrerupătoarele apar deschise la început; ultimul pas din ajutor le închide.
 */

import type { BoardSetup } from "./chapters/types";

/** O soluție e o masă completă (aceeași formă ca în capitole). */
export type CircuitSolution = BoardSetup;

const seriesLed: CircuitSolution = {
  parts: [
    { id: "bat", part: "battery-9v", x: 0.22, y: 0.22 },
    { id: "sw", part: "switch", x: 0.62, y: 0.22 },
    { id: "res", part: "resistor-220", x: 0.72, y: 0.68 },
    { id: "led", part: "led-red", x: 0.32, y: 0.68 },
  ],
  wires: [
    ["bat:+", "sw:a"],
    ["sw:b", "res:b"],
    ["res:a", "led:+"],
    ["led:-", "bat:-"],
  ],
};

export const CIRCUIT_SOLUTIONS: Record<string, CircuitSolution> = {
  "led-basic": seriesLed,

  "motor-run": {
    parts: [
      { id: "bat", part: "battery-9v", x: 0.25, y: 0.25 },
      { id: "sw", part: "switch", x: 0.7, y: 0.25 },
      { id: "motor", part: "dc-motor", x: 0.5, y: 0.7 },
    ],
    wires: [
      ["bat:+", "sw:a"],
      ["sw:b", "motor:+"],
      ["motor:-", "bat:-"],
    ],
  },

  "led-motor-parallel": {
    parts: [
      { id: "bat", part: "battery-9v", x: 0.22, y: 0.14 },
      { id: "sw", part: "switch", x: 0.52, y: 0.14 },
      { id: "j1", part: "junction", x: 0.84, y: 0.32 },
      { id: "res", part: "resistor-220", x: 0.6, y: 0.48 },
      { id: "led", part: "led-red", x: 0.3, y: 0.48 },
      { id: "j2", part: "junction", x: 0.14, y: 0.7 },
      { id: "motor", part: "dc-motor", x: 0.72, y: 0.82 },
    ],
    wires: [
      ["bat:+", "sw:a"],
      ["sw:b", "j1:a"],
      ["j1:b", "res:b"],
      ["res:a", "led:+"],
      ["j1:c", "motor:+"],
      ["led:-", "j2:a"],
      ["motor:-", "j2:c"],
      ["j2:b", "bat:-"],
    ],
  },

  "pot-led": {
    parts: [
      { id: "bat", part: "battery-9v", x: 0.22, y: 0.2 },
      { id: "sw", part: "switch", x: 0.6, y: 0.2 },
      { id: "pot", part: "pot-10k", x: 0.74, y: 0.66 },
      { id: "led", part: "led-red", x: 0.3, y: 0.66 },
    ],
    wires: [
      ["bat:+", "sw:a"],
      ["sw:b", "pot:wiper"],
      // B legat tot la ieșirea întrerupătorului: folosim doar porțiunea A–W ca rezistor variabil.
      ["sw:b", "pot:b"],
      ["pot:a", "led:+"],
      ["led:-", "bat:-"],
    ],
  },

  "led-polarity": seriesLed,
};
