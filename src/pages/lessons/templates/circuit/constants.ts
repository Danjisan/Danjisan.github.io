import type { ComponentType, TerminalDef } from "./types";

export const COMPONENT_COLORS: Record<ComponentType, string> = {
  battery: "#f5c842",
  led: "#e74c3c",
  resistor: "#c4a882",
  switch: "#95a5a6",
  dc_motor: "#3498db",
  potentiometer: "#9b59b6",
  wire_junction: "#7f8c8d",
};

export const DEFAULT_LABELS: Record<ComponentType, string> = {
  battery: "Baterie",
  led: "LED",
  resistor: "Rezistor",
  switch: "Întrerupător",
  dc_motor: "Motor DC",
  potentiometer: "Potențiometru",
  wire_junction: "Nod de legătură",
};

export const COMPONENT_TERMINALS: Record<ComponentType, TerminalDef[]> = {
  battery: [
    { id: "+", dx: 1.05, dy: 0, label: "+" },
    { id: "-", dx: -1.05, dy: 0, label: "−" },
  ],
  led: [
    { id: "+", dx: 1.05, dy: 0, label: "+" },
    { id: "-", dx: -1.05, dy: 0, label: "−" },
  ],
  resistor: [
    { id: "a", dx: -1.05, dy: 0, label: "A" },
    { id: "b", dx: 1.05, dy: 0, label: "B" },
  ],
  switch: [
    { id: "a", dx: -1.05, dy: 0, label: "A" },
    { id: "b", dx: 1.05, dy: 0, label: "B" },
  ],
  dc_motor: [
    { id: "+", dx: 1.05, dy: 0, label: "+" },
    { id: "-", dx: -1.05, dy: 0, label: "−" },
  ],
  potentiometer: [
    { id: "a", dx: -1.05, dy: 0, label: "A" },
    { id: "wiper", dx: 0, dy: -1.1, label: "W" },
    { id: "b", dx: 1.05, dy: 0, label: "B" },
  ],
  wire_junction: [
    { id: "a", dx: 0, dy: -1.05, label: "A" },
    { id: "b", dx: -1.05, dy: 0, label: "B" },
    { id: "c", dx: 1.05, dy: 0, label: "C" },
  ],
};

/** Diametru bulină terminal — aceeași valoare ca în CSS `.circuit-terminal` */
export const TERMINAL_SIZE_REM = 1.65;
/** Cât din bulină se suprapune peste chenarul componentei */
export const TERMINAL_BODY_OVERLAP_REM = 0.28;

/** @deprecated Terminalele sunt poziționate pe marginea corpului (CSS), nu prin offset rem */
export const TERMINAL_OFFSET_REM = { x: 3.6, y: 2.55 };
