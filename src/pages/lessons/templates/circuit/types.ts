export const COMPONENT_TYPES = [
  "battery",
  "led",
  "resistor",
  "switch",
  "dc_motor",
  "potentiometer",
] as const;

export type ComponentType = (typeof COMPONENT_TYPES)[number];

export interface ComponentInfo {
  summary: string;
  detail: string;
  tips: string[];
}

/** Parametri electrici per tip — fizică gimnaziu, valori reale (V, Ω, A) */
export interface BatteryElectrical {
  voltage_v: number;
  internal_resistance_ohm: number;
}

export interface ResistorElectrical {
  resistance_ohm: number;
}

export interface LedElectrical {
  forward_voltage_v: number;
  on_resistance_ohm: number;
  max_current_a: number;
  burn_after_s: number;
}

export interface SwitchElectrical {
  contact_resistance_ohm: number;
}

export interface DcMotorElectrical {
  winding_resistance_ohm: number;
  min_run_current_a: number;
}

export interface PotentiometerElectrical {
  total_resistance_ohm: number;
}

export type ComponentElectricalByType = {
  battery: BatteryElectrical;
  led: LedElectrical;
  resistor: ResistorElectrical;
  switch: SwitchElectrical;
  dc_motor: DcMotorElectrical;
  potentiometer: PotentiometerElectrical;
};

export interface ComponentModel {
  label: string;
  glb: string | null;
  info: ComponentInfo;
  electrical: ComponentElectricalByType[ComponentType];
}

export interface WorkbenchHint {
  id: string;
  type: "text" | "label";
  position: { x: number; y: number };
  text: string;
}

export interface WinCondition {
  type: "component_state";
  target: ComponentType;
  state: string;
}

export interface CircuitChallenge {
  id: string;
  order: number;
  title: string;
  description: string;
  hint: string;
  win_condition: WinCondition;
  required_types: ComponentType[];
}

export type SimulationFailureKind =
  | "led_burned"
  | "short_circuit"
  | "battery_overloaded"
  | "led_reverse";

export interface CircuitSimulationConfig {
  /** Curent total peste prag → eveniment scurtcircuit (A) */
  short_circuit_current_a: number;
  failure_messages: Record<SimulationFailureKind, string>;
}

/** Rezultat per ramură / componentă — overlay la select */
export interface BranchElectricalReading {
  voltage_v: number;
  current_a: number;
  power_w: number;
}

export interface CircuitElectricMetadata {
  components: ComponentType[];
  workbench_hints: WorkbenchHint[];
  models: Record<ComponentType, ComponentModel>;
  challenges: CircuitChallenge[];
  simulation: CircuitSimulationConfig;
}

export type TerminalId = "+" | "-" | "a" | "b" | "wiper";

export interface CircuitTerminalRef {
  nodeId: string;
  terminal: TerminalId;
}

export interface CircuitEdge {
  id: string;
  from: CircuitTerminalRef;
  to: CircuitTerminalRef;
}

export interface TerminalDef {
  id: TerminalId;
  /** Offset față de centrul nodului, în fracțiuni din dimensiunea nodului */
  dx: number;
  dy: number;
  label?: string;
}

export interface ParsedCircuitLesson {
  metadata: CircuitElectricMetadata;
  /** true dacă metadata vine din schema v1 completă din DB */
  schemaComplete: boolean;
}

/** Componentă plasată pe masa de lucru (coordonate normalizate 0–1) */
export interface CircuitNode {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  state: Record<string, unknown>;
}
