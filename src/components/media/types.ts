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
}

export type MediaContent =
  | { kind: "image"; src: string; alt: string }
  | { kind: "youtube"; videoId: string; title?: string }
  | { kind: "model"; src: string; settings?: ModelSettings };
