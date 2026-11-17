import { useCallback, useState } from "react";
import { defaultNodeState } from "../logic/nodeDefaults";
import type { PartDef } from "../../../../../content/circuits/parts";
import type { CircuitEdge, CircuitNode, CircuitTerminalRef } from "../types";

function newId(): string {
  return crypto.randomUUID();
}

function sameTerminal(a: CircuitTerminalRef, b: CircuitTerminalRef): boolean {
  return a.nodeId === b.nodeId && a.terminal === b.terminal;
}

export function useCircuitState() {
  const [nodes, setNodes] = useState<CircuitNode[]>([]);
  const [edges, setEdges] = useState<CircuitEdge[]>([]);

  /** Limita din inventar o verifică apelantul (canPlacePart). */
  const placeNode = useCallback((part: PartDef, position: { x: number; y: number }) => {
    setNodes((prev) => [
      ...prev,
      {
        id: newId(),
        type: part.type,
        position,
        state: { ...defaultNodeState(part.type), partId: part.id },
      },
    ]);
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

  const markLedBurned = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId && n.type === "led" ? { ...n, state: { ...n.state, burned: true } } : n,
      ),
    );
  }, []);

  return {
    nodes,
    edges,
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
    markLedBurned,
  };
}
