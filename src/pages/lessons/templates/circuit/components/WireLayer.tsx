import { useLayoutEffect, useMemo, useState } from "react";
import { electronFlowStyle } from "../logic/electronFlow";
import { wireLinePath } from "../logic/wireGeometry";
import { getTerminalDefs, getTerminalPixelPosition } from "../logic/terminalPositions";
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

function readRemPx(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
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
  const width = viewportEl?.clientWidth ?? 1;
  const height = viewportEl?.clientHeight ?? 1;
  const remPx = readRemPx();
  const ready = width > 1 && height > 1;

  const layoutKey = useMemo(
    () =>
      nodes
        .map(
          (n) =>
            `${n.id}:${n.position.x.toFixed(5)}:${n.position.y.toFixed(5)}:${n.state.flipped ? 1 : 0}`,
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
    const def = getTerminalDefs(node).find((t) => t.id === ref.terminal);
    if (!def) return null;
    return getTerminalPixelPosition(node, def, width, height, remPx);
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
        const d = wireLinePath(from, to);
        const flow = electronFlowStyle(wireCurrents?.get(edge.id) ?? 0, danger);
        const selected = editable && selectedEdgeId === edge.id;
        const highlighted = highlightEdgeIds?.has(edge.id) ?? false;
        const mid = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
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
          d={wireLinePath(pendingStart, pendingLineEnd)}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
