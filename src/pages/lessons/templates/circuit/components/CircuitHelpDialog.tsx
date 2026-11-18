import { useEffect, useMemo, useRef, useState } from "react";
import type { CircuitSolution } from "../../../../../content/circuits/solutions";
import { buildHelpSteps, solutionPartNames } from "../logic/solutionSteps";
import { simulateCircuit } from "../logic/simulateCircuit";
import type { CircuitElectricMetadata } from "../types";
import CircuitWorkbench from "./CircuitWorkbench";

interface CircuitHelpDialogProps {
  title: string;
  solution: CircuitSolution;
  metadata: Pick<CircuitElectricMetadata, "models" | "simulation">;
  onClose: () => void;
}

/** Pe ecrane înguste piesele (de mărime fixă) se înghesuie: micșorăm tot desenul. */
function helpViewport() {
  const narrow = typeof window !== "undefined" && window.innerWidth < 560;
  return { zoom: narrow ? 0.8 : 1, panX: 0, panY: 0 };
}
const NO_HINTS: never[] = [];
const noop = () => {};

/**
 * „Arată-mi cum”: schema montată, pas cu pas — întâi piesele, apoi câte un fir, la final întrerupătorul.
 * Masa e doar de privit; circuitul se simulează, deci la ultimul pas se văd LED-ul și electronii.
 */
export default function CircuitHelpDialog({ title, solution, metadata, onClose }: CircuitHelpDialogProps) {
  const steps = useMemo(() => buildHelpSteps(solution, metadata.models), [solution, metadata.models]);
  const badges = useMemo(() => solutionPartNames(solution, metadata.models).badges, [solution, metadata.models]);
  const [index, setIndex] = useState(0);
  const [viewport] = useState(helpViewport);
  const step = steps[index];
  const surfaceRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const sim = useMemo(
    () => simulateCircuit(step.nodes, step.edges, metadata),
    [step.nodes, step.edges, metadata],
  );
  const occupied = useMemo(() => {
    const set = new Set<string>();
    for (const e of step.edges) {
      set.add(`${e.from.nodeId}:${e.from.terminal}`);
      set.add(`${e.to.nodeId}:${e.to.terminal}`);
    }
    return set;
  }, [step.edges]);
  const highlight = useMemo(
    () => new Set(step.newEdgeId ? [step.newEdgeId] : []),
    [step.newEdgeId],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(steps.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, steps.length]);

  const last = index === steps.length - 1;

  return (
    <div className="circuit-help-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="circuit-help" role="dialog" aria-modal="true" aria-labelledby="circuit-help-title">
        <header className="circuit-help-head">
          <h3 id="circuit-help-title">Cum se montează: {title}</h3>
          <button ref={closeRef} type="button" className="circuit-help-close" aria-label="Închide ajutorul" onClick={onClose}>
            ×
          </button>
        </header>

        <p className="circuit-help-step" aria-live="polite">
          <span className="circuit-help-step-count">
            Pasul {index + 1} din {steps.length}
          </span>
          {step.text}
        </p>

        <div className="circuit-help-board">
          <CircuitWorkbench
            surfaceRef={surfaceRef}
            viewportRef={viewportRef}
            viewport={viewport}
            hints={NO_HINTS}
            nodes={step.nodes}
            edges={step.edges}
            models={metadata.models}
            editable={false}
            selectedNodeId={null}
            infoBubbleNodeId={null}
            draggingNodeId={null}
            placementPreview={null}
            pendingTerminal={null}
            occupiedTerminals={occupied}
            wirePointer={null}
            ledOnIds={sim.ledOn}
            reversedLedIds={sim.reversedLedIds}
            burnedLedIds={sim.burnedLedIds}
            motorRunningIds={sim.motorRunning}
            electricalReadings={sim.readings}
            wireCurrents={sim.wireCurrents}
            highlightEdgeIds={highlight}
            nodeBadges={badges}
            onSwitchToggle={noop}
            scene={solution.scene}
          />
        </div>

        <footer className="circuit-help-nav">
          <button type="button" className="circuit-help-back" disabled={index === 0} onClick={() => setIndex(index - 1)}>
            ← Înapoi
          </button>
          {!last && (
            <button type="button" className="circuit-help-all" onClick={() => setIndex(steps.length - 1)}>
              Arată tot
            </button>
          )}
          {last ? (
            <button type="button" className="circuit-challenge-advance-btn" onClick={onClose}>
              Am înțeles, încerc eu
            </button>
          ) : (
            <button type="button" className="circuit-challenge-advance-btn" onClick={() => setIndex(index + 1)}>
              Pasul următor →
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
