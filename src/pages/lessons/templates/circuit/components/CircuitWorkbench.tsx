import type { RefObject } from "react";
import CircuitNode2D from "./CircuitNode2D";
import type { CircuitNode, ComponentModel, ComponentType, WorkbenchHint } from "../types";

interface CircuitWorkbenchProps {
  surfaceRef: RefObject<HTMLDivElement | null>;
  hints: WorkbenchHint[];
  nodes: CircuitNode[];
  models: Record<ComponentType, ComponentModel>;
  selectedNodeId: string | null;
  draggingNodeId: string | null;
  placementPreview: { type: ComponentType; position: { x: number; y: number } } | null;
  onNodePointerDown: (e: React.PointerEvent, nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
}

export default function CircuitWorkbench({
  surfaceRef,
  hints,
  nodes,
  models,
  selectedNodeId,
  draggingNodeId,
  placementPreview,
  onNodePointerDown,
  onRemoveNode,
}: CircuitWorkbenchProps) {
  const isEmpty = nodes.length === 0 && !placementPreview;

  return (
    <div className="circuit-workbench" aria-label="Masa de lucru">
      <div ref={surfaceRef} className="circuit-workbench-surface">
        {hints.map((hint) => (
          <span
            key={hint.id}
            className={`circuit-workbench-hint circuit-workbench-hint--${hint.type} ${isEmpty ? "" : "faded"}`}
            style={{
              left: `${hint.position.x * 100}%`,
              top: `${hint.position.y * 100}%`,
            }}
          >
            {hint.text}
          </span>
        ))}

        {nodes.map((node) => (
          <CircuitNode2D
            key={node.id}
            node={node}
            model={models[node.type]}
            selected={selectedNodeId === node.id}
            dragging={draggingNodeId === node.id}
            onPointerDown={onNodePointerDown}
            onRemove={(id) => {
              onRemoveNode(id);
            }}
          />
        ))}

        {placementPreview && (
          <CircuitNode2D
            node={{
              id: "placement-preview",
              type: placementPreview.type,
              position: placementPreview.position,
              state: {},
            }}
            model={models[placementPreview.type]}
            selected={false}
            preview
          />
        )}

        {isEmpty && (
          <p className="circuit-workbench-empty">Trage componente din inventar aici</p>
        )}
      </div>
    </div>
  );
}
