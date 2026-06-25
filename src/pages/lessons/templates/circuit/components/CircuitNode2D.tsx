import type { CSSProperties } from "react";
import { COMPONENT_COLORS, COMPONENT_ICONS, COMPONENT_TERMINALS } from "../constants";
import type { CircuitNode, CircuitTerminalRef, ComponentModel, TerminalId } from "../types";

interface CircuitNode2DProps {
  node: CircuitNode;
  model: ComponentModel;
  selected: boolean;
  dragging?: boolean;
  preview?: boolean;
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
}

export default function CircuitNode2D({
  node,
  model,
  selected,
  dragging = false,
  preview = false,
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
}: CircuitNode2DProps) {
  const switchOn = node.type === "switch" && node.state.on === true;
  const terminals = COMPONENT_TERMINALS[node.type];

  return (
    <div
      className={`circuit-node-2d ${selected ? "selected" : ""} ${dragging ? "dragging" : ""} ${preview ? "preview" : ""} ${ledOn ? "led-on" : ""} ${reversedLed ? "led-reversed" : ""} ${motorRunning ? "motor-running" : ""}`}
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
        onPointerDown={preview ? undefined : (e) => onBodyPointerDown?.(e, node.id)}
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
            pendingTerminal?.nodeId === node.id && pendingTerminal.terminal === term.id;
          const termKey = `${node.id}:${term.id}`;
          const isOccupied = occupiedTerminals.has(termKey);
          const stateClass = isPending ? "pending" : isOccupied ? "occupied" : "free";
          return (
            <button
              key={term.id}
              type="button"
              className={`circuit-terminal circuit-terminal--${stateClass}`}
              style={{
                left: `calc(50% + ${term.dx * 52}%)`,
                top: `calc(50% + ${term.dy * 52}%)`,
              }}
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

      {selected && !preview && onRemove && (
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
