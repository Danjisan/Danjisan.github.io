import { useState } from "react";
import type { TemplateProps } from "./types";

interface BacteriaModel {
  id: string;
  label: string;
  glb: string | null;
}

export default function BacteriaViewerTemplate({ lesson }: TemplateProps) {
  const models: BacteriaModel[] =
    (lesson.metadata as { models?: BacteriaModel[] }).models ?? [];

  const [activeId, setActiveId] = useState<string>(models[0]?.id ?? "");
  const active = models.find((m) => m.id === activeId);

  return (
    <div className="template-bacteria">
      <p className="template-description">{lesson.description}</p>

      {/* Selector tip bacterie */}
      <div className="bacteria-selector">
        {models.map((m) => (
          <button
            key={m.id}
            className={`bacteria-btn ${activeId === m.id ? "active" : ""}`}
            onClick={() => setActiveId(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Viewer 3D sau placeholder */}
      <div className="bacteria-viewer-wrap">
        {active?.glb ? (
          // ModelBox va fi importat când avem GLB-urile
          <div className="bacteria-glb-placeholder">
            <p>GLB: {active.glb}</p>
          </div>
        ) : (
          <div className="template-placeholder">
            <div className="template-placeholder-icon">🦠</div>
            <p className="template-placeholder-label">{active?.label}</p>
            <p className="template-placeholder-hint">
              Asset 3D în pregătire — va fi disponibil în curând.
            </p>
          </div>
        )}
      </div>

      {/* Info bacterie selectată */}
      {active && (
        <div className="bacteria-info">
          <h3>{active.label}</h3>
          <p className="bacteria-info-text">
            {getBacteriaDescription(active.id)}
          </p>
        </div>
      )}
    </div>
  );
}

function getBacteriaDescription(id: string): string {
  const descriptions: Record<string, string> = {
    coccus:
      "Bacteriile sferice (coccus) pot fi izolate sau grupate. Sunt printre cele mai comune forme bacteriene și includ specii ca Streptococcus și Staphylococcus.",
    bacillus:
      "Bacteriile cilindrice (bacillus) au formă de bastonaș. Multe bacterii benefice din sol aparțin acestui grup, dar și patogeni ca Bacillus anthracis.",
    spirillum:
      "Bacteriile spiralate (spirillum) au formă de spirală rigidă. Se deplasează prin mediu lichid cu ajutorul flagelilor.",
    streptococcus:
      "Streptococii sunt coci dispuși în șiruri (lanțuri), ca niște mărgele. Unele specii produc infecții la nivelul gâtului.",
    staphylococcus:
      "Stafilococii sunt coci dispuși în ciorchine neregulat. Staphylococcus aureus este o specie frecvent întâlnită pe pielea umană.",
  };
  return descriptions[id] ?? "";
}
