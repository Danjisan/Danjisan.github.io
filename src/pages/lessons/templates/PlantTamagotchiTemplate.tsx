import type { TemplateProps } from "./types";

export default function PlantTamagotchiTemplate({ lesson }: TemplateProps) {
  return (
    <div className="template-shell">
      <p className="template-description">{lesson.description}</p>
      <div className="template-placeholder">
        <div className="template-placeholder-icon">🌱</div>
        <p className="template-placeholder-label">Grădina Virtuală</p>
        <p className="template-placeholder-hint">
          Experiența tamagotchi cu plante este în dezvoltare.<br />
          Va include: îngrijire, creștere în etape, colecție de specii.
        </p>
      </div>
    </div>
  );
}
