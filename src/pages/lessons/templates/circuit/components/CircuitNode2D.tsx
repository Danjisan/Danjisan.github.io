import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS } from "../constants";
import { getTerminalDefs, isNodeFlipped } from "../logic/terminalPositions";
import type { CircuitNode, CircuitTerminalRef, ComponentModel, TerminalId } from "../types";

function FlipRotateIcon() {
  return (
    <svg className="circuit-node-2d-flip-icon" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M11.2 2.8a5.5 5.5 0 1 0 1.5 5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M12.8 2.8h-2v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface CircuitNode2DProps {
  node: CircuitNode;
  model: ComponentModel;
  selected: boolean;
  dragging?: boolean;
  preview?: boolean;
  readOnly?: boolean;
  ledOn?: boolean;
  motorRunning?: boolean;
  reversedLed?: boolean;
  pendingTerminal: CircuitTerminalRef | null;
  occupiedTerminals: Set<string>;
  onBodyPointerDown?: (e: React.PointerEvent, nodeId: string) => void;
  onRemove?: (nodeId: string) => void;
  onTerminalPointerDown?: (e: React.PointerEvent, nodeId: string, terminal: TerminalId) => void;
  onTerminalPointerUp?: (e: React.PointerEvent, nodeId: string, terminal: TerminalId) => void;
  onSwitchToggle?: (nodeId: string) => void;
  onFlip?: (nodeId: string) => void;
}

export default function CircuitNode2D({
  node,
  model,
  selected,
  dragging = false,
  preview = false,
  readOnly = false,
  ledOn = false,
  motorRunning = false,
  reversedLed = false,
  pendingTerminal,
  occupiedTerminals,
  onBodyPointerDown,
  onRemove,
  onTerminalPointerDown,
  onTerminalPointerUp,
  onSwitchToggle,
  onFlip,
}: CircuitNode2DProps) {
  const switchOn = node.type === "switch" && node.state.on === true;
  const flipped = isNodeFlipped(node);
  const terminals = getTerminalDefs(node);

  return (
    <div
      className={`circuit-node-2d ${selected ? "selected" : ""} ${dragging ? "dragging" : ""} ${preview ? "preview" : ""} ${readOnly ? "readonly" : ""} ${flipped ? "flipped" : ""} ${ledOn ? "led-on" : ""} ${reversedLed ? "led-reversed" : ""} ${motorRunning ? "motor-running" : ""}`}
      style={
        {
          left: `${node.position.x * 100}%`,
          top: `${node.position.y * 100}%`,
          "--comp-color": COMPONENT_COLORS[node.type],
        } as CSSProperties
      }
    >
      <div
        className="circuit-node-2d-body"
        onPointerDown={preview || readOnly ? undefined : (e) => onBodyPointerDown?.(e, node.id)}
      >
        <span className="circuit-node-2d-icon" aria-hidden="true">
          {COMPONENT_ICONS[node.type]}
        </span>
        <span className="circuit-node-2d-label">{model.label}</span>
        {node.type === "switch" && !preview && (
          <button
            type="button"
            className={`circuit-node-2d-badge ${switchOn ? "on" : "off"}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSwitchToggle?.(node.id)}
          >
            {switchOn ? "ÎNCHIS" : "DESCHIS"}
          </button>
        )}
      </div>

      {!preview &&
        terminals.map((term) => {
          const isPending =
            !readOnly &&
            pendingTerminal?.nodeId === node.id &&
            pendingTerminal.terminal === term.id;
          const termKey = `${node.id}:${term.id}`;
          const isOccupied = occupiedTerminals.has(termKey);
          const stateClass = isPending ? "pending" : isOccupied ? "occupied" : "free";
          const termClass = `circuit-terminal circuit-terminal--${stateClass}${readOnly ? " circuit-terminal--readonly" : ""}`;
          const style = {
            left: `calc(50% + ${term.dx * 52}%)`,
            top: `calc(50% + ${term.dy * 52}%)`,
          };
          if (readOnly) {
            return (
              <span
                key={term.id}
                className={termClass}
                style={style}
                data-terminal={term.id}
                aria-hidden="true"
              >
                <span className="circuit-terminal-label">{term.label ?? term.id}</span>
              </span>
            );
          }
          return (
            <button
              key={term.id}
              type="button"
              className={termClass}
              style={style}
              data-circuit-terminal=""
              data-node-id={node.id}
              data-terminal={term.id}
              aria-label={`Terminal ${term.label ?? term.id} ${model.label}${isOccupied ? " — conectat" : ""}`}
              onPointerDown={(e) => onTerminalPointerDown?.(e, node.id, term.id)}
              onPointerUp={(e) => onTerminalPointerUp?.(e, node.id, term.id)}
            >
              <span className="circuit-terminal-label">{term.label ?? term.id}</span>
            </button>
          );
        })}

      {selected && !preview && !readOnly && onFlip && (
        <button
          type="button"
          className="circuit-node-2d-flip"
          aria-label={`Rotește ${model.label}`}
          aria-pressed={flipped}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onFlip(node.id)}
        >
          <FlipRotateIcon />
        </button>
      )}

      {selected && !preview && !readOnly && onRemove && (
        <button
          type="button"
          className="circuit-node-2d-remove"
          aria-label={`Elimină ${model.label} de pe masă`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onRemove(node.id)}
        >
          ×
        </button>
      )}
    </div>
  );
}
