import { useState } from "react";
import type { TemplateProps } from "./types";

interface BacteriaModel {
  id: string;
  label: string;
  glb: string | null;
}

function BacteriaShapeIcon({ id }: { id: string }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 32 32",
    fill: "currentColor",
    "aria-hidden": true,
  };

  switch (id) {
    case "coccus":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="7" />
        </svg>
      );
    case "bacillus":
      return (
        <svg {...common}>
          <rect x="6" y="12" width="20" height="8" rx="4" />
        </svg>
      );
    case "spirillum":
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M5 16c2.5-6 5-6 7.5 0s5 6 7.5 0 5-6 7.5 0" />
        </svg>
      );
    case "streptococcus":
      return (
        <svg {...common}>
          <circle cx="6.5" cy="16" r="3.3" />
          <circle cx="13.5" cy="16" r="3.3" />
          <circle cx="20.5" cy="16" r="3.3" />
          <circle cx="27" cy="16" r="3.1" />
        </svg>
      );
    case "staphylococcus":
      return (
        <svg {...common}>
          <circle cx="16" cy="11" r="3.2" />
          <circle cx="11.2" cy="16.5" r="3.2" />
          <circle cx="20.8" cy="16.5" r="3.2" />
          <circle cx="13.5" cy="22.2" r="3" />
          <circle cx="18.8" cy="22" r="3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="6" />
        </svg>
      );
  }
}

export default function BacteriaViewerTemplate({ lesson }: TemplateProps) {
  const models: BacteriaModel[] =
    (lesson.metadata as { models?: BacteriaModel[] }).models ?? [];

  const [activeId, setActiveId] = useState<string>(models[0]?.id ?? "");
  const active = models.find((m) => m.id === activeId);

  return (
    <div className="template-bacteria">
      <p className="template-description">{lesson.description}</p>

      <div className="bacteria-selector">
        {models.map((m) => (
          <button
            key={m.id}
            className={`bacteria-btn ${activeId === m.id ? "active" : ""}`}
            onClick={() => setActiveId(m.id)}
          >
            <span className="bacteria-btn-icon">
              <BacteriaShapeIcon id={m.id} />
            </span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      <div className="bacteria-viewer-wrap">
        {active?.glb ? (
          <div className="bacteria-glb-placeholder">
            <p>GLB: {active.glb}</p>
          </div>
        ) : (
          <div className="template-placeholder">
            <div className="template-placeholder-icon bacteria-placeholder-glyph">
              <BacteriaShapeIcon id={active?.id ?? "coccus"} />
            </div>
            <p className="template-placeholder-label">{active?.label}</p>
            <p className="template-placeholder-hint">
              Asset 3D în pregătire — va fi disponibil în curând.
            </p>
          </div>
        )}
      </div>

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
