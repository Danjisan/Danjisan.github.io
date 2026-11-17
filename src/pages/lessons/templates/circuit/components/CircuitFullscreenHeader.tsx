import type { CircuitChallenge } from "../types";

interface CircuitFullscreenHeaderProps {
  challenge: CircuitChallenge;
  solved: boolean;
  feedbackHints: string[];
  onHelp?: () => void;
}

export default function CircuitFullscreenHeader({
  challenge,
  solved,
  feedbackHints,
  onHelp,
}: CircuitFullscreenHeaderProps) {
  const hint = !solved ? (feedbackHints[0] ?? challenge.hint) : null;

  return (
    <header className="circuit-fs-header">
      <div className="circuit-fs-header-row">
        <span className="circuit-fs-header-badge">Provocare {challenge.order}</span>
        <h3 className="circuit-fs-header-title">{challenge.title}</h3>
        {solved && <span className="circuit-fs-header-success">✓ Rezolvată</span>}
        {onHelp && (
          <button type="button" className="circuit-help-btn circuit-help-btn--compact" onClick={onHelp}>
            <span aria-hidden="true">🧩</span> Arată-mi cum
          </button>
        )}
      </div>
      {hint && <p className="circuit-fs-header-hint">💡 {hint}</p>}
    </header>
  );
}
