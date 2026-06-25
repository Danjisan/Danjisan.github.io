import type { RefObject } from "react";
import CircuitNode2D from "./CircuitNode2D";
import WireLayer from "./WireLayer";
import type {
  CircuitEdge,
  CircuitNode,
  CircuitTerminalRef,
  ComponentModel,
  ComponentType,
  TerminalId,
  WorkbenchHint,
} from "../types";

interface CircuitWorkbenchProps {
  surfaceRef: RefObject<HTMLDivElement | null>;
  hints: WorkbenchHint[];
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  models: Record<ComponentType, ComponentModel>;
  selectedNodeId: string | null;
  draggingNodeId: string | null;
  placementPreview: { type: ComponentType; position: { x: number; y: number } } | null;
  pendingTerminal: CircuitTerminalRef | null;
  occupiedTerminals: Set<string>;
  wirePointer: { x: number; y: number } | null;
  ledOnIds: Set<string>;
  reversedLedIds: Set<string>;
  motorRunningIds: Set<string>;
  onSurfacePointerMove: (e: React.PointerEvent) => void;
  onSurfacePointerDown: (e: React.PointerEvent) => void;
  onBodyPointerDown: (e: React.PointerEvent, nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onTerminalPointerDown: (e: React.PointerEvent, nodeId: string, terminal: TerminalId) => void;
  onTerminalPointerUp: (e: React.PointerEvent) => void;
  onSwitchToggle: (nodeId: string) => void;
}

export default function CircuitWorkbench({
  surfaceRef,
  hints,
  nodes,
  edges,
  models,
  selectedNodeId,
  draggingNodeId,
  placementPreview,
  pendingTerminal,
  occupiedTerminals,
  wirePointer,
  ledOnIds,
  reversedLedIds,
  motorRunningIds,
  onSurfacePointerMove,
  onSurfacePointerDown,
  onBodyPointerDown,
  onRemoveNode,
  onTerminalPointerDown,
  onTerminalPointerUp,
  onSwitchToggle,
}: CircuitWorkbenchProps) {
  const isEmpty = nodes.length === 0 && !placementPreview;

  return (
    <div className="circuit-workbench" aria-label="Masa de lucru">
      <div
        ref={surfaceRef}
        className="circuit-workbench-surface"
        onPointerMove={onSurfacePointerMove}
        onPointerDown={onSurfacePointerDown}
      >
        <WireLayer
          nodes={nodes}
          edges={edges}
          pendingTerminal={pendingTerminal}
          pointer={wirePointer}
          surfaceRef={surfaceRef}
        />

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
            ledOn={ledOnIds.has(node.id)}
            reversedLed={reversedLedIds.has(node.id)}
            motorRunning={motorRunningIds.has(node.id)}
            pendingTerminal={pendingTerminal}
            occupiedTerminals={occupiedTerminals}
            onBodyPointerDown={onBodyPointerDown}
            onRemove={onRemoveNode}
            onTerminalPointerDown={onTerminalPointerDown}
            onTerminalPointerUp={onTerminalPointerUp}
            onSwitchToggle={onSwitchToggle}
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
            pendingTerminal={null}
            occupiedTerminals={new Set()}
          />
        )}

        {isEmpty && (
          <p className="circuit-workbench-empty">Trage componente din inventar aici</p>
        )}

        {nodes.length > 0 && (
          <p className="circuit-workbench-wire-hint">
            Trage sau atinge un terminal, apoi altul, pentru a conecta un fir
          </p>
        )}
      </div>
    </div>
  );
}
