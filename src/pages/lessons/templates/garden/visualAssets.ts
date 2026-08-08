import type { SpeciesId } from "./species";

/**
 * Mapare vizuală: growth_progress → GLB.
 * Adaugi etape intermediare aici fără a schimba simularea.
 * `ready: false` = încă emoji placeholder.
 */
export interface VisualLod {
  /** Prag minim inclusiv (0..1) */
  min: number;
  /** Path public (Vite) sau URL Storage */
  glb: string;
  /** true când fișierul există și e OK pe web */
  ready: boolean;
  label?: string;
}

const FASOLE_VISUAL: VisualLod[] = [
  {
    min: 0,
    glb: "/garden/fasole/fasole_seed.glb",
    ready: true,
    label: "Sămânță",
  },
  {
    min: 0.05,
    glb: "/garden/fasole/fasole_germ.glb",
    ready: false,
    label: "Germinare",
  },
  {
    min: 0.2,
    glb: "/garden/fasole/fasole_sprout.glb",
    ready: false,
    label: "Răsad",
  },
  {
    min: 0.45,
    glb: "/garden/fasole/fasole_grow.glb",
    ready: false,
    label: "Creștere",
  },
  {
    min: 0.7,
    glb: "/garden/fasole/fasole_flower.glb",
    ready: false,
    label: "Înflorire",
  },
  {
    min: 0.95,
    glb: "/garden/fasole/fasole_mature.glb",
    ready: false,
    label: "Matură",
  },
];

const BY_SPECIES: Partial<Record<SpeciesId, VisualLod[]>> = {
  fasole: FASOLE_VISUAL,
};

/** Alege LOD-ul cu cel mai mare `min` ≤ progress. */
export function pickVisualLod(
  speciesId: SpeciesId,
  progress: number,
): VisualLod | null {
  const list = BY_SPECIES[speciesId];
  if (!list?.length) return null;
  const p = Math.max(0, Math.min(1, progress));
  let chosen = list[0];
  for (const lod of list) {
    if (p >= lod.min) chosen = lod;
  }
  return chosen;
}

/** GLB de afișat, sau null → placeholder emoji. */
export function resolvePlantGlb(
  speciesId: SpeciesId,
  progress: number,
): string | null {
  const lod = pickVisualLod(speciesId, progress);
  if (!lod?.ready) return null;
  return lod.glb;
}
