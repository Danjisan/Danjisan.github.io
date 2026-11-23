import { DEFAULT_LABELS } from "./constants";
import { DEFAULT_ELECTRICAL, mergeElectrical, mergeSimulationConfig } from "./electricalDefaults";
import {
  COMPONENT_TYPES,
  type CircuitElectricMetadata,
  type ComponentInfo,
  type ComponentModel,
  type ComponentType,
} from "./types";

const EMPTY_INFO: ComponentInfo = {
  summary: "",
  detail: "",
  tips: [],
};

function parseInfo(raw: unknown): ComponentInfo {
  if (!raw || typeof raw !== "object") return EMPTY_INFO;
  const info = raw as Record<string, unknown>;
  return {
    summary: typeof info.summary === "string" ? info.summary : "",
    detail: typeof info.detail === "string" ? info.detail : "",
    tips: Array.isArray(info.tips) ? info.tips.filter((t): t is string => typeof t === "string") : [],
  };
}

function buildModel(type: ComponentType, entry: Record<string, unknown> | undefined): ComponentModel {
  if (entry) {
    return {
      label: typeof entry.label === "string" ? entry.label : DEFAULT_LABELS[type],
      glb: typeof entry.glb === "string" ? entry.glb : null,
      info: parseInfo(entry.info),
      electrical: mergeElectrical(type, entry.electrical),
    };
  }
  return {
    label: DEFAULT_LABELS[type],
    glb: null,
    info: EMPTY_INFO,
    electrical: { ...DEFAULT_ELECTRICAL[type] },
  };
}

function parseModels(raw: unknown): Record<ComponentType, ComponentModel> {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const models = {} as Record<ComponentType, ComponentModel>;
  for (const type of COMPONENT_TYPES) {
    const entry = source[type];
    models[type] = buildModel(type, entry && typeof entry === "object" ? (entry as Record<string, unknown>) : undefined);
  }
  return models;
}

/**
 * Citește lessons.metadata pentru template-ul circuit_electric: valorile pieselor (`models`)
 * și setările simulării. Ce lipsește se completează cu valorile implicite din cod.
 */
export function parseCircuitMetadata(raw: Record<string, unknown>): CircuitElectricMetadata {
  return {
    models: parseModels(raw.models),
    simulation: mergeSimulationConfig(raw.simulation),
  };
}
