import { useEffect, useState } from "react";
import type { Milestone, MilestoneStatus } from "../data/roadmap";

// Sistem de coordonate al SVG-ului: lățime fixă, fiecare milestone ocupă un "rând".
const VIEW_W = 100;
const ROW_H = 30;
// Înălțimea reală (px) a unui rând pe ecran.
const ROW_PX = 150;

const STATUS_LABEL: Record<MilestoneStatus, string> = {
  done: "Gata",
  "in-progress": "În lucru",
  planned: "Planificat",
};

interface RoadmapPathProps {
  milestones: Milestone[];
}

export default function RoadmapPath({ milestones }: RoadmapPathProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  const totalH = milestones.length * ROW_H;

  // Nodurile alternează stânga/dreapta → drumul șerpuiește.
  const points = milestones.map((milestone, i) => ({
    milestone,
    index: i,
    x: i % 2 === 0 ? 28 : 72,
    y: ROW_H / 2 + i * ROW_H,
  }));

  // Curbe Bézier cubice între noduri consecutive, cu punctele de control
  // la jumătatea distanței verticale → formă lină de "S".
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const midY = (prev.y + p.y) / 2;
      return `C ${prev.x} ${midY}, ${p.x} ${midY}, ${p.x} ${p.y}`;
    })
    .join(" ");

  const selectedPoint =
    points.find((p) => p.milestone.id === selectedId) ?? null;

  return (
    <div
      className="roadmap-track"
      style={{ height: `${milestones.length * ROW_PX}px` }}
    >
      <svg
        className="roadmap-svg"
        viewBox={`0 0 ${VIEW_W} ${totalH}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d={pathD}
          className="roadmap-line"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {points.map((p) => (
        <button
          key={p.milestone.id}
          type="button"
          className={`roadmap-node status-${p.milestone.status}`}
          style={{ left: `${p.x}%`, top: `${(p.y / totalH) * 100}%` }}
          aria-expanded={selectedId === p.milestone.id}
          onClick={() =>
            setSelectedId((current) =>
              current === p.milestone.id ? null : p.milestone.id,
            )
          }
        >
          <span className="roadmap-node-img">
            {p.milestone.image ? (
              <img src={p.milestone.image} alt="" />
            ) : (
              p.index + 1
            )}
          </span>
          <span className="roadmap-node-title">{p.milestone.title}</span>
        </button>
      ))}

      {selectedPoint && (
        <div
          className={`roadmap-callout ${
            selectedPoint.x < VIEW_W / 2 ? "callout-right" : "callout-left"
          }`}
          style={{ top: `${(selectedPoint.y / totalH) * 100}%` }}
          role="dialog"
          aria-label={selectedPoint.milestone.title}
        >
          <button
            type="button"
            className="roadmap-callout-close"
            aria-label="Închide"
            onClick={() => setSelectedId(null)}
          >
            ✕
          </button>
          <span
            className={`status-badge status-${selectedPoint.milestone.status}`}
          >
            {STATUS_LABEL[selectedPoint.milestone.status]}
          </span>
          <h2>{selectedPoint.milestone.title}</h2>
          <p>{selectedPoint.milestone.description}</p>
        </div>
      )}
    </div>
  );
}
