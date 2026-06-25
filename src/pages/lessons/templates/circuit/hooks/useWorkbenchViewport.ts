import { useCallback, useEffect, useRef, useState } from "react";
import {
  VIEWPORT_ZOOM_STEP,
  clampZoom,
  type WorkbenchViewport,
} from "../logic/viewportCoords";

const PAN_THRESHOLD_PX = 6;

interface UseWorkbenchViewportOptions {
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  /** Dezactivează pan (ex. în timp ce tragi un fir) */
  panLocked?: boolean;
}

function isViewportBackdrop(target: EventTarget | null, currentTarget: EventTarget | null): boolean {
  if (target === currentTarget) return true;
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.classList.contains("circuit-workbench-empty") ||
    target.classList.contains("circuit-workbench-wire-hint")
  );
}

function pinchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

export function useWorkbenchViewport({ surfaceRef, panLocked = false }: UseWorkbenchViewportOptions) {
  const [viewport, setViewport] = useState<WorkbenchViewport>({ zoom: 1, panX: 0, panY: 0 });
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; zoom: number; panX: number; panY: number } | null>(
    null,
  );

  const resetView = useCallback(() => {
    setViewport({ zoom: 1, panX: 0, panY: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setViewport((v) => {
      const el = surfaceRef.current;
      if (!el) return { ...v, zoom: clampZoom(v.zoom + VIEWPORT_ZOOM_STEP) };
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newZoom = clampZoom(v.zoom + VIEWPORT_ZOOM_STEP);
      const ratio = newZoom / v.zoom;
      return {
        zoom: newZoom,
        panX: cx - (cx - v.panX) * ratio,
        panY: cy - (cy - v.panY) * ratio,
      };
    });
  }, [surfaceRef]);

  const zoomOut = useCallback(() => {
    setViewport((v) => {
      const el = surfaceRef.current;
      if (!el) return { ...v, zoom: clampZoom(v.zoom - VIEWPORT_ZOOM_STEP) };
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const newZoom = clampZoom(v.zoom - VIEWPORT_ZOOM_STEP);
      const ratio = newZoom / v.zoom;
      return {
        zoom: newZoom,
        panX: cx - (cx - v.panX) * ratio,
        panY: cy - (cy - v.panY) * ratio,
      };
    });
  }, [surfaceRef]);

  const zoomAtClient = useCallback(
    (clientX: number, clientY: number, deltaZoom: number) => {
      const el = surfaceRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      setViewport((v) => {
        const newZoom = clampZoom(v.zoom + deltaZoom);
        const ratio = newZoom / v.zoom;
        return {
          zoom: newZoom,
          panX: mx - (mx - v.panX) * ratio,
          panY: my - (my - v.panY) * ratio,
        };
      });
    },
    [surfaceRef],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = e.deltaY > 0 ? -VIEWPORT_ZOOM_STEP : VIEWPORT_ZOOM_STEP;
      zoomAtClient(e.clientX, e.clientY, delta);
    },
    [zoomAtClient],
  );

  const handleSurfacePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (panLocked) return;
      if (e.button !== 0 && e.button !== 1) return;
      if (!isViewportBackdrop(e.target, e.currentTarget)) return;
      panRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        panX: viewport.panX,
        panY: viewport.panY,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [panLocked, viewport.panX, viewport.panY],
  );

  const handleSurfacePointerMove = useCallback((e: React.PointerEvent) => {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== e.pointerId) return;
    const dx = e.clientX - pan.startX;
    const dy = e.clientY - pan.startY;
    if (Math.hypot(dx, dy) < PAN_THRESHOLD_PX) return;
    e.preventDefault();
    setViewport((v) => ({
      ...v,
      panX: pan.panX + dx,
      panY: pan.panY + dy,
    }));
  }, []);

  const handleSurfacePointerUp = useCallback((e: React.PointerEvent) => {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== e.pointerId) return;
    panRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchRef.current = {
          distance: pinchDistance(e.touches),
          zoom: viewport.zoom,
          panX: viewport.panX,
          panY: viewport.panY,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const dist = pinchDistance(e.touches);
      const { distance, zoom, panX, panY } = pinchRef.current;
      if (distance < 1) return;
      const rect = el.getBoundingClientRect();
      const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
      const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
      const newZoom = clampZoom(zoom * (dist / distance));
      const ratio = newZoom / zoom;
      setViewport({
        zoom: newZoom,
        panX: cx - (cx - panX) * ratio,
        panY: cy - (cy - panY) * ratio,
      });
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [surfaceRef, viewport.panX, viewport.panY, viewport.zoom]);

  return {
    viewport,
    resetView,
    zoomIn,
    zoomOut,
    handleWheel,
    handleSurfacePointerDown,
    handleSurfacePointerMove,
    handleSurfacePointerUp,
  };
}
