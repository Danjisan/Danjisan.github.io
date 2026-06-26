import { DEFAULT_LABELS } from "./constants";
import { DEFAULT_ELECTRICAL, mergeElectrical, mergeSimulationConfig } from "./electricalDefaults";
import {
  COMPONENT_TYPES,
  type CircuitChallenge,
  type CircuitElectricMetadata,
  type ComponentInfo,
  type ComponentModel,
  type ComponentType,
  type ParsedCircuitLesson,
  type WorkbenchHint,
} from "./types";

const EMPTY_INFO: ComponentInfo = {
  summary: "",
  detail: "",
  tips: [],
};

function isComponentType(value: string): value is ComponentType {
  return (COMPONENT_TYPES as readonly string[]).includes(value);
}

function parseComponentList(raw: unknown): ComponentType[] {
  if (!Array.isArray(raw)) return [...COMPONENT_TYPES];
  return raw.filter((item): item is ComponentType => typeof item === "string" && isComponentType(item));
}

function parseInfo(raw: unknown): ComponentInfo {
  if (!raw || typeof raw !== "object") return EMPTY_INFO;
  const info = raw as Record<string, unknown>;
  return {
    summary: typeof info.summary === "string" ? info.summary : "",
    detail: typeof info.detail === "string" ? info.detail : "",
    tips: Array.isArray(info.tips) ? info.tips.filter((t): t is string => typeof t === "string") : [],
  };
}

function parseModels(raw: unknown, components: ComponentType[]): Record<ComponentType, ComponentModel> {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const models = {} as Record<ComponentType, ComponentModel>;

  for (const type of COMPONENT_TYPES) {
    const entry = source[type];
    if (entry && typeof entry === "object") {
      const model = entry as Record<string, unknown>;
      models[type] = {
        label: typeof model.label === "string" ? model.label : DEFAULT_LABELS[type],
        glb: typeof model.glb === "string" ? model.glb : null,
        info: parseInfo(model.info),
        electrical: mergeElectrical(type, model.electrical),
      };
    } else {
      models[type] = {
        label: DEFAULT_LABELS[type],
        glb: null,
        info: EMPTY_INFO,
        electrical: { ...DEFAULT_ELECTRICAL[type] },
      };
    }
  }

  for (const type of components) {
    if (!models[type]) {
      models[type] = {
        label: DEFAULT_LABELS[type],
        glb: null,
        info: EMPTY_INFO,
        electrical: { ...DEFAULT_ELECTRICAL[type] },
      };
    }
  }

  return models;
}

function parseWorkbenchHints(raw: unknown): WorkbenchHint[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const hint = item as Record<string, unknown>;
    if (typeof hint.id !== "string" || typeof hint.text !== "string") return [];
    const type = hint.type === "label" ? "label" : "text";
    const pos = hint.position;
    if (!pos || typeof pos !== "object") return [];
    const position = pos as Record<string, unknown>;
    if (typeof position.x !== "number" || typeof position.y !== "number") return [];
    return [{ id: hint.id, type, text: hint.text, position: { x: position.x, y: position.y } }];
  });
}

function parseChallenge(raw: unknown): CircuitChallenge | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  if (typeof c.id !== "string" || typeof c.title !== "string") return null;

  const required = Array.isArray(c.required_types)
    ? c.required_types.filter((t): t is ComponentType => typeof t === "string" && isComponentType(t))
    : [];

  const win = c.win_condition;
  if (!win || typeof win !== "object") return null;
  const winCondition = win as Record<string, unknown>;
  if (
    winCondition.type !== "component_state" ||
    typeof winCondition.target !== "string" ||
    !isComponentType(winCondition.target) ||
    typeof winCondition.state !== "string"
  ) {
    return null;
  }

  return {
    id: c.id,
    order: typeof c.order === "number" ? c.order : 1,
    title: c.title,
    description: typeof c.description === "string" ? c.description : "",
    hint: typeof c.hint === "string" ? c.hint : "",
    win_condition: {
      type: "component_state",
      target: winCondition.target,
      state: winCondition.state,
    },
    required_types: required,
  };
}

function parseChallenges(raw: unknown, legacyTargetCircuit?: string): CircuitChallenge[] {
  if (Array.isArray(raw)) {
    const parsed = raw.map(parseChallenge).filter((c): c is CircuitChallenge => c !== null);
    if (parsed.length > 0) return parsed.sort((a, b) => a.order - b.order);
  }

  if (legacyTargetCircuit) {
    return [
      {
        id: "legacy-led",
        order: 1,
        title: "Aprinde LED-ul",
        description: "Construiește circuitul indicat folosind componentele disponibile.",
        hint: "Conectează bateria, întrerupătorul, rezistorul și LED-ul.",
        win_condition: { type: "component_state", target: "led", state: "on" },
        required_types: ["battery", "switch", "resistor", "led"],
      },
    ];
  }

  return [];
}

function defaultWorkbenchHints(): WorkbenchHint[] {
  return [
    {
      id: "intro",
      type: "text",
      position: { x: 0.5, y: 0.1 },
      text: "Trage componentele din inventar pe masă și conectează terminalele între ele.",
    },
  ];
}

/**
 * Citește lessons.metadata pentru template circuit_electric.
 * Tolerează metadata veche (target_circuit) până rulezi migrarea SQL pe Supabase.
 */
export function parseCircuitMetadata(raw: Record<string, unknown>): ParsedCircuitLesson {
  const components = parseComponentList(raw.components);
  const models = parseModels(raw.models, components);
  const workbench_hints = parseWorkbenchHints(raw.workbench_hints);
  const legacyTarget = typeof raw.target_circuit === "string" ? raw.target_circuit : undefined;
  const challenges = parseChallenges(raw.challenges, legacyTarget);

  const hasModels = raw.models != null && typeof raw.models === "object";
  const hasChallenges = Array.isArray(raw.challenges) && raw.challenges.length > 0;

  const metadata: CircuitElectricMetadata = {
    components: components.length > 0 ? components : [...COMPONENT_TYPES],
    workbench_hints: workbench_hints.length > 0 ? workbench_hints : defaultWorkbenchHints(),
    models,
    challenges,
    simulation: mergeSimulationConfig(raw.simulation),
  };

  return {
    metadata,
    schemaComplete: hasModels && hasChallenges,
  };
}
