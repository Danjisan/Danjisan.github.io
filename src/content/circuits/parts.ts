/**
 * Catalogul de piese pentru circuite.
 *
 * Doar date (fără funcții), ca mai târziu să poată veni din baza de date sau de la useri
 * (vezi docs/circuit-revamp.md, „Catalogul de piese”).
 *
 * - `type` spune simulatorului ce comportament are piesa.
 * - `electrical` suprascrie doar ce diferă față de valorile tipului (din lecție sau implicite).
 *   Piesele „implicite” n-au `electrical`, deci se comportă exact ca înainte de catalog.
 * - `price` (lei virtuali) și `unlock` vor fi folosite de exercițiile cu buget și de atelier.
 */

import type { ComponentElectricalByType, ComponentType } from "../../pages/lessons/templates/circuit/types";

export interface PartDef<T extends ComponentType = ComponentType> {
  id: string;
  type: T;
  /** Lipsă = eticheta tipului din lecție (ex. „Rezistor 220Ω”) */
  label?: string;
  electrical?: Partial<ComponentElectricalByType[T]>;
  /** Culoarea LED-ului, pentru desen */
  color?: "red" | "green" | "yellow" | "blue";
  price: number;
  /** Id-ul mini-lecției care o deblochează în atelier; lipsă = disponibilă de la început */
  unlock?: { after: string };
}

type AnyPart = { [T in ComponentType]: PartDef<T> }[ComponentType];

export const PARTS: AnyPart[] = [
  // Baterii
  { id: "battery-9v", type: "battery", price: 6 },
  {
    id: "battery-4v5",
    type: "battery",
    label: "Baterie 4,5V",
    electrical: { voltage_v: 4.5, internal_resistance_ohm: 1 },
    price: 4,
  },

  // LED-uri (tensiunea de deschidere crește de la roșu la albastru)
  { id: "led-red", type: "led", color: "red", price: 1 },
  {
    id: "led-yellow",
    type: "led",
    label: "LED galben",
    color: "yellow",
    electrical: { forward_voltage_v: 2.1 },
    price: 1,
  },
  {
    id: "led-green",
    type: "led",
    label: "LED verde",
    color: "green",
    electrical: { forward_voltage_v: 2.2 },
    price: 1,
  },
  {
    id: "led-blue",
    type: "led",
    label: "LED albastru",
    color: "blue",
    electrical: { forward_voltage_v: 3 },
    price: 2,
  },

  // Rezistoare
  { id: "resistor-220", type: "resistor", price: 1 },
  {
    id: "resistor-100",
    type: "resistor",
    label: "Rezistor 100Ω",
    electrical: { resistance_ohm: 100 },
    price: 1,
  },
  {
    id: "resistor-1k",
    type: "resistor",
    label: "Rezistor 1kΩ",
    electrical: { resistance_ohm: 1000 },
    price: 1,
  },

  // Restul
  { id: "switch", type: "switch", price: 2 },
  { id: "dc-motor", type: "dc_motor", price: 8 },
  { id: "pot-10k", type: "potentiometer", price: 3 },
  { id: "junction", type: "wire_junction", price: 0 },
];

/** Piesa folosită când lecția cere doar un tip (ex. `required_types: ["resistor"]`). */
export const DEFAULT_PART_BY_TYPE: Record<ComponentType, string> = {
  battery: "battery-9v",
  led: "led-red",
  resistor: "resistor-220",
  switch: "switch",
  dc_motor: "dc-motor",
  potentiometer: "pot-10k",
  wire_junction: "junction",
};
