import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import type { ComponentModel, ComponentType } from "../types";

interface ComponentInfoPanelProps {
  type: ComponentType | null;
  model: ComponentModel | null;
  potentiometerValue?: number;
  onPotentiometerChange?: (value: number) => void;
  compact?: boolean;
}

export default function ComponentInfoPanel({
  type,
  model,
  potentiometerValue,
  onPotentiometerChange,
  compact = false,
}: ComponentInfoPanelProps) {
  if (!type || !model) {
    if (compact) return null;
    return (
      <aside className="circuit-info-panel circuit-info-panel--empty">
        <p>Selectează o componentă din inventar sau de pe masă pentru detalii.</p>
      </aside>
    );
  }

  const { info } = model;
  const hasGlb = Boolean(model.glb);
  const panelClass = ["circuit-info-panel", compact ? "circuit-info-panel--compact" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <aside className={panelClass}>
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
      {!compact && info.detail && <p className="circuit-info-detail">{info.detail}</p>}

      {!compact && info.tips.length > 0 && (
        <ul className="circuit-info-tips">
          {info.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      )}

      {!compact && !info.summary && !info.detail && (
        <p className="circuit-info-missing">Informațiile educaționale nu sunt încă în baza de date.</p>
      )}

      {type === "potentiometer" && onPotentiometerChange && potentiometerValue !== undefined && (
        <div className="circuit-pot-control">
          <label className="circuit-pot-label" htmlFor="circuit-pot-slider">
            Rezistență variabilă: {Math.round(potentiometerValue * 100)}%
          </label>
          <input
            id="circuit-pot-slider"
            type="range"
            min={0}
            max={100}
            value={Math.round(potentiometerValue * 100)}
            onChange={(e) => onPotentiometerChange(Number(e.target.value) / 100)}
            className="circuit-pot-slider"
          />
        </div>
      )}

      {!compact && (
        <div className="circuit-info-preview-slot">
          {hasGlb ? (
            <p className="circuit-info-preview-ready">Preview 3D disponibil când implementăm GLB-urile.</p>
          ) : (
            <p className="circuit-info-preview-placeholder">Preview 3D — asset în pregătire</p>
          )}
        </div>
      )}
    </aside>
  );
}
