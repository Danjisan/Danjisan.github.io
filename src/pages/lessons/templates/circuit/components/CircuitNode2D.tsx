import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { CircuitNode, ComponentModel } from "../types";

interface CircuitNode2DProps {
  node: CircuitNode;
  model: ComponentModel;
  selected: boolean;
  dragging?: boolean;
  preview?: boolean;
  onPointerDown?: (e: React.PointerEvent, nodeId: string) => void;
  onRemove?: (nodeId: string) => void;
}

export default function CircuitNode2D({
  node,
  model,
  selected,
  dragging = false,
  preview = false,
  onPointerDown,
  onRemove,
}: CircuitNode2DProps) {
  const switchOn = node.type === "switch" && node.state.on === true;

  return (
    <div
      className={`circuit-node-2d ${selected ? "selected" : ""} ${dragging ? "dragging" : ""} ${preview ? "preview" : ""}`}
      style={
        {
          left: `${node.position.x * 100}%`,
          top: `${node.position.y * 100}%`,
          "--comp-color": COMPONENT_COLORS[node.type],
        } as CSSProperties
      }
      onPointerDown={preview ? undefined : (e) => onPointerDown?.(e, node.id)}
    >
      <div className="circuit-node-2d-body">
        <span className="circuit-node-2d-icon" aria-hidden="true">
          {COMPONENT_ICONS[node.type]}
        </span>
        <span className="circuit-node-2d-label">{model.label}</span>
        {node.type === "switch" && !preview && (
          <span className={`circuit-node-2d-badge ${switchOn ? "on" : "off"}`}>
            {switchOn ? "ÎNCHIS" : "DESCHIS"}
          </span>
        )}
      </div>
      {selected && !preview && onRemove && (
        <button
          type="button"
          className="circuit-node-2d-remove"
          aria-label={`Elimină ${model.label} de pe masă`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(node.id)}
        >
          ×
        </button>
      )}
    </div>
  );
}
