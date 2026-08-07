/** Specii M1 — tunabile fără migrare DB. */

export type SpeciesId =
  | "fasole"
  | "floarea-soarelui"
  | "rosii"
  | "ceapa"
  | "ardei"
  | "castraveti";

export interface PlantSpecies {
  id: SpeciesId;
  label: string;
  emoji: string;
  /** Zile reale aproximative până la maturitate la îngrijire bună */
  daysToMature: number;
  /** Umiditate ideală 0..1 (centru) */
  idealMoisture: number;
  /** Toleranță față de ideal (±) */
  moistureTolerance: number;
  /** Cât de mult „urâște” soarele tare la udare (0..1) */
  sunWaterSensitivity: number;
  /** Cât de repede apar buruienile (multiplicator) */
  weedVulnerability: number;
  /** Rând / dificultate pedagogică */
  unlockOrder: number;
  blurb: string;
}

export const GARDEN_SPECIES: Record<SpeciesId, PlantSpecies> = {
  fasole: {
    id: "fasole",
    label: "Fasole",
    emoji: "🫘",
    daysToMature: 14,
    idealMoisture: 0.55,
    moistureTolerance: 0.2,
    sunWaterSensitivity: 0.7,
    weedVulnerability: 1,
    unlockOrder: 1,
    blurb: "Crește relativ repede. Ideală pentru a învăța udatul și buruienile.",
  },
  "floarea-soarelui": {
    id: "floarea-soarelui",
    label: "Floarea-soarelui",
    emoji: "🌻",
    daysToMature: 28,
    idealMoisture: 0.5,
    moistureTolerance: 0.22,
    sunWaterSensitivity: 0.5,
    weedVulnerability: 0.85,
    unlockOrder: 2,
    blurb: "Iubește lumina. Udatul la amiază pe soare tare e mai puțin eficient.",
  },
  rosii: {
    id: "rosii",
    label: "Roșii",
    emoji: "🍅",
    daysToMature: 35,
    idealMoisture: 0.6,
    moistureTolerance: 0.18,
    sunWaterSensitivity: 0.85,
    weedVulnerability: 1.1,
    unlockOrder: 3,
    blurb: "Cer umiditate constantă. Frunzele „simt” stresul dacă solul oscilează.",
  },
  ceapa: {
    id: "ceapa",
    label: "Ceapă",
    emoji: "🧅",
    daysToMature: 40,
    idealMoisture: 0.45,
    moistureTolerance: 0.2,
    sunWaterSensitivity: 0.55,
    weedVulnerability: 1.2,
    unlockOrder: 4,
    blurb: "Crește mai încet. Buruienile îi fură ușor spațiul și apa.",
  },
  ardei: {
    id: "ardei",
    label: "Ardei",
    emoji: "🫑",
    daysToMature: 45,
    idealMoisture: 0.58,
    moistureTolerance: 0.17,
    sunWaterSensitivity: 0.8,
    weedVulnerability: 1,
    unlockOrder: 5,
    blurb: "Sensibil la uscăciune. Răbdare — maturitatea vine mai târziu.",
  },
  castraveti: {
    id: "castraveti",
    label: "Castraveți",
    emoji: "🥒",
    daysToMature: 30,
    idealMoisture: 0.65,
    moistureTolerance: 0.15,
    sunWaterSensitivity: 0.9,
    weedVulnerability: 1.15,
    unlockOrder: 6,
    blurb: "Bea multă apă. Pe soare puternic, udatul trebuie făcut cu grijă.",
  },
};

export const SPECIES_LIST = Object.values(GARDEN_SPECIES).sort(
  (a, b) => a.unlockOrder - b.unlockOrder,
);

export const ALEXANDRIA_TELEORMAN = {
  latitude: 43.974,
  longitude: 25.333,
  label: "Alexandria, Teleorman",
} as const;

export const GROWTH_STAGES = [
  { max: 0.05, label: "Sămânță" },
  { max: 0.2, label: "Germinare" },
  { max: 0.45, label: "Răsad" },
  { max: 0.7, label: "Creștere" },
  { max: 0.95, label: "Înflorire / formare" },
  { max: 1.01, label: "Matură" },
] as const;

export function stageLabel(progress: number): string {
  const p = Math.max(0, Math.min(1, progress));
  for (const s of GROWTH_STAGES) {
    if (p <= s.max) return s.label;
  }
  return "Matură";
}
