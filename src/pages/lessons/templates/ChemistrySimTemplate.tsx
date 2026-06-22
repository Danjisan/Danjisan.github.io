import type { TemplateProps } from "./types";

export default function ChemistrySimTemplate({ lesson }: TemplateProps) {
  return (
    <div className="template-shell">
      <p className="template-description">{lesson.description}</p>
      <div className="template-placeholder">
        <div className="template-placeholder-icon">🧪</div>
        <p className="template-placeholder-label">Simulare Chimie</p>
        <p className="template-placeholder-hint">
          Simularea de reacții chimice este în dezvoltare.<br />
          Va include: combinații de soluții comune, modificare parametri, observare reacții.
        </p>
      </div>
    </div>
  );
}
