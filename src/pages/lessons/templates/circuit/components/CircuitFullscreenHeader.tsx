import type { CircuitChallenge } from "../types";

interface CircuitFullscreenHeaderProps {
  challenge: CircuitChallenge;
  solved: boolean;
  feedbackHints: string[];
}

export default function CircuitFullscreenHeader({
  challenge,
  solved,
  feedbackHints,
}: CircuitFullscreenHeaderProps) {
  const hint = !solved ? (feedbackHints[0] ?? challenge.hint) : null;

  return (
    <header className="circuit-fs-header">
      <span className="circuit-fs-header-badge">Provocare {challenge.order}</span>
      <h3 className="circuit-fs-header-title">{challenge.title}</h3>
      {solved && <p className="circuit-fs-header-success">✓ Rezolvată</p>}
      {hint && <p className="circuit-fs-header-hint">💡 {hint}</p>}
    </header>
  );
}
