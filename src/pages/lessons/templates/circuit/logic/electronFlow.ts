import type { CSSProperties } from "react";
import { WIRE_CURRENT_EPSILON_A } from "./sim/wireCurrents";

/** Distanța dintre bulinele-electroni pe fir (px); trebuie să bată cu `stroke-dasharray` din CSS. */
export const ELECTRON_SPACING_PX = 14;

/**
 * Viteza bulinelor (px/s) crește cu radical din curent, ca să se vadă clar diferența
 * între 20 mA (LED cu rezistor) și 130 mA (LED fără rezistor), dar un scurtcircuit să nu fie infinit.
 */
export function electronSpeedPxPerS(currentA: number): number {
  const mA = Math.abs(currentA) * 1000;
  return Math.min(260, Math.max(8, 15 * Math.sqrt(mA)));
}

/**
 * Stil pentru animația electronilor pe un fir, sau null dacă nu trece curent.
 * `currentA` e în sens convențional de la începutul firului spre capăt; electronii merg invers.
 * `danger` = ceva din circuit primește prea mult curent (LED peste limită, scurtcircuit) → buline portocalii.
 */
export function electronFlowStyle(
  currentA: number,
  danger = false,
): { style: CSSProperties; hot: boolean } | null {
  if (Math.abs(currentA) < WIRE_CURRENT_EPSILON_A) return null;
  const durationS = ELECTRON_SPACING_PX / electronSpeedPxPerS(currentA);
  return {
    hot: danger,
    style: {
      animationDuration: `${durationS.toFixed(3)}s`,
      // dashoffset descrescător = bulinele merg spre capătul firului; curent convențional pozitiv
      // înseamnă electroni spre începutul firului → animație inversă.
      animationDirection: currentA > 0 ? "reverse" : "normal",
    },
  };
}
