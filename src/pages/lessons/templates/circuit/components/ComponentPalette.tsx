import type { CSSProperties } from "react";
import {
  COMPONENT_COLORS,
  COMPONENT_ICONS,
  inventoryLimit,
  inventoryPlacedCount,
  inventoryPlacedSlots,
  inventoryTotalSlots,
} from "../constants";
import type { CircuitNode, ComponentModel, ComponentType } from "../types";

interface ComponentPaletteProps {
  components: ComponentType[];
  models: Record<ComponentType, ComponentModel>;
  selected: ComponentType | null;
  nodes: CircuitNode[];
  canPlaceType: (type: ComponentType) => boolean;
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
  isFull,
  placedCount,
  limit,
  compact,
  iconOnly,
  onTapSelect,
  onPalettePointerDown,
}: {
  type: ComponentType;
  model: ComponentModel;
  selected: boolean;
  isFull: boolean;
  placedCount: number;
  limit: number;
  compact?: boolean;
  iconOnly?: boolean;
  onTapSelect: (type: ComponentType) => void;
  onPalettePointerDown: (type: ComponentType, e: React.PointerEvent) => void;
}) {
  const placedLabel =
    limit > 1 ? `${placedCount}/${limit} pe masă` : placedCount > 0 ? "pe masă" : null;

  return (
    <div
      role="button"
      tabIndex={isFull ? -1 : 0}
      className={[
        "circuit-inventory-item",
        selected ? "active" : "",
        isFull ? "placed" : "",
        compact ? "compact" : "",
        iconOnly ? "icon-only" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--comp-color": COMPONENT_COLORS[type] } as CSSProperties}
      aria-disabled={isFull}
      aria-label={model.label}
      title={model.label}
      onPointerDown={(e) => !isFull && onPalettePointerDown(type, e)}
      onKeyDown={(e) => {
        if (!isFull && (e.key === "Enter" || e.key === " ")) {
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
          {placedLabel && isFull && (
            <span className="circuit-inventory-placed-tag">{placedLabel}</span>
          )}
          {placedLabel && !isFull && placedCount > 0 && (
            <span className="circuit-inventory-placed-tag circuit-inventory-placed-tag--partial">
              {placedLabel}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function renderInventoryItem(
  type: ComponentType,
  props: Omit<ComponentPaletteProps, "components" | "compact" | "collapsed" | "onToggleCollapse">,
  itemProps: { compact?: boolean; iconOnly?: boolean },
) {
  const limit = inventoryLimit(type);
  const placedCount = inventoryPlacedCount(props.nodes, type);
  return (
    <InventoryItem
      type={type}
      model={props.models[type]}
      selected={props.selected === type}
      isFull={!props.canPlaceType(type)}
      placedCount={placedCount}
      limit={limit}
      compact={itemProps.compact}
      iconOnly={itemProps.iconOnly}
      onTapSelect={props.onTapSelect}
      onPalettePointerDown={props.onPalettePointerDown}
    />
  );
}

export default function ComponentPalette({
  components,
  models,
  selected,
  nodes,
  canPlaceType,
  compact = false,
  collapsed = false,
  onToggleCollapse,
  onTapSelect,
  onPalettePointerDown,
}: ComponentPaletteProps) {
  const placedCount = inventoryPlacedSlots(nodes, components);
  const totalCount = inventoryTotalSlots(components);

  const className = [
    "circuit-inventory",
    compact ? "circuit-inventory--compact" : "",
    compact && collapsed ? "circuit-inventory--collapsed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const itemProps = {
    models,
    selected,
    nodes,
    canPlaceType,
    onTapSelect,
    onPalettePointerDown,
  };

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
                <li key={type}>{renderInventoryItem(type, itemProps, { compact: true, iconOnly: true })}</li>
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
                <li key={type}>{renderInventoryItem(type, itemProps, { compact: true })}</li>
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
          <li key={type}>{renderInventoryItem(type, itemProps, {})}</li>
        ))}
      </ul>
    </aside>
  );
}
