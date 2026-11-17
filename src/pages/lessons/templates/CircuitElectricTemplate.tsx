import { useCallback, useEffect, useMemo, useState } from "react";
import type { TemplateProps } from "./types";
import { parseCircuitMetadata } from "./circuit/parseMetadata";
import ChallengeBanner from "./circuit/components/ChallengeBanner";
import CircuitChapter from "./circuit/components/CircuitChapter";
import CircuitEditor, { type CircuitEditorState } from "./circuit/components/CircuitEditor";
import CircuitHelpDialog from "./circuit/components/CircuitHelpDialog";
import { CIRCUIT_SOLUTIONS } from "../../../content/circuits/solutions";
import { CIRCUIT_CHAPTERS } from "../../../content/circuits/chapters";
import CircuitEditorFrame from "./circuit/components/CircuitEditorFrame";
import CircuitEditorToolbar from "./circuit/components/CircuitEditorToolbar";
import CircuitFullscreenHeader from "./circuit/components/CircuitFullscreenHeader";
import { useChallengeProgress } from "./circuit/hooks/useChallengeProgress";
import { challengeStatuses, firstUnsolvedIndex, startingIndex } from "./circuit/logic/challengeProgress";
import { isChallengeSolved } from "./circuit/logic/validateCircuit";
import { hintsForEditor } from "./circuit/logic/workbenchHints";
import { buildInventory } from "./circuit/logic/parts";
import { emptyResult } from "./circuit/logic/sim/netlist";

/**
 * Template `circuit_electric`.
 * - Dacă `metadata.chapter` arată spre un capitol din repo → mini-lecții (CircuitChapter).
 * - Altfel → provocările vechi din `metadata.challenges`.
 */
export default function CircuitElectricTemplate(props: TemplateProps) {
  const chapterId = typeof props.lesson.metadata.chapter === "string" ? props.lesson.metadata.chapter : null;
  const chapter = chapterId ? CIRCUIT_CHAPTERS[chapterId] : undefined;
  if (chapter) return <CircuitChapter chapter={chapter} {...props} />;
  return <LegacyChallenges {...props} />;
}

const EMPTY_STATE: CircuitEditorState = { nodes: [], edges: [], sim: emptyResult() };

function LegacyChallenges({ lesson, userId }: TemplateProps) {
  const { metadata, schemaComplete } = useMemo(() => parseCircuitMetadata(lesson.metadata), [lesson.metadata]);
  const editorHints = useMemo(() => hintsForEditor(metadata.workbench_hints), [metadata.workbench_hints]);

  const [helpOpen, setHelpOpen] = useState(false);
  const [activeChallengeIndex, setActiveChallengeIndex] = useState(0);
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  /** Schimbat ca să pornim cu masa goală (altă provocare / „Resetează masa”) */
  const [boardKey, setBoardKey] = useState(0);
  const [board, setBoard] = useState<CircuitEditorState>(EMPTY_STATE);

  const sortedChallenges = useMemo(
    () => [...metadata.challenges].sort((a, b) => a.order - b.order),
    [metadata.challenges],
  );
  const { solvedIds, progressKey, markSolved } = useChallengeProgress(lesson.id, userId);
  const statuses = useMemo(() => challengeStatuses(sortedChallenges, solvedIds), [sortedChallenges, solvedIds]);
  const activeChallenge = sortedChallenges[activeChallengeIndex] ?? null;
  const activeSolution = activeChallenge ? CIRCUIT_SOLUTIONS[activeChallenge.id] ?? null : null;
  const openHelp = activeSolution ? () => setHelpOpen(true) : undefined;

  // La deschidere (și când se încarcă userul) pornim de la prima provocare nerezolvată.
  useEffect(() => {
    setActiveChallengeIndex(startingIndex(sortedChallenges, solvedIds));
    // Intenționat fără `solvedIds`: doar la schimbarea userului / lecției, nu la fiecare rezolvare.
  }, [progressKey, sortedChallenges]);

  const frontierIndex = firstUnsolvedIndex(sortedChallenges, solvedIds);
  const nextUnsolvedIndex = frontierIndex !== -1 && frontierIndex !== activeChallengeIndex ? frontierIndex : null;
  const nextUnsolvedChallenge = nextUnsolvedIndex !== null ? sortedChallenges[nextUnsolvedIndex] : null;

  const challengeSolved = useMemo(
    () => (activeChallenge ? isChallengeSolved(board.nodes, board.edges, activeChallenge, metadata) : false),
    [activeChallenge, board.nodes, board.edges, metadata],
  );

  useEffect(() => {
    if (challengeSolved && activeChallenge) markSolved(activeChallenge.id);
  }, [challengeSolved, activeChallenge, markSolved]);

  // Ce piese primește elevul: din provocare (inventory / required_types) sau, fără provocare, din lecție.
  const inventory = useMemo(
    () => buildInventory(activeChallenge, metadata.components),
    [activeChallenge, metadata.components],
  );

  const goToChallenge = useCallback(
    (index: number) => {
      if (statuses[index] === "locked" || index === activeChallengeIndex) return;
      setActiveChallengeIndex(index);
      setBoard(EMPTY_STATE);
      setBoardKey((k) => k + 1);
    },
    [statuses, activeChallengeIndex],
  );

  const editToolbarButton = (
    <button
      type="button"
      className="circuit-workbench-expand-btn"
      aria-label="Deschide editorul pe tot ecranul"
      onClick={() => setEditorFullscreen(true)}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
        <path
          d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="circuit-workbench-expand-label">Editează circuitul</span>
    </button>
  );

  return (
    <div className="template-circuit">
      <p className="template-description">{lesson.description}</p>

      {!editorFullscreen &&
        (activeChallenge ? (
          <ChallengeBanner
            challenges={sortedChallenges}
            statuses={statuses}
            activeIndex={activeChallengeIndex}
            schemaComplete={schemaComplete}
            solved={challengeSolved}
            feedbackHints={board.sim.hints}
            nextUnsolvedIndex={nextUnsolvedIndex}
            onSelect={goToChallenge}
            onHelp={openHelp}
          />
        ) : (
          <p className="circuit-schema-notice">Nicio provocare definită în metadata lecției.</p>
        ))}

      <CircuitEditorFrame fullscreen={editorFullscreen} onExitFullscreen={() => setEditorFullscreen(false)}>
        {editorFullscreen && activeChallenge && (
          <CircuitFullscreenHeader
            challenge={activeChallenge}
            solved={challengeSolved}
            feedbackHints={board.sim.hints}
            onHelp={openHelp}
          />
        )}

        <CircuitEditor
          key={boardKey}
          metadata={metadata}
          inventory={inventory}
          editing={editorFullscreen}
          hints={editorHints}
          onChange={setBoard}
          renderToolbar={(api) =>
            !editorFullscreen && (
              <CircuitEditorToolbar
                canReset={api.canReset}
                onResetBoard={api.clear}
                viewport={api.viewport}
                onZoomIn={api.zoomIn}
                onZoomOut={api.zoomOut}
                onResetView={api.resetView}
                end={editToolbarButton}
              />
            )
          }
        />

        {editorFullscreen && challengeSolved && nextUnsolvedChallenge && nextUnsolvedIndex !== null && (
          <button type="button" className="circuit-fs-advance-btn" onClick={() => goToChallenge(nextUnsolvedIndex)}>
            Continuă: {nextUnsolvedChallenge.title}
          </button>
        )}
      </CircuitEditorFrame>

      {helpOpen && activeChallenge && activeSolution && (
        <CircuitHelpDialog
          title={activeChallenge.title}
          solution={activeSolution}
          metadata={metadata}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </div>
  );
}
