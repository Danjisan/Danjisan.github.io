import { useEffect, useRef } from "react";
import { electricalFor } from "../logic/sim/electricalFor";
import type { CircuitElectricMetadata, CircuitNode } from "../types";
import type { DcSimulationResult } from "../logic/sim/types";

const TICK_MS = 100;

export function useSimulationBurn(
  simulation: DcSimulationResult,
  nodes: CircuitNode[],
  models: CircuitElectricMetadata["models"],
  onBurnLed: (nodeId: string) => void,
  onFailureMessage: (message: string) => void,
  simulationConfig: CircuitElectricMetadata["simulation"],
) {
  const overcurrentMs = useRef(new Map<string, number>());
  const reportedShort = useRef(false);

  useEffect(() => {
    if (simulation.shortCircuited && !reportedShort.current) {
      reportedShort.current = true;
      const i = simulation.batteryCurrent_a;
      onFailureMessage(
        `${simulationConfig.failure_messages.short_circuit} (${(i * 1000).toFixed(0)} mA măsurat)`,
      );
    }
    if (!simulation.shortCircuited) {
      reportedShort.current = false;
    }
  }, [simulation.shortCircuited, simulation.batteryCurrent_a, simulationConfig, onFailureMessage]);

  useEffect(() => {
    const active = new Set(simulation.ledOvercurrent.keys());
    for (const key of overcurrentMs.current.keys()) {
      if (!active.has(key)) overcurrentMs.current.delete(key);
    }
  }, [simulation.ledOvercurrent]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      for (const [ledId, { current_a, max_a }] of simulation.ledOvercurrent) {
        const node = nodes.find((n) => n.id === ledId);
        if (!node || node.state.burned === true) continue;

        const burnAfterS = electricalFor(models, "led").burn_after_s;
        const prev = overcurrentMs.current.get(ledId) ?? 0;
        const next = prev + TICK_MS;
        overcurrentMs.current.set(ledId, next);

        if (next >= burnAfterS * 1000) {
          overcurrentMs.current.delete(ledId);
          onBurnLed(ledId);
          onFailureMessage(
            `${simulationConfig.failure_messages.led_burned} (${(current_a * 1000).toFixed(0)} mA > ${(max_a * 1000).toFixed(0)} mA max)`,
          );
        }
      }
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [simulation.ledOvercurrent, nodes, models, onBurnLed, onFailureMessage, simulationConfig]);
}
