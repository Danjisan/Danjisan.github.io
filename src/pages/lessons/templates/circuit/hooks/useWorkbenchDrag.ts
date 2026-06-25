import { useCallback, useEffect, useRef, useState } from "react";
import { clientToWorkbenchPosition, isInsideRect } from "../logic/nodeDefaults";
import type { WorkbenchViewport } from "../logic/viewportCoords";
import type { ComponentType } from "../types";

const DRAG_THRESHOLD_PX = 10;

type DragState =
  | { kind: "palette"; type: ComponentType; pointerId: number }
  | { kind: "node"; nodeId: string; pointerId: number }
  | null;

interface PointerPoint {
  x: number;
  y: number;
}

interface UseWorkbenchDragOptions {
  workbenchRef: React.RefObject<HTMLDivElement | null>;
  viewport: WorkbenchViewport;
  canPlaceType: (type: ComponentType) => boolean;
  onPlaceNode: (type: ComponentType, position: { x: number; y: number }) => void;
  onMoveNode: (nodeId: string, position: { x: number; y: number }) => void;
  onSelectType: (type: ComponentType) => void;
  onSelectNode: (nodeId: string, type: ComponentType) => void;
}

export function useWorkbenchDrag({
  workbenchRef,
  viewport,
  canPlaceType,
  onPlaceNode,
  onMoveNode,
  onSelectType,
  onSelectNode,
}: UseWorkbenchDragOptions) {
  const [activeDrag, setActiveDrag] = useState<DragState>(null);
  const [ghostPosition, setGhostPosition] = useState<PointerPoint | null>(null);
  const [palettePreview, setPalettePreview] = useState<{ x: number; y: number } | null>(null);
  const nodeDragOriginRef = useRef<{ nodeId: string; position: { x: number; y: number } } | null>(
    null,
  );
  const pendingPaletteRef = useRef<{
    type: ComponentType;
    pointerId: number;
    startX: number;
    startY: number;
  } | null>(null);

  const startPalettePointer = useCallback(
    (type: ComponentType, e: React.PointerEvent) => {
      if (!canPlaceType(type)) return;
      e.preventDefault();
      pendingPaletteRef.current = {
        type,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [canPlaceType],
  );

  const movePalettePointer = useCallback((e: React.PointerEvent) => {
    const pending = pendingPaletteRef.current;
    if (!pending || pending.pointerId !== e.pointerId) return;

    const dx = e.clientX - pending.startX;
    const dy = e.clientY - pending.startY;
    if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

    e.preventDefault();
    setActiveDrag({ kind: "palette", type: pending.type, pointerId: e.pointerId });
    setGhostPosition({ x: e.clientX, y: e.clientY });
    pendingPaletteRef.current = null;
  }, []);

  const endPalettePointer = useCallback(
    (type: ComponentType, e: React.PointerEvent) => {
      const pending = pendingPaletteRef.current;
      if (pending && pending.pointerId === e.pointerId) {
        onSelectType(type);
        pendingPaletteRef.current = null;
      }
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* capture deja eliberat */
      }
    },
    [onSelectType],
  );

  const startNodePointer = useCallback(
    (
      e: React.PointerEvent,
      nodeId: string,
      type: ComponentType,
      position: { x: number; y: number },
    ) => {
      e.preventDefault();
      e.stopPropagation();
      onSelectNode(nodeId, type);
      nodeDragOriginRef.current = { nodeId, position: { ...position } };
      setActiveDrag({ kind: "node", nodeId, pointerId: e.pointerId });
      setGhostPosition({ x: e.clientX, y: e.clientY });
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [onSelectNode],
  );

  useEffect(() => {
    if (!activeDrag) return;

    document.body.classList.add("circuit-is-dragging");

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== activeDrag.pointerId) return;
      e.preventDefault();
      setGhostPosition({ x: e.clientX, y: e.clientY });

      const surface = workbenchRef.current;
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      const position = clientToWorkbenchPosition(e.clientX, e.clientY, rect, viewport);
      const inside = isInsideRect(e.clientX, e.clientY, rect);

      if (activeDrag.kind === "node") {
        onMoveNode(activeDrag.nodeId, position);
      } else if (activeDrag.kind === "palette") {
        setPalettePreview(inside ? position : null);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== activeDrag.pointerId) return;

      const surface = workbenchRef.current;
      if (surface) {
        const rect = surface.getBoundingClientRect();
        const inside = isInsideRect(e.clientX, e.clientY, rect);

        if (inside) {
          const position = clientToWorkbenchPosition(e.clientX, e.clientY, rect, viewport);
          if (activeDrag.kind === "palette" && canPlaceType(activeDrag.type)) {
            onPlaceNode(activeDrag.type, position);
          }
        } else if (activeDrag.kind === "node") {
          const origin = nodeDragOriginRef.current;
          if (origin && origin.nodeId === activeDrag.nodeId) {
            onMoveNode(activeDrag.nodeId, origin.position);
          }
        }
      }

      nodeDragOriginRef.current = null;
      setActiveDrag(null);
      setGhostPosition(null);
      setPalettePreview(null);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      document.body.classList.remove("circuit-is-dragging");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [activeDrag, canPlaceType, onMoveNode, onPlaceNode, viewport, workbenchRef]);

  return {
    activeDrag,
    ghostPosition,
    palettePreview,
    draggingNodeId: activeDrag?.kind === "node" ? activeDrag.nodeId : null,
    paletteDragType: activeDrag?.kind === "palette" ? activeDrag.type : null,
    startPalettePointer,
    movePalettePointer,
    endPalettePointer,
    startNodePointer,
  };
}
