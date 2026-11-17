import { useMemo, useState } from "react";
import { XP_BY_DIFFICULTY, type Chapter } from "../../../../../content/circuits/chapters/types";
import { useChapterProgress } from "../hooks/useChapterProgress";
import { parseCircuitMetadata } from "../parseMetadata";
import type { TemplateProps } from "../../types";
import MiniLessonPlayer from "./MiniLessonPlayer";

interface CircuitChapterProps extends TemplateProps {
  chapter: Chapter;
}

type LessonStatus = "done" | "next" | "locked";

/**
 * Harta unui capitol: mini-lecțiile în ordine, cu XP. Cele terminate se pot redeschide oricând;
 * următoarea e deschisă; restul așteaptă.
 */
export default function CircuitChapter({ chapter, lesson, userId }: CircuitChapterProps) {
  // Valorile electrice vin din lecție (dacă le are), altfel cele implicite.
  const { metadata } = useMemo(() => parseCircuitMetadata(lesson.metadata), [lesson.metadata]);
  const { done, markDone } = useChapterProgress(lesson.id, userId);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const statuses: LessonStatus[] = useMemo(() => {
    let nextGiven = false;
    return chapter.lessons.map((l) => {
      if (done.has(l.id)) return "done";
      if (!nextGiven) {
        nextGiven = true;
        return "next";
      }
      return "locked";
    });
  }, [chapter.lessons, done]);

  const totalXp = chapter.lessons.reduce((s, l) => s + XP_BY_DIFFICULTY[l.difficulty], 0);
  const earnedXp = chapter.lessons.reduce((s, l) => s + (done.has(l.id) ? XP_BY_DIFFICULTY[l.difficulty] : 0), 0);
  const nextIndex = statuses.indexOf("next");

  const open = openIndex !== null ? chapter.lessons[openIndex] : null;

  return (
    <div className="template-circuit circuit-chapter">
      <header className="circuit-chapter-head">
        <div>
          <h2 className="circuit-chapter-title">{chapter.title}</h2>
          <p className="circuit-chapter-intro">{chapter.intro}</p>
        </div>
        <div className="circuit-chapter-xp" aria-label={`${earnedXp} din ${totalXp} XP`}>
          <span>
            <span className="circuit-chapter-xp-num">{earnedXp}</span> / {totalXp} XP
          </span>
          <span className="circuit-chapter-xp-bar" aria-hidden="true">
            <span style={{ width: `${(earnedXp / totalXp) * 100}%` }} />
          </span>
        </div>
      </header>

      <ol className="circuit-chapter-list">
        {chapter.lessons.map((l, i) => {
          const status = statuses[i];
          return (
            <li key={l.id}>
              <button
                type="button"
                className={`circuit-chapter-item circuit-chapter-item--${status}`}
                disabled={status === "locked"}
                onClick={() => setOpenIndex(i)}
                aria-label={`${i + 1}. ${l.title}, ${XP_BY_DIFFICULTY[l.difficulty]} XP, ${
                  status === "done" ? "terminată" : status === "next" ? "următoarea" : "blocată"
                }`}
              >
                <span className="circuit-chapter-item-dot" aria-hidden="true">
                  {status === "done" ? "✓" : status === "locked" ? "🔒" : i + 1}
                </span>
                <span className="circuit-chapter-item-text">
                  <span className="circuit-chapter-item-title">{l.title}</span>
                  <span className="circuit-chapter-item-meta">
                    {"●".repeat(l.difficulty)}
                    {"○".repeat(3 - l.difficulty)} · {l.steps.length} pași
                  </span>
                </span>
                <span className="circuit-chapter-item-xp">{XP_BY_DIFFICULTY[l.difficulty]} XP</span>
                {status === "next" && <span className="circuit-chapter-item-go">Începe →</span>}
                {status === "done" && <span className="circuit-chapter-item-again">Reia</span>}
              </button>
            </li>
          );
        })}
      </ol>

      {nextIndex === -1 && (
        <p className="circuit-chapter-done">
          🎉 Ai terminat capitolul! Piesele lui te așteaptă în atelier (vine curând). Poți relua oricând orice mini-lecție.
        </p>
      )}

      {!userId && (
        <p className="circuit-chapter-guest">
          Progresul se păstrează doar pe acest dispozitiv. Fă-ți cont ca să nu-l pierzi.
        </p>
      )}

      {open && openIndex !== null && (
        <MiniLessonPlayer
          key={open.id}
          lesson={open}
          number={openIndex + 1}
          metadata={metadata}
          alreadyDone={done.has(open.id)}
          onFinish={() => markDone(open.id)}
          onExit={() => setOpenIndex(null)}
          onNext={
            openIndex + 1 < chapter.lessons.length
              ? () => setOpenIndex(openIndex + 1)
              : undefined
          }
        />
      )}
    </div>
  );
}
