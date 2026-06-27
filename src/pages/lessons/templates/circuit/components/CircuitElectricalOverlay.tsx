import type { BranchElectricalReading } from "../types";
import { formatCurrent, formatPower, formatVoltage } from "../logic/sim/formatElectrical";

interface CircuitElectricalOverlayProps {
  label: string;
  reading: BranchElectricalReading;
  burned?: boolean;
}

export default function CircuitElectricalOverlay({
  label,
  reading,
  burned = false,
}: CircuitElectricalOverlayProps) {
  return (
    <div className="circuit-electrical-overlay" role="status" aria-live="polite">
      <span className="circuit-electrical-overlay-title">{label}</span>
      {burned ? (
        <span className="circuit-electrical-overlay-burned">ARS</span>
      ) : (
        <dl className="circuit-electrical-overlay-readings">
          <div>
            <dt>U</dt>
            <dd>{formatVoltage(reading.voltage_v)}</dd>
          </div>
          <div>
            <dt>I</dt>
            <dd>{formatCurrent(reading.current_a)}</dd>
          </div>
          <div>
            <dt>P</dt>
            <dd>{formatPower(reading.power_w)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}
