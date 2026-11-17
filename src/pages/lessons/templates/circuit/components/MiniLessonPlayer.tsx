import { useCallback, useEffect, useMemo, useState } from "react";
import {
  XP_BY_DIFFICULTY,
  type BuildStep,
  type LessonStep,
  type MiniLesson,
  type PredictStep,
  type TryStep,
} from "../../../../../content/circuits/chapters/types";
import { boardToCircuit } from "../logic/board";
import type { InventorySlot } from "../logic/parts";
import { simulateCircuit } from "../logic/simulateCircuit";
import { checkWin } from "../logic/winConditions";
import type { CircuitElectricMetadata } from "../types";
import CircuitEditor, { type CircuitEditorState, type EditorPermissions } from "./CircuitEditor";
import CircuitEditorFrame from "./CircuitEditorFrame";
import CircuitHelpDialog from "./CircuitHelpDialog";

type Meta = Pick<CircuitElectricMetadata, "models" | "simulation">;

interface MiniLessonPlayerProps {
  lesson: MiniLesson;
  number: number;
  metadata: Meta;
  alreadyDone: boolean;
  onFinish: () => void;
  onExit: () => void;
  onNext?: () => void;
}

/** O mini-lecție pe tot ecranul: pașii pe rând, apoi ecranul de final cu XP. */
export default function MiniLessonPlayer({
  lesson,
  number,
  metadata,
  alreadyDone,
  onFinish,
  onExit,
  onNext,
}: MiniLessonPlayerProps) {
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);
  // Starea de la deschidere: după `onFinish` părintele o marchează terminată, dar XP-ul l-am câștigat acum.
  const [doneBefore] = useState(alreadyDone);
  const [finished, setFinished] = useState(false);
  const step = lesson.steps[index];
  const last = index === lesson.steps.length - 1;
  const markCompleted = useCallback(() => setCompleted(true), []);

  const next = () => {
    if (last) {
      onFinish();
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setCompleted(false);
  };

  return (
    <CircuitEditorFrame fullscreen onExitFullscreen={onExit}>
      <div className="circuit-lesson">
        <header className="circuit-lesson-head">
          <span className="circuit-lesson-title">
            {number}. {lesson.title}
          </span>
          <ol className="circuit-lesson-dots" aria-label={`Pasul ${index + 1} din ${lesson.steps.length}`}>
            {lesson.steps.map((s, i) => (
              <li
                key={s.id}
                className={i < index || finished ? "done" : i === index ? "current" : ""}
                aria-hidden="true"
              />
            ))}
          </ol>
        </header>

        {finished ? (
          <LessonEnd lesson={lesson} alreadyDone={doneBefore} onExit={onExit} onNext={onNext} />
        ) : (
          <StepView
            key={step.id}
            step={step}
            metadata={metadata}
            completed={completed}
            onCompleted={markCompleted}
            footer={
              <button
                type="button"
                className="circuit-lesson-next"
                disabled={!completed}
                onClick={next}
              >
                {last ? "Termină" : "Continuă →"}
              </button>
            }
          />
        )}
      </div>
    </CircuitEditorFrame>
  );
}

function LessonEnd({
  lesson,
  alreadyDone,
  onExit,
  onNext,
}: {
  lesson: MiniLesson;
  alreadyDone: boolean;
  onExit: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="circuit-lesson-end">
      <div className="circuit-lesson-end-badge" aria-hidden="true">✓</div>
      <h3>Mini-lecție terminată!</h3>
      <p className="circuit-lesson-end-xp">
        {alreadyDone ? "Ai primit deja XP-ul pentru asta." : `+${XP_BY_DIFFICULTY[lesson.difficulty]} XP`}
      </p>
      <p className="circuit-lesson-end-summary">
        <strong>Ce ai învățat:</strong> {lesson.summary}
      </p>
      <div className="circuit-lesson-end-actions">
        <button type="button" className="circuit-help-back" onClick={onExit}>
          Înapoi la capitol
        </button>
        {onNext && (
          <button type="button" className="circuit-lesson-next" onClick={onNext}>
            Următoarea mini-lecție →
          </button>
        )}
      </div>
    </div>
  );
}

const VIEW_ONLY: Partial<EditorPermissions> = {
  place: false,
  move: false,
  removeNode: false,
  addWire: false,
  removeWire: false,
  toggle: false,
  flip: false,
  pot: false,
};

function tryPermissions(step: TryStep): Partial<EditorPermissions> {
  return {
    ...VIEW_ONLY,
    addWire: step.allow.includes("add_wire"),
    removeWire: step.allow.includes("remove_wire"),
    toggle: step.allow.includes("toggle_switch"),
    flip: step.allow.includes("flip"),
    pot: step.allow.includes("pot"),
  };
}

interface StepViewProps {
  step: LessonStep;
  metadata: Meta;
  completed: boolean;
  onCompleted: () => void;
  footer: React.ReactNode;
}

function StepView({ step, metadata, completed, onCompleted, footer }: StepViewProps) {
  switch (step.kind) {
    case "concept":
      return <ConceptView step={step} metadata={metadata} onCompleted={onCompleted} footer={footer} />;
    case "predict":
      return <PredictView step={step} metadata={metadata} onCompleted={onCompleted} footer={footer} />;
    default:
      return <TaskView step={step} metadata={metadata} completed={completed} onCompleted={onCompleted} footer={footer} />;
  }
}

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split("\n\n").map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  );
}

function ConceptView({
  step,
  metadata,
  onCompleted,
  footer,
}: Omit<StepViewProps, "step" | "completed"> & { step: Extract<LessonStep, { kind: "concept" }> }) {
  // Un concept se citește: „Continuă” e activ imediat.
  useEffect(() => onCompleted(), [onCompleted]);
  const board = useMemo(() => (step.board ? boardToCircuit(step.board) : null), [step.board]);
  return (
    <>
      <section className={`circuit-lesson-text ${board ? "" : "circuit-lesson-text--full"}`}>
        {step.title && <h3>{step.title}</h3>}
        <Paragraphs text={step.text} />
      </section>
      {board && (
        <CircuitEditor metadata={metadata} initial={board} inventory={[]} editing={false} permissions={VIEW_ONLY} />
      )}
      <footer className="circuit-lesson-bar">
        <span />
        {footer}
      </footer>
    </>
  );
}

function PredictView({
  step,
  metadata,
  onCompleted,
  footer,
}: Omit<StepViewProps, "step" | "completed"> & { step: PredictStep }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const revealed = chosen !== null;
  const board = useMemo(() => boardToCircuit(step.board, revealed ? { switchesOn: true } : {}), [step.board, revealed]);
  const correct = chosen !== null && step.options[chosen].correct === true;

  return (
    <>
      <section className="circuit-lesson-text">
        <p className="circuit-lesson-kind">🤔 Ce crezi?</p>
        <h3>{step.question}</h3>
        <div className="circuit-lesson-options" role="group" aria-label="Variante">
          {step.options.map((o, i) => (
            <button
              key={i}
              type="button"
              className={[
                "circuit-lesson-option",
                revealed && o.correct ? "correct" : "",
                revealed && i === chosen && !o.correct ? "wrong" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={revealed}
              aria-pressed={i === chosen}
              onClick={() => {
                setChosen(i);
                onCompleted();
              }}
            >
              {o.text}
            </button>
          ))}
        </div>
        {revealed && (
          <p className={`circuit-lesson-feedback ${correct ? "ok" : "no"}`} role="status">
            {correct ? "Exact! " : "Nu chiar. "}
            {step.explain_after}
          </p>
        )}
        {!revealed && <p className="circuit-lesson-note">Alege o variantă și vezi ce se întâmplă.</p>}
      </section>
      <CircuitEditor
        key={revealed ? "on" : "off"}
        metadata={metadata}
        initial={board}
        inventory={[]}
        editing={false}
        permissions={VIEW_ONLY}
        paused={!revealed}
      />
      <footer className="circuit-lesson-bar">
        <span />
        {footer}
      </footer>
    </>
  );
}

function TaskView({
  step,
  metadata,
  completed,
  onCompleted,
  footer,
}: Omit<StepViewProps, "step"> & { step: TryStep | BuildStep }) {
  const [attempt, setAttempt] = useState(0);
  const [hintsShown, setHintsShown] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  const board = useMemo(() => boardToCircuit(step.board ?? { parts: [], wires: [] }), [step.board]);
  const isTry = step.kind === "try";
  const inventory: InventorySlot[] = useMemo(
    () => (isTry ? [] : (step as BuildStep).inventory.map((s) => ({ partId: s.part, count: s.count }))),
    [isTry, step],
  );
  const permissions = useMemo(
    () => (isTry ? tryPermissions(step as TryStep) : { place: inventory.length > 0 }),
    [isTry, step, inventory.length],
  );

  const handleChange = useCallback(
    ({ nodes, edges, sim }: CircuitEditorState) => {
      if (completed) return;
      const won = checkWin(step.win, {
        nodes,
        sim,
        resimulate: (n) => simulateCircuit(n, edges, metadata),
      });
      if (won) onCompleted();
    },
    [completed, step.win, metadata, onCompleted],
  );

  const hints = isTry ? [] : (step as BuildStep).hints;
  const help = !isTry && (step as BuildStep).help === "show_solution";
  const story = isTry ? undefined : (step as BuildStep).story;
  const kindLabel = step.kind === "try" ? "👆 Încearcă" : step.kind === "fix" ? "🔧 Repară" : "🛠️ Construiește";

  return (
    <>
      <section className="circuit-lesson-text">
        <p className="circuit-lesson-kind">{kindLabel}</p>
        {story && <p className="circuit-lesson-story">{story}</p>}
        <h3>{step.goal}</h3>
        {hints.slice(0, hintsShown).map((h, i) => (
          <p key={i} className="circuit-challenge-hint">
            💡 {h}
          </p>
        ))}
        {completed && (
          <p className="circuit-lesson-feedback ok" role="status">
            ✓ {step.explain_after}
          </p>
        )}
      </section>

      <CircuitEditor
        key={attempt}
        metadata={metadata}
        initial={board}
        inventory={inventory}
        editing
        permissions={permissions}
        lockedNodeIds={board.lockedNodeIds}
        lockedEdgeIds={board.lockedEdgeIds}
        onChange={handleChange}
      />

      <footer className="circuit-lesson-bar">
        <div className="circuit-lesson-tools">
          {!completed && hintsShown < hints.length && (
            <button type="button" className="circuit-help-back" onClick={() => setHintsShown(hintsShown + 1)}>
              💡 Indiciu {hints.length > 1 ? `(${hintsShown + 1}/${hints.length})` : ""}
            </button>
          )}
          {!completed && help && (
            <button type="button" className="circuit-help-btn" onClick={() => setHelpOpen(true)}>
              <span aria-hidden="true">🧩</span> Arată-mi cum
            </button>
          )}
          {!completed && (
            <button type="button" className="circuit-help-all" onClick={() => setAttempt(attempt + 1)}>
              Ia-o de la capăt
            </button>
          )}
        </div>
        {footer}
      </footer>

      {helpOpen && (
        <CircuitHelpDialog
          title={step.goal}
          solution={(step as BuildStep).solution}
          metadata={metadata}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </>
  );
}
