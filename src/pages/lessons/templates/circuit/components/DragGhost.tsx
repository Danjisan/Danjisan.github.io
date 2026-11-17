import type { CSSProperties } from "react";
import ComponentIcon from "./ComponentIcon";
import { COMPONENT_COLORS } from "../constants";
import type { PartDef } from "../../../../../content/circuits/parts";
import type { ComponentModel } from "../types";

interface DragGhostProps {
  part: PartDef;
  model: ComponentModel;
  x: number;
  y: number;
}

export default function DragGhost({ part, model, x, y }: DragGhostProps) {
  return (
    <div
      className="circuit-drag-ghost"
      style={
        {
          left: x,
          top: y,
          "--comp-color": COMPONENT_COLORS[part.type],
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <span className="circuit-drag-ghost-icon"><ComponentIcon part={part} /></span>
      <span className="circuit-drag-ghost-label">{model.label}</span>
    </div>
  );
}
