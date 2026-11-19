import { Fragment, useState, type ReactNode } from "react";
import WorldIcon, { type WorldIconId } from "./WorldIcon";

export type TileStatus = "available" | "completed" | "locked" | "soon";

export interface Tile {
  key: string;
  title: string;
  icon: WorldIconId;
  status: TileStatus;
  /** Text mic în colț, ex. progres „1/2” la capitole */
  badge?: string;
  /** Conținutul panoului care se deschide sub rând */
  panel: ReactNode;
}

const COLUMNS = 3;

/**
 * Grilă fixă de 3 coloane cu pătrate. Click pe pătrat → panou pe toată lățimea, sub rândul lui,
 * cu o săgeată spre pătrat. Click din nou (sau Esc) → se închide.
 * Dă-i un `key` nou când se schimbă nivelul, ca să se reseteze pătratul deschis.
 */
export default function TileGrid({ tiles, className = "" }: { tiles: (Tile | null)[]; className?: string }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const openIndex = tiles.findIndex((t) => t?.key === openKey);
  const panelAfter =
    openIndex < 0 ? -1 : Math.min(Math.floor(openIndex / COLUMNS) * COLUMNS + COLUMNS - 1, tiles.length - 1);
  const arrowLeft = openIndex < 0 ? 0 : (((openIndex % COLUMNS) + 0.5) / COLUMNS) * 100;

  return (
    <div
      className={`world-grid ${className}`.trim()}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenKey(null);
      }}
    >
      {tiles.map((tile, i) => {
        if (!tile) {
          // Loc gol (ex. o materie are mai puține capitole); panoul poate cădea și după el
          return (
            <Fragment key={`empty-${i}`}>
              <span className="world-tile-empty" aria-hidden="true" />
              {i === panelAfter && renderPanel()}
            </Fragment>
          );
        }
        const open = tile.key === openKey;
        return (
          <Fragment key={tile.key}>
            <button
              type="button"
              className={`world-tile ${tile.status} ${open ? "open" : ""}`}
              aria-expanded={open}
              aria-controls={open ? "world-panel" : undefined}
              onClick={() => setOpenKey(open ? null : tile.key)}
            >
              <span className="world-tile-icon">
                <WorldIcon id={tile.icon} />
              </span>
              <span className="world-tile-title">{tile.title}</span>
              {tile.status === "completed" && <span className="world-tile-mark done" aria-label="Terminat">✓</span>}
              {tile.status === "locked" && <span className="world-tile-mark lock" aria-label="Blocat">🔒</span>}
              {tile.status !== "completed" && tile.status !== "locked" && tile.badge && (
                <span className="world-tile-badge">{tile.badge}</span>
              )}
            </button>
            {i === panelAfter && renderPanel()}
          </Fragment>
        );
      })}
    </div>
  );

  function renderPanel() {
    return (
      <div id="world-panel" className="world-panel" style={{ ["--arrow-left" as string]: `${arrowLeft}%` }}>
        {tiles[openIndex]?.panel}
      </div>
    );
  }
}
