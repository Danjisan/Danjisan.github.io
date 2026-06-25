import type { ComponentModel } from "../types";

interface ComponentInfoBubbleProps {
  model: ComponentModel;
  potentiometerValue?: number;
  onPotentiometerChange?: (value: number) => void;
}

export default function ComponentInfoBubble({
  model,
  potentiometerValue,
  onPotentiometerChange,
}: ComponentInfoBubbleProps) {
  const { info } = model;
  const tip = info.tips[0];

  return (
    <div
      className="circuit-node-info-bubble"
      role="tooltip"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <p className="circuit-node-info-bubble-title">{model.label}</p>
      {info.summary && <p className="circuit-node-info-bubble-text">{info.summary}</p>}
      {tip && <p className="circuit-node-info-bubble-tip">💡 {tip}</p>}

      {onPotentiometerChange && potentiometerValue !== undefined && (
        <label className="circuit-node-info-bubble-pot">
          <span>Variație: {Math.round(potentiometerValue * 100)}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(potentiometerValue * 100)}
            onChange={(e) => onPotentiometerChange(Number(e.target.value) / 100)}
          />
        </label>
      )}
    </div>
  );
}
