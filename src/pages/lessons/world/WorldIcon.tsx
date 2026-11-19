/**
 * Iconițe pentru pătratele din Lumea Lecțiilor (capitole și lecții).
 * Monocrome (currentColor), desenate pe un viewBox 40×40.
 */

export type WorldIconId =
  | "microbe"
  | "plant"
  | "sprout"
  | "bolt"
  | "bulb"
  | "battery"
  | "flask"
  | "molecule"
  | "home"
  | "generic";

const TEMPLATE_ICONS: Record<string, WorldIconId> = {
  bacteria_viewer: "microbe",
  plant_tamagotchi: "sprout",
  circuit_electric: "bolt",
  chemistry_sim: "molecule",
};

export function iconForTemplate(templateType: string): WorldIconId {
  return TEMPLATE_ICONS[templateType] ?? "generic";
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function WorldIcon({ id }: { id: WorldIconId }) {
  return (
    <svg viewBox="0 0 40 40" fill="currentColor" aria-hidden="true">
      {renderGlyph(id)}
    </svg>
  );
}

function renderGlyph(id: WorldIconId) {
  switch (id) {
    case "microbe":
      // Coccus, bacil, streptococ, stafilococ
      return (
        <>
          <circle cx="9" cy="12" r="3.2" opacity="0.95" />
          <rect x="16.2" y="9.2" width="11.5" height="5.6" rx="2.8" opacity="0.9" />
          <circle cx="8" cy="27" r="2.4" />
          <circle cx="13.2" cy="27" r="2.4" />
          <circle cx="18.4" cy="27" r="2.4" />
          <circle cx="28" cy="24.5" r="2.35" />
          <circle cx="32.2" cy="27.8" r="2.35" />
          <circle cx="27.2" cy="29.8" r="2.35" />
          <circle cx="31.6" cy="22.2" r="2.1" opacity="0.85" />
        </>
      );
    case "plant":
      // Plantă în ghiveci
      return (
        <>
          <path d="M20 26V13" {...stroke} />
          <path d="M20 18c-5.5 0-8.6-3.6-8.4-8.2 4.8.1 8 3.3 8.4 8.2Z" />
          <path d="M20 15.5c5 0 8-3.2 7.8-7.5-4.4.1-7.4 3-7.8 7.5Z" />
          <path d="M11 26h18l-2.2 9H13.2Z" />
        </>
      );
    case "sprout":
      return (
        <>
          <path d="M20 34V18" {...stroke} />
          <path d="M20 22c-6.5-.2-10.5-4.8-10.2-10.5C15.5 12 19.2 15.8 20 22Z" />
          <path d="M20 20c6.5-.2 10.5-4.5 10.2-10.2C24.2 10.2 20.8 14.2 20 20Z" />
          <path d="M15 34h10" {...stroke} />
        </>
      );
    case "bolt":
      return <path d="M18.5 5 11 20h7l-2.5 15L29 17h-7L24 5H18.5Z" {...stroke} />;
    case "bulb":
      return (
        <>
          <path d="M14.5 24.5c-2.6-2.1-4.2-5.1-4.2-8.4C10.3 10.6 14.6 6 20 6s9.7 4.6 9.7 10.1c0 3.3-1.6 6.3-4.2 8.4V28h-11Z" {...stroke} />
          <path d="M15 31.5h10M16.5 35h7" {...stroke} />
          <path d="M17 20l3 3 3-3" {...stroke} strokeWidth={1.8} />
        </>
      );
    case "battery":
      return (
        <>
          <rect x="6" y="12" width="25" height="16" rx="3" {...stroke} />
          <path d="M31 17h3v6h-3" {...stroke} />
          <path d="M22 20h5M24.5 17.5v5M11 20h4" {...stroke} strokeWidth={2} />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M16 6h8M17 6v10L8.5 31a2.6 2.6 0 0 0 2.3 3.8h18.4a2.6 2.6 0 0 0 2.3-3.8L23 16V6" {...stroke} />
          <path d="M12.6 25h14.8l3 5.6a1 1 0 0 1-.9 1.4H10.5a1 1 0 0 1-.9-1.4Z" opacity="0.85" />
          <circle cx="21" cy="20.5" r="1.3" />
        </>
      );
    case "molecule":
      return (
        <>
          <circle cx="14" cy="14" r="4" />
          <circle cx="27" cy="12" r="3.2" opacity="0.9" />
          <circle cx="22" cy="26" r="4.4" opacity="0.95" />
          <path d="M17.2 16.2 20.2 23.2M25.2 14.5 23.2 22.2M16.8 14.8 24.2 12.4" {...stroke} strokeWidth={1.8} />
        </>
      );
    case "home":
      // Casă cu trei „ferestre” — cele trei materii
      return (
        <>
          <path d="M6 19 20 7l14 12" {...stroke} strokeWidth={2.6} />
          <path d="M10 16.5V33h20V16.5" {...stroke} strokeWidth={2.6} />
          <rect x="13" y="21" width="3.4" height="3.4" rx="0.8" />
          <rect x="18.3" y="21" width="3.4" height="3.4" rx="0.8" />
          <rect x="23.6" y="21" width="3.4" height="3.4" rx="0.8" />
        </>
      );
    default:
      return (
        <>
          <rect x="8" y="8" width="24" height="24" rx="6" {...stroke} strokeWidth={2} />
          <path d="M14 20h12M20 14v12" {...stroke} strokeWidth={2} />
        </>
      );
  }
}
