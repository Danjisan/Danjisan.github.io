import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { electronFlowStyle } from "../logic/electronFlow";
import { pointOnWire, wireCurve, wireLinePath, wirePathD, type Direction } from "../logic/wireGeometry";
import { sideDirection, terminalPixelPosition, terminalPlacement } from "../logic/terminalPositions";
import {
  clientToViewportLocal,
  measureTerminalNorms,
  normToViewportPixel,
  type TerminalNorm,
} from "../logic/wireViewportCoords";
import type { CircuitEdge, CircuitNode, CircuitTerminalRef } from "../types";

interface WireLayerProps {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  /** edge.id → curent (A), sens convențional from → to */
  wireCurrents?: Map<string, number>;
  /** Un LED primește prea mult curent sau e scurtcircuit: electronii se colorează portocaliu */
  danger?: boolean;
  /** Firele se pot selecta și șterge doar în editor */
  editable?: boolean;
  selectedEdgeId?: string | null;
  /** Fire evidențiate (ex. pasul curent din ajutor) */
  highlightEdgeIds?: Set<string>;
  onSelectEdge?: (edgeId: string) => void;
  onRemoveEdge?: (edgeId: string) => void;
  pendingTerminal: CircuitTerminalRef | null;
  pointer: { x: number; y: number } | null;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}


/**
 * Fire în coordonate layout pe viewport.
 * Centrele terminalelor vin din DOM (normalizate), măsurate la schimbare layout — nu la zoom.
 */
export default function WireLayer({
  nodes,
  edges,
  wireCurrents,
  danger = false,
  editable = false,
  selectedEdgeId = null,
  highlightEdgeIds,
  onSelectEdge,
  onRemoveEdge,
  pendingTerminal,
  pointer,
  viewportRef,
}: WireLayerProps) {
  const viewportEl = viewportRef.current;
  // Dimensiunea mesei, urmărită cu ResizeObserver. Stratul de fire e copilul mesei, iar React leagă
  // ref-ul mesei abia după efectele de layout ale copiilor — de aceea `useEffect`, nu `useLayoutEffect`.
  // Fără asta, la prima afișare firele pot lipsi până la următoarea schimbare.
  const [size, setSize] = useState({ width: 1, height: 1 });
  const { width, height } = size;
  const ready = width > 1 && height > 1;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () =>
      setSize((prev) =>
        prev.width === el.clientWidth && prev.height === el.clientHeight
          ? prev
          : { width: el.clientWidth, height: el.clientHeight },
      );
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [viewportRef]);

  const layoutKey = useMemo(
    () =>
      nodes
        .map(
          (n) =>
            `${n.id}:${n.position.x.toFixed(5)}:${n.position.y.toFixed(5)}:${String(n.state.rotation ?? "")}:${n.state.flipped ? 1 : 0}:${String(n.state.layout ?? "")}`,
        )
        .join("|"),
    [nodes],
  );

  const [terminalNorms, setTerminalNorms] = useState<Map<string, TerminalNorm>>(() => new Map());

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || el.clientWidth <= 1) return;
    setTerminalNorms(measureTerminalNorms(el));
  }, [layoutKey, width, height, viewportRef]);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const resolveTerminal = (ref: CircuitTerminalRef) => {
    const key = `${ref.nodeId}:${ref.terminal}`;
    const norm = terminalNorms.get(key);
    if (norm && viewportEl) return normToViewportPixel(norm, viewportEl);

    const node = nodeMap.get(ref.nodeId);
    if (!node) return null;
    return terminalPixelPosition(node, ref.terminal, width, height);
  };

  /** Spre ce parte iese firul din bornă (latura piesei, după rotire și aranjament). */
  const directionOf = (ref: CircuitTerminalRef): Direction => {
    const node = nodeMap.get(ref.nodeId);
    const placement = node ? terminalPlacement(node, ref.terminal) : undefined;
    return placement ? sideDirection(placement.side) : { x: 0, y: 0 };
  };

  let pendingLineEnd: { x: number; y: number } | null = null;
  if (pendingTerminal && pointer && viewportRef.current) {
    pendingLineEnd = clientToViewportLocal(pointer.x, pointer.y, viewportRef.current);
  }

  const pendingStart = pendingTerminal ? resolveTerminal(pendingTerminal) : null;

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
        const curve = wireCurve(from, directionOf(edge.from), to, directionOf(edge.to));
        const d = wirePathD(curve);
        const flow = electronFlowStyle(wireCurrents?.get(edge.id) ?? 0, danger);
        const selected = editable && selectedEdgeId === edge.id;
        const highlighted = highlightEdgeIds?.has(edge.id) ?? false;
        const mid = pointOnWire(curve, 0.5);
        return (
          <g key={edge.id}>
            <path
              className={`circuit-wire${selected ? " circuit-wire--selected" : ""}${highlighted ? " circuit-wire--highlight" : ""}`}
              d={d}
              vectorEffect="non-scaling-stroke"
            />
            {flow && (
              <path
                className={`circuit-wire-electrons${flow.hot ? " circuit-wire-electrons--hot" : ""}`}
                d={d}
                vectorEffect="non-scaling-stroke"
                style={flow.style}
              />
            )}
            {editable && onSelectEdge && (
              <path
                className="circuit-wire-hit"
                d={d}
                vectorEffect="non-scaling-stroke"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onSelectEdge(edge.id);
                }}
              />
            )}
            {selected && onRemoveEdge && (
              <g
                className="circuit-wire-remove"
                transform={`translate(${mid.x} ${mid.y})`}
                role="button"
                aria-label="Șterge firul"
                onPointerDown={(e) => {
                  e.stopPropagation();
                  onRemoveEdge(edge.id);
                }}
              >
                <circle r="12" />
                <path d="M-4.5 -4.5 L4.5 4.5 M4.5 -4.5 L-4.5 4.5" />
              </g>
            )}
          </g>
        );
      })}

      {pendingStart && pendingLineEnd && (
        <path
          className="circuit-wire circuit-wire--pending"
          d={
            pendingTerminal
              ? wirePathD(wireCurve(pendingStart, directionOf(pendingTerminal), pendingLineEnd, { x: 0, y: 0 }))
              : wireLinePath(pendingStart, pendingLineEnd)
          }
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
