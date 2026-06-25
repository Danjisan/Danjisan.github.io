import type { WorkbenchViewport } from "../logic/viewportCoords";

interface WorkbenchViewportControlsProps {
  viewport: WorkbenchViewport;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function WorkbenchViewportControls({
  viewport,
  onZoomIn,
  onZoomOut,
  onResetView,
}: WorkbenchViewportControlsProps) {
  const label = `${Math.round(viewport.zoom * 100)}%`;

  return (
    <div className="circuit-viewport-controls" role="group" aria-label="Zoom masă de lucru">
      <button type="button" className="circuit-viewport-btn" onClick={onZoomOut} aria-label="Micșorează">
        −
      </button>
      <button
        type="button"
        className="circuit-viewport-btn circuit-viewport-btn--label"
        onClick={onResetView}
        aria-label="Resetează zoom și poziția mesei"
        title="Resetează vizualizarea"
      >
        {label}
      </button>
      <button type="button" className="circuit-viewport-btn" onClick={onZoomIn} aria-label="Mărește">
        +
      </button>
    </div>
  );
}
