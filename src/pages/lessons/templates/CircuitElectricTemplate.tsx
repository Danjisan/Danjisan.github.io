import type { TemplateProps } from "./types";
import CircuitChapter from "./circuit/components/CircuitChapter";
import { CIRCUIT_CHAPTERS } from "../../../content/circuits/chapters";

/**
 * Template `circuit_electric`: `metadata.chapter` arată spre un capitol din repo
 * (`src/content/circuits/chapters/`), iar CircuitChapter îi afișează mini-lecțiile.
 */
export default function CircuitElectricTemplate(props: TemplateProps) {
  const chapterId = typeof props.lesson.metadata.chapter === "string" ? props.lesson.metadata.chapter : null;
  const chapter = chapterId ? CIRCUIT_CHAPTERS[chapterId] : undefined;
  if (chapter) return <CircuitChapter chapter={chapter} {...props} />;
  return (
    <div className="template-circuit">
      <p className="template-description">{props.lesson.description}</p>
      <p className="circuit-schema-notice">Lecția asta nu are încă un capitol de circuite.</p>
    </div>
  );
}
