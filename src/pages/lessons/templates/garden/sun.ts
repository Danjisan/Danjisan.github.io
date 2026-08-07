/**
 * Elevație solară aproximativă (°).
 * Suficientă pentru „soare tare / blând”, nu pentru navigație astronomică.
 */

const DEG = Math.PI / 180;

export interface SunState {
  elevationDeg: number;
  /** true când soarele e deasupra orizontului */
  isDay: boolean;
  /** „Soare tare” — udatul e mai puțin potrivit */
  isHarshSun: boolean;
  /** Factor evaporare 0.4 (noapte) … ~1.6 (amiază senină) */
  evaporateFactor: number;
  label: string;
}

export function solarElevationDeg(
  latitude: number,
  longitude: number,
  when: Date = new Date(),
): number {
  const lat = latitude * DEG;
  const dayOfYear = (() => {
    const start = Date.UTC(when.getUTCFullYear(), 0, 0);
    const now = Date.UTC(
      when.getUTCFullYear(),
      when.getUTCMonth(),
      when.getUTCDate(),
    );
    return (now - start) / 86_400_000;
  })();

  // Declinație solară aproximativă
  const decl =
    23.45 *
    DEG *
    Math.sin(((2 * Math.PI) / 365) * (284 + dayOfYear));

  // Timp solar aproximativ (UTC + longitudine)
  const utcHours =
    when.getUTCHours() +
    when.getUTCMinutes() / 60 +
    when.getUTCSeconds() / 3600;
  const solarTime = utcHours + longitude / 15;
  const hourAngle = (15 * (solarTime - 12)) * DEG;

  const sinEl =
    Math.sin(lat) * Math.sin(decl) +
    Math.cos(lat) * Math.cos(decl) * Math.cos(hourAngle);

  return (Math.asin(Math.min(1, Math.max(-1, sinEl))) * 180) / Math.PI;
}

/** Prag „soare tare” pentru udat (~45° elevație). */
export const HARSH_SUN_ELEVATION_DEG = 45;

export function getSunState(
  latitude: number,
  longitude: number,
  when: Date = new Date(),
): SunState {
  const elevationDeg = solarElevationDeg(latitude, longitude, when);
  const isDay = elevationDeg > 0;
  const isHarshSun = elevationDeg >= HARSH_SUN_ELEVATION_DEG;

  let evaporateFactor: number;
  if (elevationDeg <= 0) evaporateFactor = 0.35;
  else if (elevationDeg < 20) evaporateFactor = 0.7;
  else if (elevationDeg < HARSH_SUN_ELEVATION_DEG) evaporateFactor = 1.05;
  else evaporateFactor = 1.35 + Math.min(0.35, (elevationDeg - 45) / 80);

  let label: string;
  if (elevationDeg <= -6) label = "Noapte";
  else if (elevationDeg <= 0) label = "Amurg / zori";
  else if (elevationDeg < 20) label = "Soare blând";
  else if (elevationDeg < HARSH_SUN_ELEVATION_DEG) label = "Soare moderat";
  else label = "Soare tare";

  return { elevationDeg, isDay, isHarshSun, evaporateFactor, label };
}

export function formatSunHint(sun: SunState): string {
  const el = sun.elevationDeg.toFixed(0);
  if (sun.isHarshSun) {
    return `${sun.label} (elevație ~${el}°). Mai bine uzi dimineața/seara.`;
  }
  if (!sun.isDay) {
    return `${sun.label} (elevație ~${el}°). Poți uda fără stres de soare.`;
  }
  return `${sun.label} (elevație ~${el}°). Condiții ok pentru udat.`;
}
