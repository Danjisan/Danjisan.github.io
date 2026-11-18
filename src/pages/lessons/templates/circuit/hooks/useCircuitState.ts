import { useCallback, useState } from "react";
import { defaultNodeState } from "../logic/nodeDefaults";
import { nextRotation } from "../logic/terminalPositions";
import type { PartDef } from "../../../../../content/circuits/parts";
import type { CircuitEdge, CircuitNode, CircuitTerminalRef } from "../types";

function newId(): string {
  return crypto.randomUUID();
}

function sameTerminal(a: CircuitTerminalRef, b: CircuitTerminalRef): boolean {
  return a.nodeId === b.nodeId && a.terminal === b.terminal;
}

/** `initial` = masa de la început (ex. un pas dintr-o mini-lecție). Pentru o masă nouă, remontează cu alt `key`. */
export function useCircuitState(initial?: { nodes: CircuitNode[]; edges: CircuitEdge[] }) {
  const [nodes, setNodes] = useState<CircuitNode[]>(() => initial?.nodes ?? []);
  const [edges, setEdges] = useState<CircuitEdge[]>(() => initial?.edges ?? []);

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

  /**
   * Pe un terminal se pot lega oricâte fire (ca în realitate): așa se fac ramificațiile fără piese extra.
   * Nu legăm o piesă cu ea însăși și nu dublăm un fir care există deja.
   */
  const addEdge = useCallback((from: CircuitTerminalRef, to: CircuitTerminalRef) => {
    if (from.nodeId === to.nodeId) return;
    setEdges((prev) => {
      const duplicate = prev.some(
        (e) =>
          (sameTerminal(e.from, from) && sameTerminal(e.to, to)) ||
          (sameTerminal(e.from, to) && sameTerminal(e.to, from)),
      );
      return duplicate ? prev : [...prev, { id: newId(), from, to }];
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

  /** Rotește piesa cu 90° (în sensul acelor de ceasornic). */
  const toggleNodeFlip = useCallback((nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId ? { ...n, state: { ...n.state, rotation: nextRotation(n), flipped: false } } : n,
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
