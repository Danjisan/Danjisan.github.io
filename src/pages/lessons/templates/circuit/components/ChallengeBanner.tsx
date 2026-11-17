import { useEffect, useRef } from "react";
import type { CircuitChallenge } from "../types";
import type { ChallengeStatus } from "../logic/challengeProgress";

interface ChallengeBannerProps {
  challenges: CircuitChallenge[];
  statuses: ChallengeStatus[];
  activeIndex: number;
  schemaComplete: boolean;
  /** Circuitul de pe masă rezolvă acum provocarea activă */
  solved: boolean;
  feedbackHints?: string[];
  /** Index-ul următoarei provocări nerezolvate (alta decât cea activă), dacă există */
  nextUnsolvedIndex: number | null;
  onSelect: (index: number) => void;
}

const STATUS_LABEL: Record<ChallengeStatus, string> = {
  solved: "rezolvată",
  open: "de rezolvat",
  locked: "blocată",
};

export default function ChallengeBanner({
  challenges,
  statuses,
  activeIndex,
  schemaComplete,
  solved,
  feedbackHints = [],
  nextUnsolvedIndex,
  onSelect,
}: ChallengeBannerProps) {
  const listRef = useRef<HTMLOListElement>(null);

  // Pe telefon lista derulează orizontal: ținem provocarea activă la vedere.
  useEffect(() => {
    // Doar derulare orizontală în listă (scrollIntoView ar putea muta și pagina).
    const list = listRef.current;
    const el = list?.children[activeIndex] as HTMLElement | undefined;
    if (!list || !el) return;
    const left = el.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft) list.scrollLeft = left;
    else if (left + el.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = left + el.offsetWidth - list.clientWidth;
    }
  }, [activeIndex]);

  const active = challenges[activeIndex];
  const solvedCount = statuses.filter((s) => s === "solved").length;
  const allDone = solvedCount === challenges.length;
  const activeWasSolved = statuses[activeIndex] === "solved";
  const nextUnsolved = nextUnsolvedIndex !== null ? challenges[nextUnsolvedIndex] : null;

  return (
    <div className="circuit-challenge-banner">
      <nav className="circuit-challenge-steps" aria-label="Provocări">
        <div className="circuit-challenge-steps-head">
          <span>Provocări</span>
          <span className="circuit-challenge-steps-count">
            {solvedCount} / {challenges.length} rezolvate
          </span>
        </div>
        <ol ref={listRef} className="circuit-challenge-steps-list">
          {challenges.map((c, i) => {
            const status = statuses[i];
            const isActive = i === activeIndex;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  className={`circuit-challenge-step circuit-challenge-step--${status} ${isActive ? "active" : ""}`}
                  disabled={status === "locked"}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Provocarea ${i + 1}: ${c.title} (${STATUS_LABEL[status]})`}
                  title={status === "locked" ? "Rezolvă provocările dinainte ca s-o deblochezi" : c.title}
                  onClick={() => onSelect(i)}
                >
                  <span className="circuit-challenge-step-dot" aria-hidden="true">
                    {status === "solved" ? "✓" : status === "locked" ? "🔒" : i + 1}
                  </span>
                  <span className="circuit-challenge-step-title">{c.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={`circuit-challenge-active ${solved || activeWasSolved ? "solved" : ""}`}>
        <span className="circuit-challenge-badge">
          Provocare {activeIndex + 1}
          {activeWasSolved && !solved ? " · deja rezolvată" : ""}
        </span>
        <h3 className="circuit-challenge-title">{active.title}</h3>
        <p className="circuit-challenge-desc">{active.description}</p>
        {active.hint && !solved && <p className="circuit-challenge-hint">💡 {active.hint}</p>}
        {!solved &&
          feedbackHints.map((hint) => (
            <p key={hint} className="circuit-challenge-feedback">
              ⚠️ {hint}
            </p>
          ))}
        {solved && (
          <p className="circuit-challenge-success">✓ Provocare rezolvată — circuit funcțional!</p>
        )}
        {(solved || activeWasSolved) && nextUnsolved && nextUnsolvedIndex !== null && (
          <button
            type="button"
            className="circuit-challenge-advance-btn"
            onClick={() => onSelect(nextUnsolvedIndex)}
          >
            {activeWasSolved && !solved ? "Mergi la următoarea nerezolvată" : "Continuă"}:{" "}
            {nextUnsolved.title}
          </button>
        )}
        {solved && allDone && (
          <p className="circuit-challenge-hint">
            🎉 Ai rezolvat toate provocările din lecție. Le poți relua oricând din lista de mai sus.
          </p>
        )}
      </div>

      {!schemaComplete && (
        <p className="circuit-schema-notice">
          Metadata incompletă în baza de date — rulează migrarea{" "}
          <code>20260625_circuit_electric_metadata.sql</code> în Supabase SQL Editor.
        </p>
      )}
    </div>
  );
}
