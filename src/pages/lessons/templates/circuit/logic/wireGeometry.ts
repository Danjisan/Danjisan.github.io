/** Curbă quadratică pentru fire — coordonate normalizate 0–1 pe masă */
export function wireBezierPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
): string {
  const x1 = from.x * 100;
  const y1 = from.y * 100;
  const x2 = to.x * 100;
  const y2 = to.y * 100;

  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(8, len * 0.22);

  const cx = mx - (dy / len) * bend;
  const cy = my + (dx / len) * bend;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}
