import { type RefObject } from "react";
import CircuitNode2D from "./CircuitNode2D";
import WireLayer from "./WireLayer";
import CircuitScene from "./CircuitScene";
import type { SceneId } from "../../../../../content/circuits/chapters/types";
import { modelForPart, partOfNode } from "../logic/parts";
import { viewportTransformStyle, type WorkbenchViewport } from "../logic/viewportCoords";
import type {
  BranchElectricalReading,
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
  viewportRef: RefObject<HTMLDivElement | null>;
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
  placementPreview: { partId: string; type: ComponentType; position: { x: number; y: number } } | null;
  pendingTerminal: CircuitTerminalRef | null;
  occupiedTerminals: Set<string>;
  wirePointer: { x: number; y: number } | null;
  ledOnIds: Set<string>;
  reversedLedIds: Set<string>;
  burnedLedIds: Set<string>;
  motorRunningIds: Set<string>;
  electricalReadings: Map<string, BranchElectricalReading>;
  /** edge.id → curent (A), sens convențional from → to */
  wireCurrents: Map<string, number>;
  /** LED peste limită sau scurtcircuit */
  currentDanger?: boolean;
  selectedEdgeId?: string | null;
  highlightEdgeIds?: Set<string>;
  /** Etichete mici pe piese (ex. numărul nodului în ajutor) */
  nodeBadges?: Map<string, string>;
  /** Piese care nu se pot șterge sau roti */
  lockedNodeIds?: Set<string>;
  /** Piese care nu se pot șterge (dar se pot roti) */
  pinnedNodeIds?: Set<string>;
  /** Fundal de scenă (lanternă, cameră, bicicletă) */
  scene?: SceneId;
  /** Arată îndemnul „Atinge o bornă…” (doar dacă se pot lega fire) */
  showWireHint?: boolean;
  onSelectEdge?: (edgeId: string) => void;
  onRemoveEdge?: (edgeId: string) => void;
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
  viewportRef,
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
  burnedLedIds,
  motorRunningIds,
  electricalReadings,
  wireCurrents,
  currentDanger = false,
  selectedEdgeId = null,
  highlightEdgeIds,
  nodeBadges,
  lockedNodeIds,
  pinnedNodeIds,
  showWireHint = true,
  scene,
  onSelectEdge,
  onRemoveEdge,
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
  const isEmpty = nodes.length === 0 && !placementPreview;
  const readOnly = !editable;
  const isPannable = viewport.zoom !== 1 || viewport.panX !== 0 || viewport.panY !== 0;
  const hasCurrent = [...wireCurrents.values()].some((i) => i !== 0);

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
          {scene && <CircuitScene scene={scene} nodes={nodes} ledOnIds={ledOnIds} />}

          <WireLayer
            nodes={nodes}
            edges={edges}
            wireCurrents={wireCurrents}
            danger={currentDanger}
            editable={editable}
            selectedEdgeId={selectedEdgeId}
            highlightEdgeIds={highlightEdgeIds}
            onSelectEdge={onSelectEdge}
            onRemoveEdge={onRemoveEdge}
            pendingTerminal={editable ? pendingTerminal : null}
            pointer={editable ? wirePointer : null}
            viewportRef={viewportRef}
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
              model={modelForPart(partOfNode(node), models)}
              selected={editable && selectedNodeId === node.id}
              showInfoBubble={editable && infoBubbleNodeId === node.id}
              dragging={draggingNodeId === node.id}
              readOnly={readOnly}
              ledOn={ledOnIds.has(node.id)}
              reversedLed={reversedLedIds.has(node.id)}
              ledBurned={burnedLedIds.has(node.id)}
              motorRunning={motorRunningIds.has(node.id)}
              badge={nodeBadges?.get(node.id)}
              electricalReading={
                selectedNodeId === node.id ? electricalReadings.get(node.id) : undefined
              }
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
              onRemove={lockedNodeIds?.has(node.id) || pinnedNodeIds?.has(node.id) ? undefined : onRemoveNode}
              onTerminalPointerDown={onTerminalPointerDown}
              onTerminalPointerUp={onTerminalPointerUp}
              onSwitchToggle={onSwitchToggle}
              onFlip={lockedNodeIds?.has(node.id) ? undefined : onNodeFlip}
            />
          ))}

          {placementPreview && (
            <CircuitNode2D
              node={{
                id: "placement-preview",
                type: placementPreview.type,
                position: placementPreview.position,
                state: { partId: placementPreview.partId },
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

          {editable && showWireHint && nodes.length > 0 && !hasCurrent && (
            <p className="circuit-workbench-wire-hint">
              Atinge o bornă, apoi alta, ca să legi un fir. Pe o bornă pot fi mai multe fire. Atinge un fir ca să-l ștergi.
            </p>
          )}
        </div>
      </div>

      {hasCurrent && (
        <p className="circuit-electron-legend">
          <span className="circuit-electron-legend-dot" aria-hidden="true" />
          Electronii pleacă de la − și merg spre + . Cu cât trec mai repede, cu atât curentul e mai mare.
        </p>
      )}
    </div>
  );
}
