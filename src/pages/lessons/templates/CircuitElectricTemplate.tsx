import { useCallback, useMemo, useRef, useState } from "react";
import type { TemplateProps } from "./types";
import DragGhost from "./circuit/components/DragGhost";
import { parseCircuitMetadata } from "./circuit/parseMetadata";
import ChallengeBanner from "./circuit/components/ChallengeBanner";
import CircuitWorkbench from "./circuit/components/CircuitWorkbench";
import ComponentInfoPanel from "./circuit/components/ComponentInfoPanel";
import ComponentPalette from "./circuit/components/ComponentPalette";
import { useCircuitNodes } from "./circuit/hooks/useCircuitNodes";
import { useWorkbenchDrag } from "./circuit/hooks/useWorkbenchDrag";
import type { ComponentType } from "./circuit/types";

export default function CircuitElectricTemplate({ lesson }: TemplateProps) {
  const { metadata, schemaComplete } = useMemo(
    () => parseCircuitMetadata(lesson.metadata),
    [lesson.metadata],
  );

  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const workbenchRef = useRef<HTMLDivElement>(null);

  const { nodes, placedTypes, placeNode, moveNode, removeNode } = useCircuitNodes();

  const sortedChallenges = [...metadata.challenges].sort((a, b) => a.order - b.order);
  const activeChallenge = sortedChallenges[0] ?? null;
  const lockedChallenges = sortedChallenges.slice(1);

  const selectedModel = selectedType ? metadata.models[selectedType] : null;

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

  return (
    <div className="template-circuit">
      <p className="template-description">{lesson.description}</p>

      {activeChallenge ? (
        <ChallengeBanner
          active={activeChallenge}
          locked={lockedChallenges}
          schemaComplete={schemaComplete}
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
          models={metadata.models}
          selectedNodeId={selectedNodeId}
          draggingNodeId={draggingNodeId}
          placementPreview={placementPreview}
          onNodePointerDown={(e, nodeId) => {
            const node = nodes.find((n) => n.id === nodeId);
            if (node) startNodePointer(e, nodeId, node.type, node.position);
          }}
          onRemoveNode={handleRemoveNode}
        />
      </div>

      <ComponentInfoPanel type={selectedType} model={selectedModel} />

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
