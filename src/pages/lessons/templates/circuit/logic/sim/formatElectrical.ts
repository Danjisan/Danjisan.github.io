export function formatVoltage(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1) return `${v.toFixed(1)} V`;
  if (abs >= 0.001) return `${(v * 1000).toFixed(0)} mV`;
  return `${(v * 1_000_000).toFixed(0)} µV`;
}

export function formatCurrent(a: number): string {
  const abs = Math.abs(a);
  if (abs >= 1) return `${a.toFixed(2)} A`;
  if (abs >= 0.001) return `${(a * 1000).toFixed(1)} mA`;
  return `${(a * 1_000_000).toFixed(0)} µA`;
}

export function formatPower(w: number): string {
  const abs = Math.abs(w);
  if (abs >= 1) return `${w.toFixed(2)} W`;
  if (abs >= 0.001) return `${(w * 1000).toFixed(1)} mW`;
  return `${(w * 1_000_000).toFixed(0)} µW`;
}
