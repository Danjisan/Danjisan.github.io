import { useCallback, useMemo, useState } from "react";
import { defaultNodeState } from "../logic/nodeDefaults";
import type { CircuitEdge, CircuitNode, CircuitTerminalRef, ComponentType } from "../types";

function newId(): string {
  return crypto.randomUUID();
}

function sameTerminal(a: CircuitTerminalRef, b: CircuitTerminalRef): boolean {
  return a.nodeId === b.nodeId && a.terminal === b.terminal;
}

export function useCircuitState() {
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [edges, setEdges] = useState<CircuitEdge[]>([]);

  const placedTypes = useMemo(() => new Set(nodes.map((n) => n.type)), [nodes]);

  const placeNode = useCallback((type: ComponentType, position: { x: number; y: number }) => {
    setNodes((prev) => {
      if (prev.some((n) => n.type === type)) return prev;
      return [...prev, { id: newId(), type, position, state: defaultNodeState(type) }];
    });
  }, []);

  const moveNode = useCallback((id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, position } : n)));
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setEdges((prev) => prev.filter((e) => e.from.nodeId !== id && e.to.nodeId !== id));
  }, []);

  const clearBoard = useCallback(() => {
    setNodes([]);
    setEdges([]);
  }, []);

  const edgeAtTerminal = useCallback(
    (ref: CircuitTerminalRef): CircuitEdge | undefined => {
      return edges.find((e) => sameTerminal(e.from, ref) || sameTerminal(e.to, ref));
    },
    [edges],
  );

  const removeEdge = useCallback((edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
  }, []);

  /** Opțiunea C: un fir per terminal; înlocuiește firele existente dacă e nevoie */
  const addEdge = useCallback((from: CircuitTerminalRef, to: CircuitTerminalRef) => {
    if (from.nodeId === to.nodeId && from.terminal === to.terminal) return;
    if (from.nodeId === to.nodeId) return;
    setEdges((prev) => {
      const withoutFrom = prev.filter(
        (e) => !sameTerminal(e.from, from) && !sameTerminal(e.to, from),
      );
      const withoutBoth = withoutFrom.filter(
        (e) => !sameTerminal(e.from, to) && !sameTerminal(e.to, to),
      );
      return [...withoutBoth, { id: newId(), from, to }];
    });
  }, []);

  const toggleSwitch = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId && n.type === "switch"
          ? { ...n, state: { ...n.state, on: !n.state.on } }
          : n,
      ),
    );
  }, []);

  const setPotentiometerValue = useCallback((nodeId: string, value: number) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId && n.type === "potentiometer"
          ? { ...n, state: { ...n.state, value } }
          : n,
      ),
    );
  }, []);

  const toggleNodeFlip = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, state: { ...n.state, flipped: !n.state.flipped } } : n,
      ),
    );
  }, []);

  return {
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
    toggleNodeFlip,
  };
}
