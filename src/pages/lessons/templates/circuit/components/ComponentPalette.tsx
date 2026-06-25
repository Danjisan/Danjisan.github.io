import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { ComponentModel, ComponentType } from "../types";

interface ComponentPaletteProps {
  components: ComponentType[];
  models: Record<ComponentType, ComponentModel>;
  selected: ComponentType | null;
  onSelect: (type: ComponentType) => void;
}

export default function ComponentPalette({
  components,
  models,
  selected,
  onSelect,
}: ComponentPaletteProps) {
  return (
    <aside className="circuit-inventory" aria-label="Inventar componente">
      <h3 className="circuit-inventory-title">Inventar</h3>
      <p className="circuit-inventory-hint">Atinge o componentă pentru detalii. Tragerea pe masă vine în Sprint B.</p>
      <ul className="circuit-inventory-list">
        {components.map((type) => {
          const model = models[type];
          return (
            <li key={type}>
              <button
                type="button"
                className={`circuit-inventory-item ${selected === type ? "active" : ""}`}
                onClick={() => onSelect(type)}
                style={{ "--comp-color": COMPONENT_COLORS[type] } as CSSProperties}
              >
                <span className="circuit-inventory-icon" aria-hidden="true">
                  {COMPONENT_ICONS[type]}
                </span>
                <span className="circuit-inventory-label">{model.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
