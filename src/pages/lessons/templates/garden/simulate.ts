import { GARDEN_SPECIES, type SpeciesId } from "./species";
import { getSunState, type SunState } from "./sun";

export type PlantStatus =
  | "growing"
  | "stressed"
  | "mature"
  | "harvested"
  | "dead";

export interface SimPlantState {
  speciesId: SpeciesId;
  growthProgress: number;
  soilMoisture: number;
  health: number;
  weedLevel: number;
  status: PlantStatus;
  lastWateredAt: string | null;
  lastSimAt: string;
}

export interface SimResult {
  plant: SimPlantState;
  sun: SunState;
  log: string[];
  hoursSimulated: number;
}

const MS_HOUR = 3_600_000;
/** Plafon catch-up odată (evită salturi enorme după luni absente). */
export const MAX_CATCHUP_HOURS = 72;
/** Pași de simulare (ore). */
const STEP_HOURS = 1;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Avansă starea plantei de la lastSimAt până la `now`, în pași de 1h.
 */
export function simulatePlant(
  plant: SimPlantState,
  opts: {
    latitude: number;
    longitude: number;
    now?: Date;
    maxHours?: number;
  },
): SimResult {
  const now = opts.now ?? new Date();
  const maxHours = opts.maxHours ?? MAX_CATCHUP_HOURS;
  const log: string[] = [];

  if (plant.status === "harvested" || plant.status === "dead") {
    const sun = getSunState(opts.latitude, opts.longitude, now);
    return {
      plant: { ...plant, lastSimAt: now.toISOString() },
      sun,
      log: [],
      hoursSimulated: 0,
    };
  }

  const species = GARDEN_SPECIES[plant.speciesId];
  let state: SimPlantState = { ...plant };
  const start = new Date(plant.lastSimAt).getTime();
  const end = now.getTime();
  let hours = Math.max(0, (end - start) / MS_HOUR);
  hours = Math.min(hours, maxHours);

  const steps = Math.floor(hours / STEP_HOURS);
  let cursor = start;

  for (let i = 0; i < steps; i++) {
    cursor += STEP_HOURS * MS_HOUR;
    const at = new Date(cursor);
    const sun = getSunState(opts.latitude, opts.longitude, at);
    state = stepHour(state, species.id, sun, log, i === steps - 1);
  }

  // Fracțiune de oră rămasă
  const rem = hours - steps * STEP_HOURS;
  if (rem > 0.05 && state.status !== "dead" && state.status !== "harvested") {
    cursor = end;
    const sun = getSunState(opts.latitude, opts.longitude, now);
    state = stepHour(state, species.id, sun, log, true, rem);
  }

  state.lastSimAt = now.toISOString();

  if (state.growthProgress >= 1 && state.status === "growing") {
    state.status = "mature";
    state.growthProgress = 1;
    log.push("Planta a ajuns la maturitate.");
  }

  const sun = getSunState(opts.latitude, opts.longitude, now);
  return { plant: state, sun, log, hoursSimulated: hours };
}

function stepHour(
  state: SimPlantState,
  speciesId: SpeciesId,
  sun: SunState,
  log: string[],
  recordLog: boolean,
  hourFraction = 1,
): SimPlantState {
  const sp = GARDEN_SPECIES[speciesId];
  let { soilMoisture, health, weedLevel, growthProgress, status } = state;

  if (status === "dead" || status === "harvested") return state;

  // Evaporare
  const evap =
    0.018 * sun.evaporateFactor * hourFraction * (1 + weedLevel * 0.35);
  soilMoisture = clamp(soilMoisture - evap, 0, 1);

  // Buruieni: cresc dacă e umezeală
  if (soilMoisture > 0.35) {
    weedLevel = clamp(
      weedLevel +
        0.012 * sp.weedVulnerability * hourFraction * (sun.isDay ? 1.1 : 0.7),
      0,
      1,
    );
  }

  const moistDelta = Math.abs(soilMoisture - sp.idealMoisture);
  const inBand = moistDelta <= sp.moistureTolerance;
  const tooDry = soilMoisture < sp.idealMoisture - sp.moistureTolerance;
  const tooWet = soilMoisture > sp.idealMoisture + sp.moistureTolerance;

  if (tooDry) {
    health = clamp(health - 0.02 * hourFraction, 0, 1);
  } else if (tooWet) {
    health = clamp(health - 0.01 * hourFraction, 0, 1);
  } else if (inBand && weedLevel < 0.7) {
    health = clamp(health + 0.008 * hourFraction, 0, 1);
  }

  // Creștere
  const dayProgress = hourFraction / (sp.daysToMature * 24);
  let growthMul = 0;
  if (inBand && health > 0.35) {
    growthMul = 1;
    if (sun.isDay) growthMul *= 1.15;
    else growthMul *= 0.55;
    growthMul *= 1 - weedLevel * 0.55;
    growthMul *= 0.6 + health * 0.4;
  } else if (tooDry || tooWet) {
    growthMul = 0.15 * (health > 0.4 ? 1 : 0.3);
  }

  growthProgress = clamp(growthProgress + dayProgress * growthMul, 0, 1.05);

  if (health <= 0.02) {
    status = "dead";
    health = 0;
    if (recordLog) log.push("Planta a murit din cauza condițiilor grele.");
  } else if (tooDry || weedLevel > 0.75 || health < 0.45) {
    status = growthProgress >= 1 ? "mature" : "stressed";
  } else if (growthProgress >= 1) {
    status = "mature";
    growthProgress = 1;
  } else {
    status = "growing";
  }

  return {
    ...state,
    soilMoisture,
    health,
    weedLevel,
    growthProgress,
    status,
  };
}

export interface WaterResult {
  plant: SimPlantState;
  sun: SunState;
  warning: string | null;
  message: string;
}

export function applyWater(
  plant: SimPlantState,
  latitude: number,
  longitude: number,
  now: Date = new Date(),
): WaterResult {
  const sun = getSunState(latitude, longitude, now);
  const sp = GARDEN_SPECIES[plant.speciesId];
  let add = 0.28;
  let warning: string | null = null;

  if (sun.isHarshSun) {
    const penalty = 0.35 + sp.sunWaterSensitivity * 0.35;
    add *= 1 - penalty;
    warning =
      "Soare tare: o parte din apă se evaporă rapid. Ideal e să uzi dimineața sau seara.";
  } else if (!sun.isDay) {
    add *= 1.05;
  }

  const soilMoisture = clamp(plant.soilMoisture + add, 0, 1);
  const health = clamp(plant.health + (warning ? 0 : 0.02), 0, 1);

  return {
    plant: {
      ...plant,
      soilMoisture,
      health,
      lastWateredAt: now.toISOString(),
      status:
        plant.status === "dead" || plant.status === "harvested"
          ? plant.status
          : plant.growthProgress >= 1
            ? "mature"
            : soilMoisture < sp.idealMoisture - sp.moistureTolerance
              ? "stressed"
              : "growing",
    },
    sun,
    warning,
    message: warning
      ? `Ai udat (eficiență redusă). Umiditate → ${Math.round(soilMoisture * 100)}%.`
      : `Ai udat. Umiditate → ${Math.round(soilMoisture * 100)}%.`,
  };
}

export function applyWeed(plant: SimPlantState): SimPlantState {
  if (plant.status === "dead" || plant.status === "harvested") return plant;
  return {
    ...plant,
    weedLevel: clamp(plant.weedLevel - 0.55, 0, 1),
    health: clamp(plant.health + 0.03, 0, 1),
    lastSimAt: plant.lastSimAt,
    status:
      plant.growthProgress >= 1
        ? "mature"
        : plant.health < 0.45
          ? "stressed"
          : "growing",
  };
}

export function applyHarvest(plant: SimPlantState): SimPlantState {
  if (plant.growthProgress < 0.95 && plant.status !== "mature") return plant;
  return { ...plant, status: "harvested", growthProgress: 1 };
}
