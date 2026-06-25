import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { ComponentModel, ComponentType } from "../types";

interface ComponentInfoPanelProps {
  type: ComponentType | null;
  model: ComponentModel | null;
}

export default function ComponentInfoPanel({ type, model }: ComponentInfoPanelProps) {
  if (!type || !model) {
    return (
      <aside className="circuit-info-panel circuit-info-panel--empty">
        <p>Selectează o componentă din inventar pentru a vedea informațiile ei.</p>
      </aside>
    );
  }

  const { info } = model;
  const hasGlb = Boolean(model.glb);

  return (
    <aside className="circuit-info-panel">
      <div className="circuit-info-header">
        <span
          className="circuit-info-icon"
          style={{ backgroundColor: COMPONENT_COLORS[type] }}
          aria-hidden="true"
        >
          {COMPONENT_ICONS[type]}
        </span>
        <h3 className="circuit-info-title">{model.label}</h3>
      </div>

      {info.summary && <p className="circuit-info-summary">{info.summary}</p>}
      {info.detail && <p className="circuit-info-detail">{info.detail}</p>}

      {info.tips.length > 0 && (
        <ul className="circuit-info-tips">
          {info.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}

      {!info.summary && !info.detail && (
        <p className="circuit-info-missing">Informațiile educaționale nu sunt încă în baza de date.</p>
      )}

      <div className="circuit-info-preview-slot">
        {hasGlb ? (
          <p className="circuit-info-preview-ready">Preview 3D disponibil când implementăm GLB-urile.</p>
        ) : (
          <p className="circuit-info-preview-placeholder">Preview 3D — asset în pregătire</p>
        )}
      </div>
    </aside>
  );
}
