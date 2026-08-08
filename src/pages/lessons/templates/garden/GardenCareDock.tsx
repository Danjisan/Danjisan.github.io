import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function Weeds({ level }: { level: number }) {
  if (level <= 0.15) return null;
  return (
    <div className="garden-viz-weeds" aria-hidden>
      {"🌿".repeat(Math.min(5, Math.ceil(level * 5)))}
    </div>
  );
}

/** Overlay expand pentru preview emoji (când încă nu există GLB). */
export function GardenEmojiStage({
  emoji,
  stageClass,
  weedLevel = 0,
  careDock,
}: {
  emoji: string;
  stageClass: string;
  weedLevel?: number;
  careDock: ReactNode;
}) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  return (
    <>
      <div className={`garden-viz-plant ${stageClass}`} aria-hidden>
        {emoji}
      </div>
      <Weeds level={weedLevel} />
      <button
        type="button"
        className="model-box-corner model-box-expand garden-emoji-expand"
        aria-label="Deschide îngrijirea pe tot ecranul"
        onClick={() => setFullscreen(true)}
      >
        <ExpandIcon />
      </button>

      {fullscreen && (
        <div className="garden-emoji-fullscreen" role="dialog" aria-modal="true">
          <div className="garden-emoji-fullscreen-viz" aria-hidden>
            <span className={`garden-viz-plant ${stageClass}`}>{emoji}</span>
            <Weeds level={weedLevel} />
          </div>
          {careDock}
          <button
            type="button"
            className="model-box-corner model-box-close"
            aria-label="Închide"
            onClick={() => setFullscreen(false)}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </>
  );
}

export function GardenCareDock({
  title,
  blurb,
  statusLabel,
  meters,
  actions,
  warn,
}: {
  title: string;
  blurb?: string;
  statusLabel: string;
  meters: ReactNode;
  actions: ReactNode;
  warn?: ReactNode;
}) {
  const hasDetails = Boolean(blurb) || Boolean(warn);

  return (
    <div className="garden-care-dock">
      <div className="garden-care-dock-inner">
        <div className="garden-care-dock-header">
          <p className="garden-care-dock-title">{title}</p>
          <p className="garden-care-dock-status">
            <span className="garden-care-dock-status-label">Status</span>{" "}
            <strong>{statusLabel}</strong>
          </p>
        </div>
        <div className="garden-care-dock-body">
          <div className="garden-meters garden-care-dock-meters">{meters}</div>
          <div className="garden-actions garden-care-dock-actions">{actions}</div>
        </div>
        {hasDetails && (
          <details className="garden-care-dock-details">
            <summary>Detalii</summary>
            {blurb && <p className="garden-care-dock-blurb">{blurb}</p>}
            {warn}
          </details>
        )}
      </div>
    </div>
  );
}
