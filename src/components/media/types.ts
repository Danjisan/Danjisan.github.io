/** Setări per casetă pentru viewerul 3D. Toate au default-uri bune. */
export interface ModelSettings {
  /** Rotire automată lentă până interacționează userul (default: true) */
  autoRotate?: boolean;
  /** Viteza rotirii automate; 2 = o rotație completă în ~30s (default: 0.5) */
  autoRotateSpeed?: number;
  /** Cât de aproape poate da zoom userul (default: 0.5) */
  minDistance?: number;
  /** Cât de departe poate da zoom userul (default: 15) */
  maxDistance?: number;
  /**
   * Padding la auto-încadrare (Bounds). 1 = lipit de margini, >1 mai aerisit,
   * <1 mai zoomat (model mai mare pe ecran). Default: 1.25
   */
  fitMargin?: number;
  /** Poziție cameră inițială [x,y,z]. Default: [2.5, 1.6, 2.5] */
  cameraPosition?: [number, number, number];
  /**
   * Dacă Bounds re-încadrează când se schimbă dimensiunea obiectului.
   * La modele statice lasă false — altfel poate re-zoom-ui la orbită. Default: false
   */
  fitObserve?: boolean;
  /**
   * Bounds `clip` — setează near/far și poate rescrie maxDistance.
   * Default: true (lecții). În grădină: false.
   */
  fitClip?: boolean;
  /** Durata animației de fit (secunde). Default: 1 */
  fitMaxDuration?: number;
  /** Dacă folosește Bounds auto-fit. false = cameră fixă + scale. Default: true */
  autoFit?: boolean;
  /** Scale pe model (util când autoFit e false). Default: 1 */
  modelScale?: number;
  /** FOV cameră. Default: 45 */
  fov?: number;
}

export type MediaContent =
  | { kind: "image"; src: string; alt: string }
  | { kind: "youtube"; videoId: string; title?: string }
  | { kind: "model"; src: string; settings?: ModelSettings };
