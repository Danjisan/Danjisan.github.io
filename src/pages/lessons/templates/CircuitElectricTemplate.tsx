import type { TemplateProps } from "./types";

export default function CircuitElectricTemplate({ lesson }: TemplateProps) {
  return (
    <div className="template-shell">
      <p className="template-description">{lesson.description}</p>
      <div className="template-placeholder">
        <div className="template-placeholder-icon">⚡</div>
        <p className="template-placeholder-label">Circuit Electric Interactiv</p>
        <p className="template-placeholder-hint">
          Experiența de asamblare circuit este în dezvoltare.<br />
          Va include: baterie, LED, rezistor, întrerupător, motor DC, potențiometru.
        </p>
      </div>
    </div>
  );
}
