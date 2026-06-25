import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TemplateProps } from "./types";
import DragGhost from "./circuit/components/DragGhost";
import { parseCircuitMetadata } from "./circuit/parseMetadata";
import ChallengeBanner from "./circuit/components/ChallengeBanner";
import CircuitEditorFrame from "./circuit/components/CircuitEditorFrame";
import CircuitEditorToolbar from "./circuit/components/CircuitEditorToolbar";
import CircuitFullscreenHeader from "./circuit/components/CircuitFullscreenHeader";
import CircuitWorkbench from "./circuit/components/CircuitWorkbench";
import ComponentPalette from "./circuit/components/ComponentPalette";
import { useCircuitState } from "./circuit/hooks/useCircuitState";
import { useWireInteraction } from "./circuit/hooks/useWireInteraction";
import { useWorkbenchDrag } from "./circuit/hooks/useWorkbenchDrag";
import { useWorkbenchViewport } from "./circuit/hooks/useWorkbenchViewport";
import { simulateCircuit } from "./circuit/logic/simulateCircuit";
import { isChallengeSolved } from "./circuit/logic/validateCircuit";
import { hintsForEditor } from "./circuit/logic/workbenchHints";
import type { ComponentType } from "./circuit/types";

export default function CircuitElectricTemplate({ lesson }: TemplateProps) {
  const { metadata, schemaComplete } = useMemo(
    () => parseCircuitMetadata(lesson.metadata),
    [lesson.metadata],
  );

  const editorHints = useMemo(() => hintsForEditor(metadata.workbench_hints), [metadata.workbench_hints]);

  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [inventoryCollapsed, setInventoryCollapsed] = useState(false);
  const [infoBubbleNodeId, setInfoBubbleNodeId] = useState<string | null>(null);
  const workbenchRef = useRef<HTMLDivElement>(null);

  const {
    nodes,
    edges,
    placedTypes,
    placeNode,
    moveNode,
    removeNode,
    clearBoard,
    addEdge,
    removeEdge,
    edgeAtTerminal,
    toggleSwitch,
    setPotentiometerValue,
    toggleNodeFlip,
  } = useCircuitState();

  const occupiedTerminals = useMemo(() => {
    const set = new Set<string>();
    for (const edge of edges) {
      set.add(`${edge.from.nodeId}:${edge.from.terminal}`);
      set.add(`${edge.to.nodeId}:${edge.to.terminal}`);
    }
    return set;
  }, [edges]);

  const sortedChallenges = [...metadata.challenges].sort((a, b) => a.order - b.order);
  const activeChallenge = sortedChallenges[activeChallengeIndex] ?? null;
  const nextChallenge = sortedChallenges[activeChallengeIndex + 1] ?? null;
  const lockedChallenges = sortedChallenges.filter((_, i) => i > activeChallengeIndex + 1);

  const challengeSolved = useMemo(
    () => (activeChallenge ? isChallengeSolved(nodes, edges, activeChallenge) : false),
    [activeChallenge, nodes, edges],
  );

  const simulation = useMemo(() => simulateCircuit(nodes, edges), [nodes, edges]);

  const dismissInfoBubble = useCallback(() => setInfoBubbleNodeId(null), []);

  const enterEditorFullscreen = useCallback(() => {
    setEditorFullscreen(true);
    setInventoryCollapsed(true);
  }, []);

  const toggleInventoryCollapsed = useCallback(() => {
    setInventoryCollapsed((c) => !c);
  }, []);

  const canPlaceType = useCallback(
    (type: ComponentType) => !placedTypes.has(type),
    [placedTypes],
  );

  const handlePlaceNode = useCallback(
    (type: ComponentType, position: { x: number; y: number }) => {
      placeNode(type, position);
      setInventoryCollapsed(true);
    },
    [placeNode],
  );

  const handleSelectType = useCallback((type: ComponentType) => {
    setSelectedType(type);
    setSelectedNodeId(null);
  }, []);

  const handleSelectNode = useCallback((nodeId: string, type: ComponentType) => {
    setInfoBubbleNodeId(null);
    setSelectedNodeId(nodeId);
    setSelectedType(type);
  }, []);

  const handleNodeTap = useCallback(
    (nodeId: string, type: ComponentType) => {
      handleSelectNode(nodeId, type);
    },
    [handleSelectNode],
  );

  const handleNodeLongPress = useCallback((nodeId: string, type: ComponentType) => {
    setSelectedNodeId(null);
    setSelectedType(type);
    setInfoBubbleNodeId(nodeId);
  }, []);

  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      removeNode(nodeId);
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [removeNode, selectedNodeId],
  );

  const {
    pendingTerminal,
    wirePointer,
    handleTerminalPointerDown,
    handleTerminalPointerUp,
    handleWirePointerMove,
    handleSurfacePointerDown,
    cancelWire,
  } = useWireInteraction({
    onConnect: addEdge,
    onDisconnect: removeEdge,
    getEdgeAtTerminal: edgeAtTerminal,
  });

  const exitEditorFullscreen = useCallback(() => {
    cancelWire();
    setEditorFullscreen(false);
    setSelectedType(null);
    setSelectedNodeId(null);
    setInfoBubbleNodeId(null);
  }, [cancelWire]);

  const {
    viewport,
    resetView,
    zoomIn,
    zoomOut,
    handleWheel,
    handleSurfacePointerDown: handleViewportPointerDown,
    handleSurfacePointerMove: handleViewportPointerMove,
    handleSurfacePointerUp: handleViewportPointerUp,
  } = useWorkbenchViewport({
    surfaceRef: workbenchRef,
    panLocked: Boolean(pendingTerminal),
  });

  const {
    ghostPosition,
    palettePreview,
    draggingNodeId,
    paletteDragType,
    startPalettePointer,
    startNodePointer,
  } = useWorkbenchDrag({
    workbenchRef,
    viewport,
    canPlaceType,
    onPlaceNode: handlePlaceNode,
    onMoveNode: moveNode,
    onSelectType: handleSelectType,
    onNodeTap: handleNodeTap,
    onNodeLongPress: handleNodeLongPress,
  });

  const ghostType = paletteDragType;
  const placementPreview =
    paletteDragType && palettePreview
      ? { type: paletteDragType, position: palettePreview }
      : null;

  const advanceChallenge = useCallback(() => {
    clearBoard();
    cancelWire();
    setActiveChallengeIndex((i) => i + 1);
    setSelectedType(null);
    setSelectedNodeId(null);
  }, [clearBoard, cancelWire]);

  const resetBoard = useCallback(() => {
    clearBoard();
    cancelWire();
    resetView();
    setSelectedType(null);
    setSelectedNodeId(null);
    setInfoBubbleNodeId(null);
  }, [clearBoard, cancelWire, resetView]);

  const onSurfacePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const isBackdrop =
        e.target === e.currentTarget ||
        (e.target instanceof HTMLElement &&
          (e.target.classList.contains("circuit-workbench-empty") ||
            e.target.classList.contains("circuit-workbench-wire-hint")));
      if (editorFullscreen && isBackdrop) {
        handleSurfacePointerDown(e);
        dismissInfoBubble();
        setSelectedNodeId(null);
      }
      if (isBackdrop) handleViewportPointerDown(e);
    },
    [editorFullscreen, handleSurfacePointerDown, handleViewportPointerDown, dismissInfoBubble],
  );

  const onSurfacePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (editorFullscreen) handleWirePointerMove(e);
      handleViewportPointerMove(e);
    },
    [editorFullscreen, handleWirePointerMove, handleViewportPointerMove],
  );

  const onSurfacePointerUp = useCallback(
    (e: React.PointerEvent) => {
      handleViewportPointerUp(e);
    },
    [handleViewportPointerUp],
  );

  useEffect(() => {
    if (!editorFullscreen) {
      cancelWire();
      return;
    }
    if (paletteDragType) setInventoryCollapsed(true);
  }, [editorFullscreen, paletteDragType, cancelWire]);

  const editToolbarButton = (
    <button
      type="button"
      className="circuit-workbench-expand-btn"
      aria-label="Deschide editorul pe tot ecranul"
      onClick={enterEditorFullscreen}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="circuit-workbench-expand-label">Editează circuitul</span>
    </button>
  );

  const canResetBoard = nodes.length > 0 || edges.length > 0;

  const workbench = (
    <CircuitWorkbench
      surfaceRef={workbenchRef}
      viewport={viewport}
      onWheel={handleWheel}
      hints={editorFullscreen ? editorHints : []}
      editable={editorFullscreen}
      nodes={nodes}
      edges={edges}
      models={metadata.models}
      selectedNodeId={selectedNodeId}
      infoBubbleNodeId={infoBubbleNodeId}
      draggingNodeId={editorFullscreen ? draggingNodeId : null}
      placementPreview={editorFullscreen ? placementPreview : null}
      pendingTerminal={editorFullscreen ? pendingTerminal : null}
      occupiedTerminals={occupiedTerminals}
      wirePointer={editorFullscreen ? wirePointer : null}
      ledOnIds={simulation.ledOn}
      reversedLedIds={simulation.reversedLedIds}
      motorRunningIds={simulation.motorRunning}
      onSurfacePointerMove={onSurfacePointerMove}
      onSurfacePointerDown={onSurfacePointerDown}
      onSurfacePointerUp={onSurfacePointerUp}
      onBodyPointerDown={
        editorFullscreen
          ? (e, nodeId) => {
              const node = nodes.find((n) => n.id === nodeId);
              if (node) startNodePointer(e, nodeId, node.type, node.position);
            }
          : undefined
      }
      onRemoveNode={editorFullscreen ? handleRemoveNode : undefined}
      onTerminalPointerDown={editorFullscreen ? handleTerminalPointerDown : undefined}
      onTerminalPointerUp={editorFullscreen ? handleTerminalPointerUp : undefined}
      onSwitchToggle={toggleSwitch}
      onNodeFlip={editorFullscreen ? toggleNodeFlip : undefined}
      onPotentiometerChange={editorFullscreen ? setPotentiometerValue : undefined}
    />
  );

  return (
    <div className="template-circuit">
      <p className="template-description">{lesson.description}</p>

      {!editorFullscreen &&
        (activeChallenge ? (
          <ChallengeBanner
            active={activeChallenge}
            locked={lockedChallenges}
            schemaComplete={schemaComplete}
            solved={challengeSolved}
            nextChallenge={nextChallenge}
            feedbackHints={simulation.hints}
            onAdvance={advanceChallenge}
          />
        ) : (
          <p className="circuit-schema-notice">Nicio provocare definită în metadata lecției.</p>
        ))}

      <CircuitEditorFrame fullscreen={editorFullscreen} onExitFullscreen={exitEditorFullscreen}>
        {editorFullscreen && activeChallenge && (
          <CircuitFullscreenHeader
            challenge={activeChallenge}
            solved={challengeSolved}
            feedbackHints={simulation.hints}
          />
        )}

        {!editorFullscreen && (
          <CircuitEditorToolbar
            canReset={canResetBoard}
            onResetBoard={resetBoard}
            viewport={viewport}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={resetView}
            end={editToolbarButton}
          />
        )}

        <div
          className={`circuit-workspace ${editorFullscreen ? "circuit-workspace--editor" : "circuit-workspace--preview"}`}
        >
          {editorFullscreen && (
            <ComponentPalette
              components={metadata.components}
              models={metadata.models}
              selected={selectedType}
              placedTypes={placedTypes}
              compact
              collapsed={inventoryCollapsed}
              onToggleCollapse={toggleInventoryCollapsed}
              onTapSelect={handleSelectType}
              onPalettePointerDown={startPalettePointer}
            />
          )}
          {workbench}
        </div>

        {editorFullscreen && challengeSolved && nextChallenge && (
          <button type="button" className="circuit-fs-advance-btn" onClick={advanceChallenge}>
            Continuă: {nextChallenge.title}
          </button>
        )}
      </CircuitEditorFrame>

      {editorFullscreen && ghostType && ghostPosition && !palettePreview && (
        <DragGhost
          type={ghostType}
          model={metadata.models[ghostType]}
          x={ghostPosition.x}
          y={ghostPosition.y}
        />
      )}
    </div>
  );
}
