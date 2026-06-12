import { Suspense, lazy, useEffect, useRef, useState } from "react";
import type { ModelSettings } from "./types";

// Three.js + react-three-fiber se încarcă doar când o pagină chiar
// afișează un model 3D — restul site-ului nu plătește costul.
const ModelViewer3D = lazy(() => import("./ModelViewer3D"));

interface ModelBoxProps {
  src: string;
  settings?: ModelSettings;
}

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

/**
 * Caseta 3D pornește "adormită": modelul se vede și se rotește singur,
 * dar scroll-ul/drag-ul trec prin ea ca prin orice element al paginii.
 * La click/tap se activează controalele (orbită + zoom); se dezactivează
 * când mouse-ul iese din casetă (PC) sau la tap în afara ei (mobil).
 * Butonul ⛶ deschide viewerul peste tot ecranul (ieșire cu ✕ sau Esc).
 */
export default function ModelBox({ src, settings }: ModelBoxProps) {
  const [active, setActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const exitFullscreen = () => {
    setFullscreen(false);
    setActive(false);
  };

  // Dezactivare la tap în afara casetei (mobil).
  useEffect(() => {
    if (!active || fullscreen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setActive(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [active, fullscreen]);

  // În fullscreen: Esc închide, iar pagina din spate nu mai derulează.
  useEffect(() => {
    if (!fullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitFullscreen();
    };
    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen]);

  const className = [
    "model-box",
    active && !fullscreen ? "active" : "",
    fullscreen ? "fullscreen" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={boxRef}
      className={className}
      onMouseLeave={() => {
        if (!fullscreen) setActive(false);
      }}
    >
      <Suspense fallback={<div className="media-loading">Se încarcă 3D…</div>}>
        <ModelViewer3D src={src} settings={settings} />
      </Suspense>

      {!active && !fullscreen && (
        <button
          type="button"
          className="model-box-shield"
          aria-label="Activează controalele 3D"
          onClick={() => setActive(true)}
        >
          <span className="model-box-hint">↻ Apasă pentru a interacționa</span>
        </button>
      )}

      {fullscreen ? (
        <button
          type="button"
          className="model-box-corner model-box-close"
          aria-label="Închide fullscreen"
          onClick={exitFullscreen}
        >
          <CloseIcon />
        </button>
      ) : (
        <button
          type="button"
          className="model-box-corner model-box-expand"
          aria-label="Deschide pe tot ecranul"
          onClick={() => {
            setFullscreen(true);
            setActive(true);
          }}
        >
          <ExpandIcon />
        </button>
      )}
    </div>
  );
}
