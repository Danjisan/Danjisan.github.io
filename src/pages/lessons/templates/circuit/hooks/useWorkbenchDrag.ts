import { useCallback, useEffect, useRef, useState } from "react";
import { clientToWorkbenchPosition, isInsideRect } from "../logic/nodeDefaults";
import type { WorkbenchViewport } from "../logic/viewportCoords";
import type { ComponentType } from "../types";

const DRAG_THRESHOLD_PX = 10;
const LONG_PRESS_MS = 480;

type ActiveDrag =
  | { kind: "palette"; type: ComponentType; pointerId: number }
  | { kind: "node"; nodeId: string; pointerId: number };

type PendingPalette = {
  type: ComponentType;
  pointerId: number;
  startX: number;
  startY: number;
};

type PendingNode = {
  nodeId: string;
  type: ComponentType;
  pointerId: number;
  startX: number;
  startY: number;
  position: { x: number; y: number };
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
  onNodeTap: (nodeId: string, type: ComponentType) => void;
  onNodeLongPress: (nodeId: string, type: ComponentType) => void;
}

export function useWorkbenchDrag({
  workbenchRef,
  viewport,
  canPlaceType,
  onPlaceNode,
  onMoveNode,
  onSelectType,
  onNodeTap,
  onNodeLongPress,
}: UseWorkbenchDragOptions) {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [pendingPalette, setPendingPalette] = useState<PendingPalette | null>(null);
  const [pendingNode, setPendingNode] = useState<PendingNode | null>(null);
  const [ghostPosition, setGhostPosition] = useState<PointerPoint | null>(null);
  const [palettePreview, setPalettePreview] = useState<{ x: number; y: number } | null>(null);
  const nodeDragOriginRef = useRef<{ nodeId: string; position: { x: number; y: number } } | null>(
    null,
  );
  const activeDragRef = useRef<ActiveDrag | null>(null);
  const pendingPaletteRef = useRef<PendingPalette | null>(null);
  const pendingNodeRef = useRef<PendingNode | null>(null);
  const longPressTimerRef = useRef<number | null>(null);

  activeDragRef.current = activeDrag;
  pendingPaletteRef.current = pendingPalette;
  pendingNodeRef.current = pendingNode;

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const startPalettePointer = useCallback(
    (type: ComponentType, e: React.PointerEvent) => {
      if (!canPlaceType(type)) return;
      e.preventDefault();
      e.stopPropagation();
      clearLongPressTimer();
      setPendingNode(null);
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
    [canPlaceType, clearLongPressTimer],
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
      clearLongPressTimer();
      setPendingPalette(null);
      const session: PendingNode = {
        nodeId,
        type,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        position: { ...position },
      };
      setPendingNode(session);
      pendingNodeRef.current = session;
      longPressTimerRef.current = window.setTimeout(() => {
        const pending = pendingNodeRef.current;
        if (pending && pending.nodeId === nodeId) {
          onNodeLongPress(nodeId, type);
          pendingNodeRef.current = null;
          setPendingNode(null);
        }
        longPressTimerRef.current = null;
      }, LONG_PRESS_MS);
    },
    [clearLongPressTimer, onNodeLongPress],
  );

  const finishDrag = useCallback(() => {
    clearLongPressTimer();
    nodeDragOriginRef.current = null;
    setActiveDrag(null);
    setPendingPalette(null);
    setPendingNode(null);
    pendingNodeRef.current = null;
    setGhostPosition(null);
    setPalettePreview(null);
  }, [clearLongPressTimer]);

  useEffect(() => {
    if (!pendingPalette && !pendingNode && !activeDrag) return;

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
      const pendingP = pendingPaletteRef.current;
      const pendingN = pendingNodeRef.current;
      const drag = activeDragRef.current;

      const pointerId = drag?.pointerId ?? pendingP?.pointerId ?? pendingN?.pointerId;
      if (pointerId === undefined || e.pointerId !== pointerId) return;

      e.preventDefault();

      if (pendingN && !drag) {
        const dx = e.clientX - pendingN.startX;
        const dy = e.clientY - pendingN.startY;
        if (Math.hypot(dx, dy) >= DRAG_THRESHOLD_PX) {
          clearLongPressTimer();
          onNodeTap(pendingN.nodeId, pendingN.type);
          nodeDragOriginRef.current = { nodeId: pendingN.nodeId, position: pendingN.position };
          const next: ActiveDrag = { kind: "node", nodeId: pendingN.nodeId, pointerId: e.pointerId };
          activeDragRef.current = next;
          pendingNodeRef.current = null;
          setPendingNode(null);
          setActiveDrag(next);
          setGhostPosition({ x: e.clientX, y: e.clientY });
          updateDragMove(e.clientX, e.clientY);
          return;
        }
      }

      if (pendingP && !drag) {
        const dx = e.clientX - pendingP.startX;
        const dy = e.clientY - pendingP.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;

        const next: ActiveDrag = { kind: "palette", type: pendingP.type, pointerId: e.pointerId };
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
      const pendingP = pendingPaletteRef.current;
      const pendingN = pendingNodeRef.current;
      const drag = activeDragRef.current;

      if (pendingN && !drag && e.pointerId === pendingN.pointerId) {
        clearLongPressTimer();
        const dx = e.clientX - pendingN.startX;
        const dy = e.clientY - pendingN.startY;
        if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) {
          onNodeTap(pendingN.nodeId, pendingN.type);
        }
        pendingNodeRef.current = null;
        setPendingNode(null);
        return;
      }

      if (pendingP && !drag && e.pointerId === pendingP.pointerId) {
        onSelectType(pendingP.type);
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
    pendingNode,
    canPlaceType,
    clearLongPressTimer,
    finishDrag,
    onMoveNode,
    onNodeTap,
    onPlaceNode,
    onSelectType,
    viewport,
    workbenchRef,
  ]);

  useEffect(() => () => clearLongPressTimer(), [clearLongPressTimer]);

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
