import { COMPONENT_TERMINALS } from "../constants";
import { wireBezierPath } from "../logic/wireGeometry";
import { getTerminalWorkbenchPosition } from "../logic/terminalPositions";
import type { CircuitEdge, CircuitNode, CircuitTerminalRef } from "../types";

interface WireLayerProps {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
  pendingTerminal: CircuitTerminalRef | null;
  pointer: { x: number; y: number } | null;
  surfaceRef: React.RefObject<HTMLDivElement | null>;
}

export default function WireLayer({
  nodes,
  edges,
  pendingTerminal,
  pointer,
  surfaceRef,
}: WireLayerProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const resolveTerminal = (ref: CircuitTerminalRef) => {
    const node = nodeMap.get(ref.nodeId);
    if (!node) return null;
    const def = COMPONENT_TERMINALS[node.type].find((t) => t.id === ref.terminal);
    if (!def) return null;
    return getTerminalWorkbenchPosition(node, def);
  };

  let pendingLineEnd: { x: number; y: number } | null = null;
  if (pendingTerminal && pointer && surfaceRef.current) {
    const rect = surfaceRef.current.getBoundingClientRect();
    pendingLineEnd = {
      x: (pointer.x - rect.left) / rect.width,
      y: (pointer.y - rect.top) / rect.height,
    };
  }

  const pendingStart = pendingTerminal ? resolveTerminal(pendingTerminal) : null;

  return (
    <svg
      className="circuit-wire-layer"
      viewBox="0 0 100 100"
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
            d={wireBezierPath(from, to)}
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {pendingStart && pendingLineEnd && (
        <path
          className="circuit-wire circuit-wire--pending"
          d={wireBezierPath(pendingStart, pendingLineEnd)}
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
