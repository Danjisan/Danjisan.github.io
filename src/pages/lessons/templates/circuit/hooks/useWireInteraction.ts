import { useCallback, useEffect, useRef, useState } from "react";
import type { CircuitEdge, CircuitTerminalRef, TerminalId } from "../types";

interface PointerPoint {
  x: number;
  y: number;
}

function sameTerminal(a: CircuitTerminalRef, b: CircuitTerminalRef): boolean {
  return a.nodeId === b.nodeId && a.terminal === b.terminal;
}

interface UseWireInteractionOptions {
  onConnect: (from: CircuitTerminalRef, to: CircuitTerminalRef) => void;
  onDisconnect: (edgeId: string) => void;
  getEdgeAtTerminal: (ref: CircuitTerminalRef) => CircuitEdge | undefined;
}

export function useWireInteraction({
  onConnect,
  onDisconnect,
  getEdgeAtTerminal,
}: UseWireInteractionOptions) {
  const [pendingTerminal, setPendingTerminal] = useState<CircuitTerminalRef | null>(null);
  const [wirePointer, setWirePointer] = useState<PointerPoint | null>(null);
  const activePointerId = useRef<number | null>(null);
  const pendingRef = useRef<CircuitTerminalRef | null>(null);
  const isDraggingRef = useRef(false);

  pendingRef.current = pendingTerminal;

  const clearWire = useCallback(() => {
    setPendingTerminal(null);
    setWirePointer(null);
    activePointerId.current = null;
    isDraggingRef.current = false;
  }, []);

  const connect = useCallback(
    (from: CircuitTerminalRef, to: CircuitTerminalRef) => {
      if (sameTerminal(from, to)) return;
      onConnect(from, to);
      clearWire();
    },
    [clearWire, onConnect],
  );

  const handleTerminalPointerDown = useCallback(
    (e: React.PointerEvent, nodeId: string, terminal: TerminalId) => {
      e.preventDefault();
      e.stopPropagation();

      const ref: CircuitTerminalRef = { nodeId, terminal };
      activePointerId.current = e.pointerId;
      isDraggingRef.current = false;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);

      const current = pendingRef.current;

      if (current) {
        if (sameTerminal(current, ref)) {
          clearWire();
          return;
        }
        connect(current, ref);
        return;
      }

      // Niciun pending activ — verifică dacă terminalul are deja un fir
      const existingEdge = getEdgeAtTerminal(ref);
      if (existingEdge) {
        // Deconectează: ia firul existent și pornește un nou fir din celălalt capăt
        const otherEnd = sameTerminal(existingEdge.from, ref)
          ? existingEdge.to
          : existingEdge.from;
        onDisconnect(existingEdge.id);
        setPendingTerminal(otherEnd);
        setWirePointer({ x: e.clientX, y: e.clientY });
      } else {
        // Terminal liber — pornește fir nou
        setPendingTerminal(ref);
        setWirePointer({ x: e.clientX, y: e.clientY });
      }
    },
    [clearWire, connect, getEdgeAtTerminal, onDisconnect],
  );

  const handleTerminalPointerUp = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
  }, []);

  const handleWirePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pendingRef.current) return;
    if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
    isDraggingRef.current = true;
    setWirePointer({ x: e.clientX, y: e.clientY });
  }, []);

  const handleSurfacePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.target !== e.currentTarget) return;
      clearWire();
    },
    [clearWire],
  );

  useEffect(() => {
    if (!pendingTerminal) return;

    const onPointerMove = (e: PointerEvent) => {
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;
      isDraggingRef.current = true;
      setWirePointer({ x: e.clientX, y: e.clientY });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return;

      const from = pendingRef.current;
      if (!from) { activePointerId.current = null; return; }

      const target = document.elementFromPoint(e.clientX, e.clientY);
      const terminalEl = target?.closest<HTMLElement>("[data-circuit-terminal]");

      if (terminalEl) {
        const toNodeId = terminalEl.dataset.nodeId;
        const toTerminal = terminalEl.dataset.terminal as TerminalId | undefined;
        if (toNodeId && toTerminal) {
          const to: CircuitTerminalRef = { nodeId: toNodeId, terminal: toTerminal };
          if (!sameTerminal(from, to)) {
            connect(from, to);
            return;
          }
        }
      }

      // Release în afara unui terminal — dacă nu am tras (e tap simplu), lasă pending
      if (!isDraggingRef.current) {
        activePointerId.current = null;
        return;
      }

      // Am tras dar am terminat pe masă goală — anulează
      clearWire();
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [clearWire, connect, pendingTerminal]);

  return {
    pendingTerminal,
    wirePointer,
    handleTerminalPointerDown,
    handleTerminalPointerUp,
    handleWirePointerMove,
    handleSurfacePointerDown,
    cancelWire: clearWire,
  };
}
