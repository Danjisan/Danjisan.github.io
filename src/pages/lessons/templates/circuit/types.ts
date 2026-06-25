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

export interface ComponentModel {
  label: string;
  glb: string | null;
  info: ComponentInfo;
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

export interface CircuitElectricMetadata {
  components: ComponentType[];
  workbench_hints: WorkbenchHint[];
  models: Record<ComponentType, ComponentModel>;
  challenges: CircuitChallenge[];
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
