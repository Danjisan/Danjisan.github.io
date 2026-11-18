/**
 * Forma firelor: curbe care pleacă din bornă spre exteriorul piesei, apoi se întorc spre destinație
 * (ca în programele de scheme). Așa un fir legat la o bornă din dreapta nu trece înapoi prin propria piesă.
 *
 * Aceeași geometrie e folosită la desen și în testul care verifică să nu treacă fire prin piese.
 */

export interface Point {
  x: number;
  y: number;
}

/** (0,0) = fără direcție (ex. capătul liber al unui fir în curs de tragere) */
export type Direction = Point;

export interface WireCurve {
  p0: Point;
  c1: Point;
  c2: Point;
  p3: Point;
}

/** Cât de departe „iese” firul din bornă înainte să se curbeze (px). */
function reach(from: Point, to: Point): number {
  const d = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.min(110, Math.max(28, d * 0.45));
}

export function wireCurve(from: Point, fromDir: Direction, to: Point, toDir: Direction): WireCurve {
  const k = reach(from, to);
  return {
    p0: from,
    c1: { x: from.x + fromDir.x * k, y: from.y + fromDir.y * k },
    c2: { x: to.x + toDir.x * k, y: to.y + toDir.y * k },
    p3: to,
  };
}

export function wirePathD(c: WireCurve): string {
  return `M ${c.p0.x} ${c.p0.y} C ${c.c1.x} ${c.c1.y} ${c.c2.x} ${c.c2.y} ${c.p3.x} ${c.p3.y}`;
}

/** Punct pe curbă, t ∈ [0, 1]. */
export function pointOnWire(c: WireCurve, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const d = 3 * u * t * t;
  const e = t * t * t;
  return {
    x: a * c.p0.x + b * c.c1.x + d * c.c2.x + e * c.p3.x,
    y: a * c.p0.y + b * c.c1.y + d * c.c2.y + e * c.p3.y,
  };
}

/** Linie dreaptă (folosită când nu se știe direcția niciunui capăt). */
export function wireLinePath(from: Point, to: Point): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}
