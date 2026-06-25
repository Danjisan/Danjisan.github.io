import { useLayoutEffect, useState } from "react";
import { wireLinePath } from "../logic/wireGeometry";
import {
  clientToViewportLocal,
  measureTerminalCenters,
  type TerminalCenterMap,
} from "../logic/wireViewportCoords";
import type { WorkbenchViewport } from "../logic/viewportCoords";
import type { CircuitEdge, CircuitTerminalRef } from "../types";

interface WireLayerProps {
  edges: CircuitEdge[];
  pendingTerminal: CircuitTerminalRef | null;
  pointer: { x: number; y: number } | null;
  surfaceRef: React.RefObject<HTMLDivElement | null>;
  viewportRef: React.RefObject<HTMLDivElement | null>;
  viewport: WorkbenchViewport;
  /** Invalidare măsurători când se mută/întorc noduri */
  layoutKey: string;
}

interface WireLayout {
  width: number;
  height: number;
  centers: TerminalCenterMap;
}

const EMPTY_LAYOUT: WireLayout = { width: 1, height: 1, centers: new Map() };

export default function WireLayer({
  edges,
  pendingTerminal,
  pointer,
  surfaceRef,
  viewportRef,
  viewport,
  layoutKey,
}: WireLayerProps) {
  const [layout, setLayout] = useState<WireLayout>(EMPTY_LAYOUT);

  useLayoutEffect(() => {
    const viewportEl = viewportRef.current;
    if (!viewportEl) return;

    let frame = 0;

    const update = () => {
      setLayout(measureTerminalCenters(viewportEl, viewport));
    };

    // Așteaptă layout-ul nodurilor/terminalelor după commit
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(update);
    });

    const ro = new ResizeObserver(update);
    ro.observe(viewportEl);
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [viewportRef, viewport.zoom, viewport.panX, viewport.panY, layoutKey]);

  const resolveTerminal = (ref: CircuitTerminalRef) =>
    layout.centers.get(`${ref.nodeId}:${ref.terminal}`) ?? null;

  let pendingLineEnd: { x: number; y: number } | null = null;
  if (pendingTerminal && pointer && surfaceRef.current) {
    pendingLineEnd = clientToViewportLocal(
      pointer.x,
      pointer.y,
      surfaceRef.current.getBoundingClientRect(),
      viewport,
    );
  }

  const pendingStart = pendingTerminal ? resolveTerminal(pendingTerminal) : null;
  const { width, height } = layout;
  const ready = width > 1 && height > 1;

  if (!ready) return null;

  return (
    <svg
      className="circuit-wire-layer"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {edges.map((edge) => {
        const from = resolveTerminal(edge.from);
        const to = resolveTerminal(edge.to);
        if (!from || !to) return null;
        return (
          <path
            key={edge.id}
            className="circuit-wire"
            d={wireLinePath(from, to)}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {pendingStart && pendingLineEnd && (
        <path
          className="circuit-wire circuit-wire--pending"
          d={wireLinePath(pendingStart, pendingLineEnd)}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
