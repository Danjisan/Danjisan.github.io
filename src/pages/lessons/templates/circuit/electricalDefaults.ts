import type {
  CircuitSimulationConfig,
  ComponentElectricalByType,
  ComponentType,
  SimulationFailureKind,
} from "./types";

/** Parametri DC impliciți — fizică gimnaziu (9V, LED roșu, rezistor 220Ω) */
export const DEFAULT_ELECTRICAL: ComponentElectricalByType = {
  battery: {
    voltage_v: 9,
    internal_resistance_ohm: 2,
  },
  led: {
    forward_voltage_v: 2,
    on_resistance_ohm: 50,
    max_current_a: 0.02,
    burn_after_s: 1,
  },
  resistor: {
    resistance_ohm: 220,
  },
  switch: {
    contact_resistance_ohm: 0.1,
  },
  dc_motor: {
    winding_resistance_ohm: 10,
    min_run_current_a: 0.03,
  },
  potentiometer: {
    total_resistance_ohm: 10_000,
  },
};

export const DEFAULT_FAILURE_MESSAGES: Record<SimulationFailureKind, string> = {
  led_burned:
    "LED-ul s-a ars. A primit prea mult curent pentru prea mult timp — de obicei lipsește rezistorul de limitare sau valoarea lui e prea mică.",
  short_circuit:
    "Scurtcircuit. Curentul a depășit limita sigură — verifică dacă nu ai legat direct terminalul + la − fără o componentă care să limiteze curentul.",
  battery_overloaded:
    "Bateria e suprasolicitată. Curentul total din circuit e prea mare; adaugă rezistență sau verifică conexiunile.",
  led_reverse:
    "LED-ul e montat invers. Curentul nu poate trece în direcția corectă — schimbă polaritatea (+/−).",
};

export const DEFAULT_SIMULATION_CONFIG: CircuitSimulationConfig = {
  short_circuit_current_a: 1.5,
  failure_messages: DEFAULT_FAILURE_MESSAGES,
};

export function mergeElectrical<T extends ComponentType>(
  type: T,
  raw: unknown,
): ComponentElectricalByType[T] {
  const defaults = DEFAULT_ELECTRICAL[type];
  if (!raw || typeof raw !== "object") return { ...defaults };

  const src = raw as Record<string, unknown>;
  const merged = { ...defaults };

  for (const key of Object.keys(defaults) as (keyof typeof defaults)[]) {
    const value = src[key as string];
    if (typeof value === "number" && Number.isFinite(value)) {
      Object.assign(merged, { [key]: value });
    }
  }

  return merged;
}

export function mergeSimulationConfig(raw: unknown): CircuitSimulationConfig {
  if (!raw || typeof raw !== "object") {
    return {
      ...DEFAULT_SIMULATION_CONFIG,
      failure_messages: { ...DEFAULT_FAILURE_MESSAGES },
    };
  }

  const src = raw as Record<string, unknown>;
  const shortCircuit =
    typeof src.short_circuit_current_a === "number" && Number.isFinite(src.short_circuit_current_a)
      ? src.short_circuit_current_a
      : DEFAULT_SIMULATION_CONFIG.short_circuit_current_a;

  const messages = { ...DEFAULT_FAILURE_MESSAGES };
  if (src.failure_messages && typeof src.failure_messages === "object") {
    const overrides = src.failure_messages as Record<string, unknown>;
    for (const kind of Object.keys(messages) as SimulationFailureKind[]) {
      if (typeof overrides[kind] === "string") {
        messages[kind] = overrides[kind];
      }
    }
  }

  return {
    short_circuit_current_a: shortCircuit,
    failure_messages: messages,
  };
}
