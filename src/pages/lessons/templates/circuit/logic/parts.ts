import { DEFAULT_PART_BY_TYPE, PARTS, type PartDef } from "../../../../../content/circuits/parts";
import type {
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

export function placedCountOfPart(nodes: CircuitNode[], partId: string): number {
  return nodes.filter((n) => partOfNode(n).id === partId).length;
}

export function canPlacePart(nodes: CircuitNode[], inventory: InventorySlot[], partId: string): boolean {
  const slot = inventory.find((s) => s.partId === partId);
  return !!slot && placedCountOfPart(nodes, partId) < slot.count;
}
