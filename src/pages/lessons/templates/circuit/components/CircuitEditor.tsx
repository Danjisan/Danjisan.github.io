import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useCircuitState } from "../hooks/useCircuitState";
import { useSimulationBurn } from "../hooks/useSimulationBurn";
import { useWireInteraction } from "../hooks/useWireInteraction";
import { useWorkbenchDrag } from "../hooks/useWorkbenchDrag";
import { useWorkbenchViewport } from "../hooks/useWorkbenchViewport";
import { canPlacePart, getPart, modelForPart, partOfNode, type InventorySlot } from "../logic/parts";
import { emptyResult } from "../logic/sim/netlist";
import type { DcSimulationResult } from "../logic/sim/types";
import { simulateCircuit } from "../logic/simulateCircuit";
import type { WorkbenchViewport } from "../logic/viewportCoords";
import type { CircuitEdge, CircuitElectricMetadata, CircuitNode, WorkbenchHint } from "../types";
import type { SceneId } from "../../../../../content/circuits/chapters/types";
import CircuitFailureBanner from "./CircuitFailureBanner";
import CircuitWorkbench from "./CircuitWorkbench";
import ComponentPalette from "./ComponentPalette";
import DragGhost from "./DragGhost";

/** Ce poate face elevul pe masă. Implicit: tot. */
export interface EditorPermissions {
  place: boolean;
  move: boolean;
  removeNode: boolean;
  addWire: boolean;
  removeWire: boolean;
  toggle: boolean;
  flip: boolean;
  pot: boolean;
}

export const ALL_PERMISSIONS: EditorPermissions = {
  place: true,
  move: true,
  removeNode: true,
  addWire: true,
  removeWire: true,
  toggle: true,
  flip: true,
  pot: true,
};

export interface CircuitEditorState {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  sim: DcSimulationResult;
}

export interface CircuitEditorToolbarApi {
  viewport: WorkbenchViewport;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  canReset: boolean;
  /** Golește masa (doar în modul liber; la pași, părintele remontează editorul) */
  clear: () => void;
}

interface CircuitEditorProps {
  metadata: Pick<CircuitElectricMetadata, "models" | "simulation">;
  /** Masa de la început. Pentru o masă nouă, părintele schimbă `key`. */
  initial?: { nodes: CircuitNode[]; edges: CircuitEdge[] };
  inventory: InventorySlot[];
  /** false = doar de privit (previzualizare); întrerupătoarele merg dacă `permissions.toggle` */
  editing: boolean;
  permissions?: Partial<EditorPermissions>;
  lockedNodeIds?: Set<string>;
  /** Fixate pe loc (nu se mută / șterg), dar se pot roti */
  pinnedNodeIds?: Set<string>;
  lockedEdgeIds?: Set<string>;
  hints?: WorkbenchHint[];
  /** Fundal de scenă sub piese */
  scene?: SceneId;
  /** Piesele din inventar pulsează (ghidare: „de aici iei piesa”) */
  coachInventory?: boolean;
  /** Simularea oprită (ex. la „prezice”, înainte de „Pornește”) */
  paused?: boolean;
  onChange?: (state: CircuitEditorState) => void;
  renderToolbar?: (api: CircuitEditorToolbarApi) => ReactNode;
  className?: string;
}

/**
 * Masa de lucru completă: piese, fire, simulare, ardere, inventar, zoom.
 * Folosită și de provocările vechi (CircuitElectricTemplate) și de mini-lecții.
 */
export default function CircuitEditor({
  metadata,
  initial,
  inventory,
  editing,
  permissions: permissionsProp,
  lockedNodeIds,
  pinnedNodeIds,
  lockedEdgeIds,
  hints = [],
  coachInventory = false,
  scene,
  paused = false,
  onChange,
  renderToolbar,
  className = "",
}: CircuitEditorProps) {
  const permissions = useMemo(() => ({ ...ALL_PERMISSIONS, ...permissionsProp }), [permissionsProp]);
  const workbenchRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [infoBubbleNodeId, setInfoBubbleNodeId] = useState<string | null>(null);
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  const {
    nodes,
    edges,
    placeNode,
    moveNode,
    removeNode,
    clearBoard,
    addEdge,
    removeEdge,
    toggleSwitch,
    setPotentiometerValue,
    toggleNodeFlip,
    markLedBurned,
  } = useCircuitState(initial);

  const simulation = useMemo(
    () => (paused ? emptyResult() : simulateCircuit(nodes, edges, metadata)),
    [paused, nodes, edges, metadata],
  );

  // Callback-ul părintelui ținut într-un ref: nu re-anunțăm doar pentru că s-a schimbat funcția.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  useEffect(() => {
    onChangeRef.current?.({ nodes, edges, sim: simulation });
  }, [nodes, edges, simulation]);

  useSimulationBurn(simulation, nodes, metadata.models, markLedBurned, setFailureMessage, metadata.simulation);

  const occupiedTerminals = useMemo(() => {
    const set = new Set<string>();
    for (const edge of edges) {
      set.add(`${edge.from.nodeId}:${edge.from.terminal}`);
      set.add(`${edge.to.nodeId}:${edge.to.terminal}`);
    }
    return set;
  }, [edges]);

  const canPlace = useCallback(
    (partId: string) => permissions.place && canPlacePart(nodes, inventory, partId),
    [permissions.place, nodes, inventory],
  );

  const handlePlacePart = useCallback(
    (partId: string, position: { x: number; y: number }) => {
      const part = getPart(partId);
      if (!part) return;
      placeNode(part, position);
      setInventoryCollapsed(true);
    },
    [placeNode],
  );

  const handleSelectPart = useCallback((partId: string) => {
    setSelectedPartId(partId);
    setSelectedNodeId(null);
  }, []);

  const handleSelectNode = useCallback(
    (nodeId: string) => {
      setInfoBubbleNodeId(null);
      setSelectedEdgeId(null);
      setSelectedNodeId(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      setSelectedPartId(node ? partOfNode(node).id : null);
    },
    [nodes],
  );

  const handleNodeLongPress = useCallback((nodeId: string) => {
    setSelectedNodeId(null);
    setSelectedPartId(null);
    setInfoBubbleNodeId(nodeId);
  }, []);

  const handleMoveNode = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      if (!permissions.move || lockedNodeIds?.has(nodeId) || pinnedNodeIds?.has(nodeId)) return;
      moveNode(nodeId, position);
    },
    [permissions.move, lockedNodeIds, pinnedNodeIds, moveNode],
  );

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      if (lockedNodeIds?.has(nodeId) || pinnedNodeIds?.has(nodeId)) return;
      removeNode(nodeId);
      if (selectedNodeId === nodeId) setSelectedNodeId(null);
    },
    [lockedNodeIds, pinnedNodeIds, removeNode, selectedNodeId],
  );

  const { pendingTerminal, wirePointer, handleTerminalPointerDown, handleTerminalPointerUp, handleWirePointerMove, handleSurfacePointerDown, cancelWire } =
    useWireInteraction({ onConnect: addEdge });

  const {
    viewport,
    resetView,
    zoomIn,
    zoomOut,
    handleWheel,
    handleSurfacePointerDown: handleViewportPointerDown,
    handleSurfacePointerMove: handleViewportPointerMove,
    handleSurfacePointerUp: handleViewportPointerUp,
  } = useWorkbenchViewport({ surfaceRef: workbenchRef, panLocked: Boolean(pendingTerminal) });

  const { ghostPosition, palettePreview, draggingNodeId, paletteDragPartId, startPalettePointer, startNodePointer } =
    useWorkbenchDrag({
      workbenchRef,
      viewportRef,
      canPlacePart: canPlace,
      onPlacePart: handlePlacePart,
      onMoveNode: handleMoveNode,
      onSelectPart: handleSelectPart,
      onNodeTap: handleSelectNode,
      onNodeLongPress: handleNodeLongPress,
    });

  const ghostPart = paletteDragPartId ? getPart(paletteDragPartId) ?? null : null;
  const placementPreview =
    ghostPart && palettePreview ? { partId: ghostPart.id, type: ghostPart.type, position: palettePreview } : null;

  const clear = useCallback(() => {
    clearBoard();
    cancelWire();
    resetView();
    setSelectedPartId(null);
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setInfoBubbleNodeId(null);
  }, [clearBoard, cancelWire, resetView]);

  useEffect(() => {
    if (!editing) {
      cancelWire();
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
      setInfoBubbleNodeId(null);
    }
  }, [editing, cancelWire]);

  useEffect(() => {
    if (paletteDragPartId) setInventoryCollapsed(true);
  }, [paletteDragPartId]);

  const onSurfacePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const isBackdrop =
        e.target === e.currentTarget ||
        (e.target instanceof HTMLElement &&
          (e.target.classList.contains("circuit-workbench-empty") ||
            e.target.classList.contains("circuit-workbench-wire-hint")));
      if (editing && isBackdrop) {
        handleSurfacePointerDown(e);
        setInfoBubbleNodeId(null);
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
      }
      if (isBackdrop) handleViewportPointerDown(e);
    },
    [editing, handleSurfacePointerDown, handleViewportPointerDown],
  );

  const onSurfacePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (editing) handleWirePointerMove(e);
      handleViewportPointerMove(e);
    },
    [editing, handleWirePointerMove, handleViewportPointerMove],
  );

  const showPalette = editing && permissions.place && inventory.length > 0;
  const canWire = editing && permissions.addWire;
  const canUnwire = editing && permissions.removeWire;

  return (
    <>
      {renderToolbar?.({
        viewport,
        zoomIn,
        zoomOut,
        resetView,
        canReset: nodes.length > 0 || edges.length > 0,
        clear,
      })}

      <CircuitFailureBanner message={failureMessage} onDismiss={() => setFailureMessage(null)} />

      <div
        className={`circuit-workspace ${editing ? "circuit-workspace--editor" : "circuit-workspace--preview"} ${className}`.trim()}
      >
        {showPalette && (
          <ComponentPalette
            inventory={inventory}
            models={metadata.models}
            selected={selectedPartId}
            nodes={nodes}
            canPlacePart={canPlace}
            coachPartIds={coachInventory ? new Set(inventory.map((s) => s.partId)) : undefined}
            compact
            collapsed={inventoryCollapsed}
            onToggleCollapse={() => setInventoryCollapsed((c) => !c)}
            onTapSelect={handleSelectPart}
            onPalettePointerDown={startPalettePointer}
          />
        )}

        <CircuitWorkbench
          surfaceRef={workbenchRef}
          viewportRef={viewportRef}
          viewport={viewport}
          onWheel={handleWheel}
          hints={editing ? hints : []}
          editable={editing}
          nodes={nodes}
          edges={edges}
          models={metadata.models}
          selectedNodeId={selectedNodeId}
          infoBubbleNodeId={infoBubbleNodeId}
          draggingNodeId={editing ? draggingNodeId : null}
          placementPreview={editing ? placementPreview : null}
          pendingTerminal={canWire ? pendingTerminal : null}
          occupiedTerminals={occupiedTerminals}
          wirePointer={canWire ? wirePointer : null}
          ledOnIds={simulation.ledOn}
          reversedLedIds={simulation.reversedLedIds}
          burnedLedIds={simulation.burnedLedIds}
          motorRunningIds={simulation.motorRunning}
          electricalReadings={simulation.readings}
          wireCurrents={simulation.wireCurrents}
          currentDanger={simulation.shortCircuited || simulation.ledOvercurrent.size > 0}
          lockedNodeIds={lockedNodeIds}
          pinnedNodeIds={permissions.removeNode ? pinnedNodeIds : new Set(nodes.map((n) => n.id))}
          showWireHint={canWire}
          scene={scene}
          selectedEdgeId={selectedEdgeId}
          onSelectEdge={
            canUnwire
              ? (id) => {
                  if (lockedEdgeIds?.has(id)) return;
                  setSelectedEdgeId(id);
                  setSelectedNodeId(null);
                }
              : undefined
          }
          onRemoveEdge={
            canUnwire
              ? (id) => {
                  removeEdge(id);
                  setSelectedEdgeId(null);
                }
              : undefined
          }
          onSurfacePointerMove={onSurfacePointerMove}
          onSurfacePointerDown={onSurfacePointerDown}
          onSurfacePointerUp={handleViewportPointerUp}
          onBodyPointerDown={
            editing
              ? (e, nodeId) => {
                  const node = nodes.find((n) => n.id === nodeId);
                  if (node) startNodePointer(e, nodeId, node.type, node.position);
                }
              : undefined
          }
          onRemoveNode={editing && permissions.removeNode ? handleRemoveNode : undefined}
          onTerminalPointerDown={canWire ? handleTerminalPointerDown : undefined}
          onTerminalPointerUp={canWire ? handleTerminalPointerUp : undefined}
          onSwitchToggle={permissions.toggle ? toggleSwitch : () => {}}
          onNodeFlip={editing && permissions.flip ? toggleNodeFlip : undefined}
          onPotentiometerChange={editing && permissions.pot ? setPotentiometerValue : undefined}
        />
      </div>

      {editing && ghostPart && ghostPosition && !palettePreview && (
        <DragGhost part={ghostPart} model={modelForPart(ghostPart, metadata.models)} x={ghostPosition.x} y={ghostPosition.y} />
      )}
    </>
  );
}
