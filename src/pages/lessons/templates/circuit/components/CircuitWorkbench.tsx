import { useRef, type RefObject } from "react";
import CircuitNode2D from "./CircuitNode2D";
import WireLayer from "./WireLayer";
import { viewportTransformStyle, type WorkbenchViewport } from "../logic/viewportCoords";
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
  viewport: WorkbenchViewport;
  onWheel?: (e: React.WheelEvent) => void;
  hints: WorkbenchHint[];
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  models: Record<ComponentType, ComponentModel>;
  editable?: boolean;
  selectedNodeId: string | null;
  infoBubbleNodeId: string | null;
  draggingNodeId: string | null;
  placementPreview: { type: ComponentType; position: { x: number; y: number } } | null;
  pendingTerminal: CircuitTerminalRef | null;
  occupiedTerminals: Set<string>;
  wirePointer: { x: number; y: number } | null;
  ledOnIds: Set<string>;
  reversedLedIds: Set<string>;
  motorRunningIds: Set<string>;
  onSurfacePointerMove?: (e: React.PointerEvent) => void;
  onSurfacePointerDown?: (e: React.PointerEvent) => void;
  onSurfacePointerUp?: (e: React.PointerEvent) => void;
  onBodyPointerDown?: (e: React.PointerEvent, nodeId: string) => void;
  onRemoveNode?: (nodeId: string) => void;
  onTerminalPointerDown?: (e: React.PointerEvent, nodeId: string, terminal: TerminalId) => void;
  onTerminalPointerUp?: (e: React.PointerEvent) => void;
  onSwitchToggle: (nodeId: string) => void;
  onNodeFlip?: (nodeId: string) => void;
  onPotentiometerChange?: (nodeId: string, value: number) => void;
}

export default function CircuitWorkbench({
  surfaceRef,
  viewport,
  onWheel,
  hints,
  nodes,
  edges,
  models,
  editable = true,
  selectedNodeId,
  infoBubbleNodeId,
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
  onSurfacePointerUp,
  onBodyPointerDown,
  onRemoveNode,
  onTerminalPointerDown,
  onTerminalPointerUp,
  onSwitchToggle,
  onNodeFlip,
  onPotentiometerChange,
}: CircuitWorkbenchProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const wireLayoutKey = nodes
    .map((n) => `${n.id}@${n.position.x},${n.position.y},${n.state.flipped}`)
    .join("|");

  const isEmpty = nodes.length === 0 && !placementPreview;
  const readOnly = !editable;
  const isPannable = viewport.zoom !== 1 || viewport.panX !== 0 || viewport.panY !== 0;

  return (
    <div
      className={`circuit-workbench ${readOnly ? "circuit-workbench--preview" : ""}`}
      aria-label="Masa de lucru"
    >
      <div
        ref={surfaceRef}
        className={`circuit-workbench-surface ${isPannable ? "is-pannable" : ""}`}
        onWheel={onWheel}
      >
        <div
          ref={viewportRef}
          className="circuit-workbench-viewport"
          style={viewportTransformStyle(viewport)}
          onPointerMove={onSurfacePointerMove}
          onPointerDown={onSurfacePointerDown}
          onPointerUp={onSurfacePointerUp}
        >
          <WireLayer
            edges={edges}
            pendingTerminal={editable ? pendingTerminal : null}
            pointer={editable ? wirePointer : null}
            surfaceRef={surfaceRef}
            viewportRef={viewportRef}
            viewport={viewport}
            layoutKey={wireLayoutKey}
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
              selected={editable && selectedNodeId === node.id}
              showInfoBubble={editable && infoBubbleNodeId === node.id}
              dragging={draggingNodeId === node.id}
              readOnly={readOnly}
              ledOn={ledOnIds.has(node.id)}
              reversedLed={reversedLedIds.has(node.id)}
              motorRunning={motorRunningIds.has(node.id)}
              pendingTerminal={pendingTerminal}
              occupiedTerminals={occupiedTerminals}
              potentiometerValue={
                node.type === "potentiometer" ? (node.state.value as number) : undefined
              }
              onPotentiometerChange={
                onPotentiometerChange
                  ? (v) => onPotentiometerChange(node.id, v)
                  : undefined
              }
              onBodyPointerDown={onBodyPointerDown}
              onRemove={onRemoveNode}
              onTerminalPointerDown={onTerminalPointerDown}
              onTerminalPointerUp={onTerminalPointerUp}
              onSwitchToggle={onSwitchToggle}
              onFlip={onNodeFlip}
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
            <p className="circuit-workbench-empty">
              {editable
                ? "Trage componente din inventar aici"
                : "Apasă Editează pentru a construi circuitul"}
            </p>
          )}

          {editable && nodes.length > 0 && (
            <p className="circuit-workbench-wire-hint">
              Trage sau atinge un terminal, apoi altul, pentru a conecta un fir
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
