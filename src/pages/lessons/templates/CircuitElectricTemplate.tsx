import { useCallback, useMemo, useRef, useState } from "react";
import type { TemplateProps } from "./types";
import DragGhost from "./circuit/components/DragGhost";
import { parseCircuitMetadata } from "./circuit/parseMetadata";
import ChallengeBanner from "./circuit/components/ChallengeBanner";
import CircuitWorkbench from "./circuit/components/CircuitWorkbench";
import ComponentInfoPanel from "./circuit/components/ComponentInfoPanel";
import ComponentPalette from "./circuit/components/ComponentPalette";
import { useCircuitState } from "./circuit/hooks/useCircuitState";
import { useWireInteraction } from "./circuit/hooks/useWireInteraction";
import { useWorkbenchDrag } from "./circuit/hooks/useWorkbenchDrag";
import { simulateCircuit } from "./circuit/logic/simulateCircuit";
import { isChallengeSolved } from "./circuit/logic/validateCircuit";
import type { ComponentType } from "./circuit/types";

export default function CircuitElectricTemplate({ lesson }: TemplateProps) {
  const { metadata, schemaComplete } = useMemo(
    () => parseCircuitMetadata(lesson.metadata),
    [lesson.metadata],
  );

  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
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

  const selectedModel = selectedType ? metadata.models[selectedType] : null;
  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const potValue =
    selectedNode?.type === "potentiometer" ? (selectedNode.state.value as number) ?? 0.5 : undefined;

  const canPlaceType = useCallback(
    (type: ComponentType) => !placedTypes.has(type),
    [placedTypes],
  );

  const handleSelectType = useCallback((type: ComponentType) => {
    setSelectedType(type);
    setSelectedNodeId(null);
  }, []);

  const handleSelectNode = useCallback((nodeId: string, type: ComponentType) => {
    setSelectedNodeId(nodeId);
    setSelectedType(type);
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

  const {
    ghostPosition,
    palettePreview,
    draggingNodeId,
    paletteDragType,
    startPalettePointer,
    movePalettePointer,
    endPalettePointer,
    startNodePointer,
  } = useWorkbenchDrag({
    workbenchRef,
    canPlaceType,
    onPlaceNode: placeNode,
    onMoveNode: moveNode,
    onSelectType: handleSelectType,
    onSelectNode: handleSelectNode,
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

  return (
    <div className="template-circuit">
      <p className="template-description">{lesson.description}</p>

      {activeChallenge ? (
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
      )}

      <div className="circuit-workspace">
        <ComponentPalette
          components={metadata.components}
          models={metadata.models}
          selected={selectedType}
          placedTypes={placedTypes}
          onTapSelect={handleSelectType}
          onPalettePointerDown={startPalettePointer}
          onPalettePointerMove={movePalettePointer}
          onPalettePointerUp={endPalettePointer}
        />
        <CircuitWorkbench
          surfaceRef={workbenchRef}
          hints={metadata.workbench_hints}
          nodes={nodes}
          edges={edges}
          models={metadata.models}
          selectedNodeId={selectedNodeId}
          draggingNodeId={draggingNodeId}
          placementPreview={placementPreview}
          pendingTerminal={pendingTerminal}
          occupiedTerminals={occupiedTerminals}
          wirePointer={wirePointer}
          ledOnIds={simulation.ledOn}
          reversedLedIds={simulation.reversedLedIds}
          motorRunningIds={simulation.motorRunning}
          onSurfacePointerMove={handleWirePointerMove}
          onSurfacePointerDown={handleSurfacePointerDown}
          onBodyPointerDown={(e, nodeId) => {
            const node = nodes.find((n) => n.id === nodeId);
            if (node) startNodePointer(e, nodeId, node.type, node.position);
          }}
          onRemoveNode={handleRemoveNode}
          onTerminalPointerDown={handleTerminalPointerDown}
          onTerminalPointerUp={handleTerminalPointerUp}
          onSwitchToggle={toggleSwitch}
        />
      </div>

      <ComponentInfoPanel
        type={selectedType}
        model={selectedModel}
        potentiometerValue={potValue}
        onPotentiometerChange={
          selectedNodeId && selectedType === "potentiometer"
            ? (v) => setPotentiometerValue(selectedNodeId, v)
            : undefined
        }
      />

      {ghostType && ghostPosition && !palettePreview && (
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
