import type { PartDef } from "../../../../../content/circuits/parts";
import type { ComponentType } from "../types";

interface ComponentIconProps {
  /** Tipul piesei; dacă dai `part`, tipul se ia de acolo */
  type?: ComponentType;
  /** Piesa din catalog: dă culoarea LED-ului și benzile rezistorului */
  part?: PartDef;
  /** Întrerupător închis (pârghia atinge contactul) */
  switchOn?: boolean;
  /** Potențiometru 0..1 — rotește indicatorul butonului */
  potValue?: number;
  className?: string;
}

/**
 * Desene SVG pentru piese, văzute „ca în realitate” dar simplificate.
 * Culori fixe, alese să iasă în evidență pe fundalul închis al mesei.
 */
const LED_COLORS = {
  red: { dome: "#ef4444", edge: "#fca5a5", base: "#b91c1c", shine: "#fecaca" },
  yellow: { dome: "#facc15", edge: "#fef08a", base: "#a16207", shine: "#fefce8" },
  green: { dome: "#22c55e", edge: "#86efac", base: "#15803d", shine: "#dcfce7" },
  blue: { dome: "#3b82f6", edge: "#93c5fd", base: "#1d4ed8", shine: "#dbeafe" },
} as const;

/** Codul culorilor pentru rezistoare: cifra → culoare. */
const BAND_COLORS = [
  "#111111", "#6d3b1f", "#d32f2f", "#f57c00", "#fbc02d",
  "#2e7d32", "#1565c0", "#7b1fa2", "#9e9e9e", "#fafafa",
];

/** Trei benzi (cifră, cifră, multiplicator) pentru o valoare în ohmi, ex. 220 → roșu roșu maro. */
export function resistorBandColors(ohms: number): [string, string, string] {
  const exponent = Math.max(0, Math.floor(Math.log10(Math.max(ohms, 10))) - 1);
  const twoDigits = Math.round(ohms / 10 ** exponent);
  const d1 = Math.floor(twoDigits / 10) % 10;
  const d2 = twoDigits % 10;
  return [BAND_COLORS[d1], BAND_COLORS[d2], BAND_COLORS[Math.min(exponent, 9)]];
}

export default function ComponentIcon({
  type: typeProp,
  part,
  switchOn = false,
  potValue = 0.5,
  className = "",
}: ComponentIconProps) {
  const type = part?.type ?? typeProp ?? "wire_junction";
  const cls = `circuit-icon circuit-icon--${type} ${className}`.trim();

  switch (type) {
    case "battery":
      return (
        <svg className={cls} viewBox="0 0 64 32" aria-hidden="true">
          {/* corp */}
          <rect x="4" y="5" width="50" height="22" rx="4" fill="#1d1d24" stroke="#f2f2f2" strokeWidth="1.5" />
          {/* banda de culoare spre + */}
          <path d="M34 5h16a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H34z" fill="#f59e0b" />
          {/* borna + */}
          <rect x="54" y="11" width="6" height="10" rx="1.5" fill="#d4d4d8" stroke="#f2f2f2" strokeWidth="1" />
          <text x="44" y="21.5" textAnchor="middle" fontSize="14" fontWeight="800" fill="#1d1d24">+</text>
          <text x="17" y="21.5" textAnchor="middle" fontSize="15" fontWeight="800" fill="#f2f2f2">−</text>
        </svg>
      );

    case "resistor": {
      // Rezistor cu terminale și benzi colorate după valoare (ultima, aurie = toleranță 5%).
      const override = part?.type === "resistor" ? (part.electrical as { resistance_ohm?: number } | undefined) : undefined;
      const ohms = override?.resistance_ohm ?? 220;
      const [b1, b2, b3] = resistorBandColors(ohms);
      return (
        <svg className={cls} viewBox="0 0 64 32" aria-hidden="true">
          <path d="M2 16h14M48 16h14" stroke="#c9c9cf" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="14" y="8" width="36" height="16" rx="7" fill="#e9cf9f" stroke="#7a5b2e" strokeWidth="1.2" />
          <rect x="20" y="8" width="3.5" height="16" fill={b1} />
          <rect x="26" y="8" width="3.5" height="16" fill={b2} />
          <rect x="32" y="8" width="3.5" height="16" fill={b3} />
          <rect x="41" y="8" width="3.5" height="16" fill="#d4a017" />
        </svg>
      );
    }

    case "switch":
      // Simbolul de întrerupător din fizică: două contacte și o pârghie care se închide.
      return (
        <svg className={cls} viewBox="0 0 64 32" aria-hidden="true">
          <path d="M2 22h12M50 22h12" stroke="#c9c9cf" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="16" cy="22" r="3.5" fill="#f2f2f2" />
          <circle cx="48" cy="22" r="3.5" fill="#f2f2f2" />
          <line
            className="circuit-icon-switch-lever"
            x1="16"
            y1="22"
            x2="48"
            y2="22"
            stroke={switchOn ? "#4ade80" : "#f2f2f2"}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transform: `rotate(${switchOn ? 0 : -32}deg)`, transformOrigin: "16px 22px" }}
          />
        </svg>
      );

    case "led": {
      const c = LED_COLORS[part?.color ?? "red"];
      return (
        <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
          {/* picioare: cel lung e + */}
          <path d="M16 26v12M24 26v8" stroke="#c9c9cf" strokeWidth="2" strokeLinecap="round" />
          <path className="circuit-icon-led-dome" d="M10 26V15a10 10 0 0 1 20 0v11z" fill={c.dome} stroke={c.edge} strokeWidth="1.2" />
          <rect x="8" y="25" width="24" height="3.5" rx="1" fill={c.base} />
          <path d="M15 12a6 6 0 0 1 5-4" stroke={c.shine} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      );
    }

    case "dc_motor":
      return (
        <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="15" fill="#1e3a5f" stroke="#7dd3fc" strokeWidth="1.5" />
          <g className="circuit-icon-motor-rotor">
            <path d="M20 20 L20 7 A13 13 0 0 1 31 14z" fill="#38bdf8" />
            <path d="M20 20 L31 26 A13 13 0 0 1 20 33z" fill="#38bdf8" opacity="0.75" />
            <path d="M20 20 L9 26 A13 13 0 0 1 9 14z" fill="#38bdf8" opacity="0.5" />
          </g>
          <circle cx="20" cy="20" r="4" fill="#e0f2fe" />
          <text x="20" y="23" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1e3a5f">M</text>
        </svg>
      );

    case "potentiometer": {
      const angle = -135 + Math.min(1, Math.max(0, potValue)) * 270;
      return (
        <svg className={cls} viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="15" fill="#3b2a55" stroke="#c4b5fd" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="10" fill="#6d28d9" stroke="#ddd6fe" strokeWidth="1" />
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="11"
            stroke="#fef3c7"
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: "20px 20px" }}
          />
        </svg>
      );
    }

    case "wire_junction":
      return (
        <svg className={cls} viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 16V3M16 16H3M16 16h13" stroke="#e8c547" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="16" r="5" fill="#e8c547" />
        </svg>
      );
  }
}
