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

export interface ParsedCircuitLesson {
  metadata: CircuitElectricMetadata;
  /** true dacă metadata vine din schema v1 completă din DB */
  schemaComplete: boolean;
}
