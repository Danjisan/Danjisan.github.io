import type { BranchElectricalReading, SimulationFailureKind } from "../../types";

export interface ResistorStamp {
  kind: "resistor";
  n1: number;
  n2: number;
  ohms: number;
  componentId: string;
}

export interface VoltageStamp {
  kind: "vsource";
  nPositive: number;
  nNegative: number;
  volts: number;
  componentId: string;
}

export type CircuitStamp = ResistorStamp | VoltageStamp;

export interface BuiltNetlist {
  stamps: CircuitStamp[];
  pinToNode: Map<string, number>;
  groundNode: number;
  nodeCount: number;
}

export interface MnaSolution {
  nodeVoltages: number[];
  sourceCurrents: number[];
  /** componentId → curent prin element (A), semn convenție stamp */
  branchCurrents: Map<string, number>;
}

export interface DcSimulationResult {
  isClosed: boolean;
  ledOn: Set<string>;
  motorRunning: Set<string>;
  reversedLedIds: Set<string>;
  burnedLedIds: Set<string>;
  overcurrentLedIds: Set<string>;
  shortCircuited: boolean;
  batteryCurrent_a: number;
  hints: string[];
  readings: Map<string, BranchElectricalReading>;
  /** LED-uri cu I > I_max acum — pentru timer burn */
  ledOvercurrent: Map<string, { current_a: number; max_a: number }>;
  /** Evenimente noi de afișat după eșec */
  newFailures: SimulationFailureKind[];
}
