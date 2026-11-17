import type { CSSProperties } from "react";
import { COMPONENT_COLORS } from "../constants";
import { getPart, modelForPart, placedCountOfPart, type InventorySlot } from "../logic/parts";
import type { PartDef } from "../../../../../content/circuits/parts";
import type { CircuitNode, ComponentModel, ComponentType } from "../types";
import ComponentIcon from "./ComponentIcon";

interface ComponentPaletteProps {
  inventory: InventorySlot[];
  models: Record<ComponentType, ComponentModel>;
  selected: string | null;
  nodes: CircuitNode[];
  canPlacePart: (partId: string) => boolean;
  compact?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onTapSelect: (partId: string) => void;
  onPalettePointerDown: (partId: string, e: React.PointerEvent) => void;
}

function InventoryItem({
  part,
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
  part: PartDef;
  model: ComponentModel;
  selected: boolean;
  isFull: boolean;
  placedCount: number;
  limit: number;
  compact?: boolean;
  iconOnly?: boolean;
  onTapSelect: (partId: string) => void;
  onPalettePointerDown: (partId: string, e: React.PointerEvent) => void;
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
      style={{ "--comp-color": COMPONENT_COLORS[part.type] } as CSSProperties}
      aria-disabled={isFull}
      aria-label={model.label}
      title={model.label}
      onPointerDown={(e) => !isFull && onPalettePointerDown(part.id, e)}
      onKeyDown={(e) => {
        if (!isFull && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTapSelect(part.id);
        }
      }}
    >
      <span className="circuit-inventory-icon" aria-hidden="true">
        <ComponentIcon part={part} />
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
  slot: InventorySlot,
  props: Omit<ComponentPaletteProps, "inventory" | "compact" | "collapsed" | "onToggleCollapse">,
  itemProps: { compact?: boolean; iconOnly?: boolean },
) {
  const part = getPart(slot.partId);
  if (!part) return null;
  const limit = slot.count;
  const placedCount = placedCountOfPart(props.nodes, part.id);
  return (
    <InventoryItem
      part={part}
      model={modelForPart(part, props.models)}
      selected={props.selected === part.id}
      isFull={!props.canPlacePart(part.id)}
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
  inventory,
  models,
  selected,
  nodes,
  canPlacePart,
  compact = false,
  collapsed = false,
  onToggleCollapse,
  onTapSelect,
  onPalettePointerDown,
}: ComponentPaletteProps) {
  const placedCount = inventory.reduce(
    (sum, slot) => sum + Math.min(slot.count, placedCountOfPart(nodes, slot.partId)),
    0,
  );
  const totalCount = inventory.reduce((sum, slot) => sum + slot.count, 0);

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
    canPlacePart,
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
              {inventory.map((slot) => (
                <li key={slot.partId}>{renderInventoryItem(slot, itemProps, { compact: true, iconOnly: true })}</li>
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
              {inventory.map((slot) => (
                <li key={slot.partId}>{renderInventoryItem(slot, itemProps, { compact: true })}</li>
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
        {inventory.map((slot) => (
          <li key={slot.partId}>{renderInventoryItem(slot, itemProps, {})}</li>
        ))}
      </ul>
    </aside>
  );
}
