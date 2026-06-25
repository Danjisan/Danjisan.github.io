/** Linie dreaptă între două puncte (px în viewBox-ul mesei) */
export function wireLinePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}
