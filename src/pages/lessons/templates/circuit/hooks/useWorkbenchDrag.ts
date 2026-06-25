import { useCallback, useEffect, useRef, useState } from "react";
import { clientToWorkbenchPosition, isInsideRect } from "../logic/nodeDefaults";
import type { WorkbenchViewport } from "../logic/viewportCoords";
import type { ComponentType } from "../types";

const DRAG_THRESHOLD_PX = 10;

type ActiveDrag =
  | { kind: "palette"; type: ComponentType; pointerId: number }
  | { kind: "node"; nodeId: string; pointerId: number };

type PendingPalette = {
  type: ComponentType;
  pointerId: number;
  startX: number;
  startY: number;
};

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
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingPalette, setPendingPalette] = useState<PendingPalette | null>(null);
  const [ghostPosition, setGhostPosition] = useState<PointerPoint | null>(null);
  const [palettePreview, setPalettePreview] = useState<{ x: number; y: number } | null>(null);
  const nodeDragOriginRef = useRef<{ nodeId: string; position: { x: number; y: number } } | null>(
    null,
  );
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const pendingPaletteRef = useRef<PendingPalette | null>(null);

  activeDragRef.current = activeDrag;
  pendingPaletteRef.current = pendingPalette;

  const startPalettePointer = useCallback(
    (type: ComponentType, e: React.PointerEvent) => {
      if (!canPlaceType(type)) return;
      e.preventDefault();
      e.stopPropagation();
      setPendingPalette({
        type,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
      });
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [canPlaceType],
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
      setPendingPalette(null);
      onSelectNode(nodeId, type);
      nodeDragOriginRef.current = { nodeId, position: { ...position } };
      setActiveDrag({ kind: "node", nodeId, pointerId: e.pointerId });
      setGhostPosition({ x: e.clientX, y: e.clientY });
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    },
    [onSelectNode],
  );

  const finishDrag = useCallback(() => {
    nodeDragOriginRef.current = null;
    setActiveDrag(null);
    setPendingPalette(null);
    setGhostPosition(null);
    setPalettePreview(null);
  }, []);

  useEffect(() => {
    if (!pendingPalette && !activeDrag) return;

    document.body.classList.add("circuit-is-dragging");

    const updateDragMove = (clientX: number, clientY: number) => {
      setGhostPosition({ x: clientX, y: clientY });

      const surface = workbenchRef.current;
      if (!surface) return;

      const rect = surface.getBoundingClientRect();
      const position = clientToWorkbenchPosition(clientX, clientY, rect, viewport);
      const inside = isInsideRect(clientX, clientY, rect);
      const drag = activeDragRef.current;

      if (drag?.kind === "node") {
        onMoveNode(drag.nodeId, position);
      } else if (drag?.kind === "palette") {
        setPalettePreview(inside ? position : null);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const pending = pendingPaletteRef.current;
      const drag = activeDragRef.current;

      const pointerId = drag?.pointerId ?? pending?.pointerId;
      if (pointerId === undefined || e.pointerId !== pointerId) return;

      e.preventDefault();

      if (pending && !drag) {
        const dx = e.clientX - pending.startX;
        const dy = e.clientY - pending.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

        const next: ActiveDrag = { kind: "palette", type: pending.type, pointerId: e.pointerId };
        activeDragRef.current = next;
        pendingPaletteRef.current = null;
        setPendingPalette(null);
        setActiveDrag(next);
        updateDragMove(e.clientX, e.clientY);
        return;
      }

      if (drag) updateDragMove(e.clientX, e.clientY);
    };

    const onPointerEnd = (e: PointerEvent) => {
      const pending = pendingPaletteRef.current;
      const drag = activeDragRef.current;

      if (pending && !drag && e.pointerId === pending.pointerId) {
        onSelectType(pending.type);
        finishDrag();
        return;
      }

      if (!drag || e.pointerId !== drag.pointerId) return;

      const surface = workbenchRef.current;
      if (surface) {
        const rect = surface.getBoundingClientRect();
        const inside = isInsideRect(e.clientX, e.clientY, rect);

        if (inside) {
          const position = clientToWorkbenchPosition(e.clientX, e.clientY, rect, viewport);
          if (drag.kind === "palette" && canPlaceType(drag.type)) {
            onPlaceNode(drag.type, position);
          }
        } else if (drag.kind === "node") {
          const origin = nodeDragOriginRef.current;
          if (origin && origin.nodeId === drag.nodeId) {
            onMoveNode(drag.nodeId, origin.position);
          }
        }
      }

      finishDrag();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerEnd);
    window.addEventListener("pointercancel", onPointerEnd);
    return () => {
      document.body.classList.remove("circuit-is-dragging");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerEnd);
      window.removeEventListener("pointercancel", onPointerEnd);
    };
  }, [
    activeDrag,
    pendingPalette,
    canPlaceType,
    finishDrag,
    onMoveNode,
    onPlaceNode,
    onSelectType,
    viewport,
    workbenchRef,
  ]);

  return {
    activeDrag,
    ghostPosition,
    palettePreview,
    draggingNodeId: activeDrag?.kind === "node" ? activeDrag.nodeId : null,
    paletteDragType: activeDrag?.kind === "palette" ? activeDrag.type : null,
    startPalettePointer,
    startNodePointer,
  };
}
