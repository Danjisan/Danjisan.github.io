import type { ReactNode } from "react";
import WorkbenchViewportControls from "./WorkbenchViewportControls";
import type { WorkbenchViewport } from "../logic/viewportCoords";

interface CircuitEditorToolbarProps {
  canReset: boolean;
  onResetBoard: () => void;
  viewport: WorkbenchViewport;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  end?: ReactNode;
}

export default function CircuitEditorToolbar({
  canReset,
  onResetBoard,
  viewport,
  onZoomIn,
  onZoomOut,
  onResetView,
  end,
}: CircuitEditorToolbarProps) {
  return (
    <div className="circuit-editor-toolbar">
      <button
        type="button"
        className="circuit-workbench-reset-btn"
        disabled={!canReset}
        onClick={onResetBoard}
      >
        Resetează masa
      </button>
      <WorkbenchViewportControls
        viewport={viewport}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onResetView={onResetView}
      />
      {end}
    </div>
  );
}
