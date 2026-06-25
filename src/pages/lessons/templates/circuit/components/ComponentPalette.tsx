import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { ComponentModel, ComponentType } from "../types";

interface ComponentPaletteProps {
  components: ComponentType[];
  models: Record<ComponentType, ComponentModel>;
  selected: ComponentType | null;
  placedTypes: Set<ComponentType>;
  onTapSelect: (type: ComponentType) => void;
  onPalettePointerDown: (type: ComponentType, e: React.PointerEvent) => void;
  onPalettePointerMove: (e: React.PointerEvent) => void;
  onPalettePointerUp: (type: ComponentType, e: React.PointerEvent) => void;
}

export default function ComponentPalette({
  components,
  models,
  selected,
  placedTypes,
  onTapSelect,
  onPalettePointerDown,
  onPalettePointerMove,
  onPalettePointerUp,
}: ComponentPaletteProps) {
  return (
    <aside className="circuit-inventory" aria-label="Inventar componente">
      <h3 className="circuit-inventory-title">Inventar</h3>
      <p className="circuit-inventory-hint">
        Trage o componentă pe masă. Atinge scurt pentru detalii.
      </p>
      <ul className="circuit-inventory-list">
        {components.map((type) => {
          const model = models[type];
          const isPlaced = placedTypes.has(type);
          return (
            <li key={type}>
              <div
                role="button"
                tabIndex={isPlaced ? -1 : 0}
                className={`circuit-inventory-item ${selected === type ? "active" : ""} ${isPlaced ? "placed" : ""}`}
                style={{ "--comp-color": COMPONENT_COLORS[type] } as CSSProperties}
                aria-disabled={isPlaced}
                onPointerDown={(e) => !isPlaced && onPalettePointerDown(type, e)}
                onPointerMove={onPalettePointerMove}
                onPointerUp={(e) => onPalettePointerUp(type, e)}
                onKeyDown={(e) => {
                  if (!isPlaced && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onTapSelect(type);
                  }
                }}
              >
                <span className="circuit-inventory-icon" aria-hidden="true">
                  {COMPONENT_ICONS[type]}
                </span>
                <span className="circuit-inventory-label">{model.label}</span>
                {isPlaced && <span className="circuit-inventory-placed-tag">pe masă</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
