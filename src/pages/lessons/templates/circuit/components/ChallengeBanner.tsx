import type { CircuitChallenge } from "../types";

interface ChallengeBannerProps {
  active: CircuitChallenge;
  locked: CircuitChallenge[];
  schemaComplete: boolean;
}

export default function ChallengeBanner({ active, locked, schemaComplete }: ChallengeBannerProps) {
  return (
    <div className="circuit-challenge-banner">
      <div className="circuit-challenge-active">
        <span className="circuit-challenge-badge">Provocare {active.order}</span>
        <h3 className="circuit-challenge-title">{active.title}</h3>
        <p className="circuit-challenge-desc">{active.description}</p>
        {active.hint && <p className="circuit-challenge-hint">💡 {active.hint}</p>}
      </div>

      {locked.length > 0 && (
        <div className="circuit-challenge-locked">
          {locked.map((c) => (
            <div key={c.id} className="circuit-challenge-locked-item">
              <span className="circuit-challenge-locked-badge">🔒 Provocare {c.order}</span>
              <span className="circuit-challenge-locked-title">{c.title}</span>
            </div>
          ))}
        </div>
      )}

      {!schemaComplete && (
        <p className="circuit-schema-notice">
          Metadata incompletă în baza de date — rulează migrarea{" "}
          <code>20260625_circuit_electric_metadata.sql</code> în Supabase SQL Editor.
        </p>
      )}
    </div>
  );
}
