import type { ComponentElectricalByType, ComponentType } from "../../types";

export function electricalFor<T extends ComponentType>(
  models: Record<ComponentType, { electrical: ComponentElectricalByType[ComponentType] }>,
  type: T,
): ComponentElectricalByType[T] {
  return models[type].electrical as ComponentElectricalByType[T];
}
