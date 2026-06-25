import { useCallback, useMemo, useState } from "react";
import { defaultNodeState } from "../logic/nodeDefaults";
import type { CircuitNode, ComponentType } from "../types";

function newNodeId(): string {
  return crypto.randomUUID();
}

export function useCircuitNodes() {
  const [nodes, setNodes] = useState<CircuitNode[]>([]);

  const placedTypes = useMemo(() => new Set(nodes.map((n) => n.type)), [nodes]);

  const placeNode = useCallback((type: ComponentType, position: { x: number; y: number }) => {
    setNodes((prev) => {
      if (prev.some((n) => n.type === type)) return prev;
      return [
        ...prev,
        { id: newNodeId(), type, position, state: defaultNodeState(type) },
      ];
    });
  }, []);

  const moveNode = useCallback((id: string, position: { x: number; y: number }) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, position } : n)));
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearNodes = useCallback(() => {
    setNodes([]);
  }, []);

  return { nodes, placedTypes, placeNode, moveNode, removeNode, clearNodes };
}
