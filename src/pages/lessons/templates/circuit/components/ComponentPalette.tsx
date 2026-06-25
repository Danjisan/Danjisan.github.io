import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { ComponentModel, ComponentType } from "../types";

interface ComponentPaletteProps {
  components: ComponentType[];
  models: Record<ComponentType, ComponentModel>;
  selected: ComponentType | null;
  placedTypes: Set<ComponentType>;
  compact?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onTapSelect: (type: ComponentType) => void;
  onPalettePointerDown: (type: ComponentType, e: React.PointerEvent) => void;
}

function InventoryItem({
  type,
  model,
  selected,
  isPlaced,
  compact,
  iconOnly,
  onTapSelect,
  onPalettePointerDown,
}: {
  type: ComponentType;
  model: ComponentModel;
  selected: boolean;
  isPlaced: boolean;
  compact?: boolean;
  iconOnly?: boolean;
  onTapSelect: (type: ComponentType) => void;
  onPalettePointerDown: (type: ComponentType, e: React.PointerEvent) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={isPlaced ? -1 : 0}
      className={[
        "circuit-inventory-item",
        selected ? "active" : "",
        isPlaced ? "placed" : "",
        compact ? "compact" : "",
        iconOnly ? "icon-only" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--comp-color": COMPONENT_COLORS[type] } as CSSProperties}
      aria-disabled={isPlaced}
      aria-label={model.label}
      title={model.label}
      onPointerDown={(e) => !isPlaced && onPalettePointerDown(type, e)}
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
      {!iconOnly && (
        <>
          <span className="circuit-inventory-label">{model.label}</span>
          {isPlaced && <span className="circuit-inventory-placed-tag">pe masă</span>}
        </>
      )}
    </div>
  );
}

export default function ComponentPalette({
  components,
  models,
  selected,
  placedTypes,
  compact = false,
  collapsed = false,
  onToggleCollapse,
  onTapSelect,
  onPalettePointerDown,
}: ComponentPaletteProps) {
  const placedCount = placedTypes.size;
  const totalCount = components.length;

  const className = [
    "circuit-inventory",
    compact ? "circuit-inventory--compact" : "",
    compact && collapsed ? "circuit-inventory--collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (compact) {
    return (
      <aside className={className} aria-label="Inventar componente">
        {collapsed ? (
          <div className="circuit-inventory-collapsed-row">
            <button
              type="button"
              className="circuit-inventory-toggle circuit-inventory-toggle--inline"
              onClick={onToggleCollapse}
              aria-expanded={false}
            >
              <span className="circuit-inventory-toggle-icon" aria-hidden="true">
                ▲
              </span>
              <span className="circuit-inventory-toggle-label">Inventar</span>
              <span className="circuit-inventory-count">
                {placedCount}/{totalCount}
              </span>
            </button>
            <ul className="circuit-inventory-strip" aria-label="Componente disponibile">
              {components.map((type) => (
                <li key={type}>
                  <InventoryItem
                    type={type}
                    model={models[type]}
                    selected={selected === type}
                    isPlaced={placedTypes.has(type)}
                    compact
                    iconOnly
                    onTapSelect={onTapSelect}
                    onPalettePointerDown={onPalettePointerDown}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className="circuit-inventory-compact-head">
              <button
                type="button"
                className="circuit-inventory-toggle"
                onClick={onToggleCollapse}
                aria-expanded
              >
                <span className="circuit-inventory-toggle-icon" aria-hidden="true">
                  ▼
                </span>
                Inventar
                <span className="circuit-inventory-count">
                  {placedCount}/{totalCount}
                </span>
              </button>
            </div>
            <ul className="circuit-inventory-list circuit-inventory-list--compact">
              {components.map((type) => (
                <li key={type}>
                  <InventoryItem
                    type={type}
                    model={models[type]}
                    selected={selected === type}
                    isPlaced={placedTypes.has(type)}
                    compact
                    onTapSelect={onTapSelect}
                    onPalettePointerDown={onPalettePointerDown}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </aside>
    );
  }

  return (
    <aside className={className} aria-label="Inventar componente">
      <h3 className="circuit-inventory-title">Inventar</h3>
      <p className="circuit-inventory-hint">
        Trage o componentă pe masă. Atinge scurt pentru detalii.
      </p>
      <ul className="circuit-inventory-list">
        {components.map((type) => (
          <li key={type}>
            <InventoryItem
              type={type}
              model={models[type]}
              selected={selected === type}
              isPlaced={placedTypes.has(type)}
              onTapSelect={onTapSelect}
              onPalettePointerDown={onPalettePointerDown}
            />
          </li>
        ))}
      </ul>
    </aside>
  );
}
