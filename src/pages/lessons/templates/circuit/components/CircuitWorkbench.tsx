import type { WorkbenchHint } from "../types";

interface CircuitWorkbenchProps {
  hints: WorkbenchHint[];
}

export default function CircuitWorkbench({ hints }: CircuitWorkbenchProps) {
  return (
    <div className="circuit-workbench" aria-label="Masa de lucru">
      <div className="circuit-workbench-surface">
        {hints.map((hint) => (
          <span
            key={hint.id}
            className={`circuit-workbench-hint circuit-workbench-hint--${hint.type}`}
            style={{
              left: `${hint.position.x * 100}%`,
              top: `${hint.position.y * 100}%`,
            }}
          >
            {hint.text}
          </span>
        ))}
        <p className="circuit-workbench-empty">Masa e goală — trage componente aici (Sprint B)</p>
      </div>
    </div>
  );
}
