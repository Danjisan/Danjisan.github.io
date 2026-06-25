import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { ComponentModel, ComponentType } from "../types";

interface DragGhostProps {
  type: ComponentType;
  model: ComponentModel;
  x: number;
  y: number;
}

export default function DragGhost({ type, model, x, y }: DragGhostProps) {
  return (
    <div
      className="circuit-drag-ghost"
      style={
        {
          left: x,
          top: y,
          "--comp-color": COMPONENT_COLORS[type],
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="circuit-drag-ghost-icon">{COMPONENT_ICONS[type]}</span>
      <span className="circuit-drag-ghost-label">{model.label}</span>
    </div>
  );
}
