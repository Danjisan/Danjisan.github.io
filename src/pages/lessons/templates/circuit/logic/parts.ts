import { DEFAULT_PART_BY_TYPE, PARTS, type PartDef } from "../../../../../content/circuits/parts";
import type {
  CircuitChallenge,
  CircuitNode,
  ComponentElectricalByType,
  ComponentModel,
  ComponentType,
} from "../types";

const PARTS_BY_ID = new Map<string, PartDef>(PARTS.map((p) => [p.id, p as PartDef]));

export function getPart(partId: string): PartDef | undefined {
  return PARTS_BY_ID.get(partId);
}

export function defaultPart(type: ComponentType): PartDef {
  return PARTS_BY_ID.get(DEFAULT_PART_BY_TYPE[type])!;
}

/** Piesa unui nod de pe masă; nodurile vechi (fără `partId`) primesc piesa implicită a tipului. */
export function partOfNode(node: CircuitNode): PartDef {
  const id = node.state.partId;
  const part = typeof id === "string" ? PARTS_BY_ID.get(id) : undefined;
  return part && part.type === node.type ? part : defaultPart(node.type);
}

/** Parametrii electrici ai unui nod: ai tipului (din lecție) + ce suprascrie piesa. */
export function electricalForNode<T extends ComponentType>(
  models: Record<ComponentType, { electrical: ComponentElectricalByType[ComponentType] }>,
  node: CircuitNode,
  type: T,
): ComponentElectricalByType[T] {
  const base = models[type].electrical as ComponentElectricalByType[T];
  const override = partOfNode(node).electrical as Partial<ComponentElectricalByType[T]> | undefined;
  return override ? { ...base, ...override } : base;
}

export function partLabel(part: PartDef, models: Record<ComponentType, ComponentModel>): string {
  return part.label ?? models[part.type].label;
}

/** Modelul afișat pentru o piesă: al tipului, cu eticheta piesei. */
export function modelForPart(
  part: PartDef,
  models: Record<ComponentType, ComponentModel>,
): ComponentModel {
  const model = models[part.type];
  return part.label ? { ...model, label: part.label } : model;
}

export interface InventorySlot {
  partId: string;
  count: number;
}

/** Câte piese de un tip primește elevul când lecția nu spune altfel. */
const FREE_PLAY_COUNT: Partial<Record<ComponentType, number>> = { wire_junction: 2 };

/**
 * Inventarul pentru provocarea activă.
 * - Dacă provocarea are `inventory`, îl folosim exact.
 * - Altfel, din `required_types`: câte o piesă implicită pentru fiecare apariție a tipului.
 * - Fără provocare: piesele implicite ale tipurilor din lecție.
 */
export function buildInventory(
  challenge: CircuitChallenge | null,
  components: ComponentType[],
): InventorySlot[] {
  if (challenge?.inventory && challenge.inventory.length > 0) {
    return challenge.inventory.filter((s) => PARTS_BY_ID.has(s.partId) && s.count > 0);
  }

  const counts = new Map<ComponentType, number>();
  if (challenge) {
    for (const type of challenge.required_types) counts.set(type, (counts.get(type) ?? 0) + 1);
  } else {
    for (const type of components) counts.set(type, FREE_PLAY_COUNT[type] ?? 1);
  }
  return [...counts].map(([type, count]) => ({ partId: DEFAULT_PART_BY_TYPE[type], count }));
}

export function placedCountOfPart(nodes: CircuitNode[], partId: string): number {
  return nodes.filter((n) => partOfNode(n).id === partId).length;
}

export function canPlacePart(nodes: CircuitNode[], inventory: InventorySlot[], partId: string): boolean {
  const slot = inventory.find((s) => s.partId === partId);
  return !!slot && placedCountOfPart(nodes, partId) < slot.count;
}
