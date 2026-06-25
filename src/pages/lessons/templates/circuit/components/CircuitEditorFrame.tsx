import { useEffect, type ReactNode } from "react";

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface CircuitEditorFrameProps {
  fullscreen: boolean;
  onExitFullscreen: () => void;
  children: ReactNode;
}

/**
 * Shell editor circuit — fullscreen ca ModelBox: lock scroll, touch-action none,
 * buton expand/închide în colț.
 */
export default function CircuitEditorFrame({
  fullscreen,
  onExitFullscreen,
  children,
}: CircuitEditorFrameProps) {
  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExitFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen, onExitFullscreen]);

  const className = ["circuit-editor-frame", fullscreen ? "fullscreen" : ""].filter(Boolean).join(" ");

  return (
    <div className={className}>
      {fullscreen && (
        <button
          type="button"
          className="circuit-editor-corner circuit-editor-close"
          aria-label="Închide editorul"
          onClick={onExitFullscreen}
        >
          <CloseIcon />
        </button>
      )}

      {children}
    </div>
  );
}
