import type { ComponentType } from "./types";

export const COMPONENT_ICONS: Record<ComponentType, string> = {
  battery: "🔋",
  led: "💡",
  resistor: "➖",
  switch: "🔘",
  dc_motor: "⚙️",
  potentiometer: "🎚️",
};

export const COMPONENT_COLORS: Record<ComponentType, string> = {
  battery: "#f5c842",
  led: "#e74c3c",
  resistor: "#c4a882",
  switch: "#95a5a6",
  dc_motor: "#3498db",
  potentiometer: "#9b59b6",
};

export const DEFAULT_LABELS: Record<ComponentType, string> = {
  battery: "Baterie",
  led: "LED",
  resistor: "Rezistor",
  switch: "Întrerupător",
  dc_motor: "Motor DC",
  potentiometer: "Potențiometru",
};
