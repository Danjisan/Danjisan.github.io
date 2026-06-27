import { DEFAULT_ELECTRICAL, mergeSimulationConfig } from "../../../electricalDefaults";
import type { CircuitElectricMetadata, CircuitEdge, CircuitNode } from "../../../types";

export const testMetadata: Pick<CircuitElectricMetadata, "models" | "simulation"> = {
  models: {
    battery: {
      label: "Baterie 9V",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.battery,
    },
    led: {
      label: "LED",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.led,
    },
    resistor: {
      label: "Rezistor",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.resistor,
    },
    switch: {
      label: "Switch",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.switch,
    },
    dc_motor: {
      label: "Motor",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.dc_motor,
    },
    potentiometer: {
      label: "Pot",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.potentiometer,
    },
    wire_junction: {
      label: "Nod",
      glb: null,
      info: { summary: "", detail: "", tips: [] },
      electrical: DEFAULT_ELECTRICAL.wire_junction,
    },
  },
  simulation: mergeSimulationConfig(null),
};

export function edge(
  from: { nodeId: string; terminal: string },
  to: { nodeId: string; terminal: string },
  id = crypto.randomUUID(),
): CircuitEdge {
  return {
    id,
    from: from as CircuitEdge["from"],
    to: to as CircuitEdge["to"],
  };
}

export function node(
  id: string,
  type: CircuitNode["type"],
  state: Record<string, unknown> = { flipped: false },
): CircuitNode {
  return { id, type, position: { x: 0.5, y: 0.5 }, state };
}
