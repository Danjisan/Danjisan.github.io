import type { WinCondition } from "../../../../../content/circuits/chapters/types";
import type { CircuitNode } from "../types";
import { partOfNode } from "./parts";
import type { DcSimulationResult } from "./sim/types";

export interface WinContext {
  nodes: CircuitNode[];
  sim: DcSimulationResult;
  /**
   * Pentru teste: un LED peste curentul maxim se consideră ars (în aplicație arderea vine după
   * `burn_after_s`, din useSimulationBurn).
   */
  overcurrentCountsAsBurned?: boolean;
  /** Re-simulează alte stări ale mesei (ex. cu întrerupătoarele deschise / închise) */
  resimulate?: (nodes: CircuitNode[]) => DcSimulationResult;
}

function withSwitches(nodes: CircuitNode[], on: boolean): CircuitNode[] {
  return nodes.map((n) => (n.type === "switch" ? { ...n, state: { ...n.state, on } } : n));
}

/** `part` dintr-o condiție = id-ul piesei de pe masă SAU id-ul din catalog (ex. "led-red"). */
function matching(nodes: CircuitNode[], type: CircuitNode["type"], part?: string): CircuitNode[] {
  return nodes.filter(
    (n) => n.type === type && (part === undefined || n.id === part || partOfNode(n).id === part),
  );
}

function anyMatching(nodes: CircuitNode[], part: string): CircuitNode[] {
  return nodes.filter((n) => n.id === part || partOfNode(n).id === part);
}

function isBurned(node: CircuitNode, ctx: WinContext): boolean {
  return (
    node.state.burned === true ||
    ctx.sim.burnedLedIds.has(node.id) ||
    (ctx.overcurrentCountsAsBurned === true && ctx.sim.ledOvercurrent.has(node.id))
  );
}

export function checkCondition(cond: WinCondition, ctx: WinContext): boolean {
  const { nodes, sim } = ctx;
  switch (cond.is) {
    case "led_on":
      return matching(nodes, "led", cond.part).some((n) => sim.ledOn.has(n.id) && !isBurned(n, ctx));
    case "led_off": {
      const leds = matching(nodes, "led", cond.part);
      return leds.length > 0 && leds.every((n) => !sim.ledOn.has(n.id) || isBurned(n, ctx));
    }
    case "led_burned":
      return matching(nodes, "led", cond.part).some((n) => isBurned(n, ctx));
    case "motor_running":
      return matching(nodes, "dc_motor", cond.part).some((n) => sim.motorRunning.has(n.id));
    case "current":
      return anyMatching(nodes, cond.part).some((n) => {
        const ma = (sim.readings.get(n.id)?.current_a ?? 0) * 1000;
        return (cond.min_ma === undefined || ma >= cond.min_ma) && (cond.max_ma === undefined || ma <= cond.max_ma);
      });
    case "brighter": {
      const ia = Math.max(0, ...anyMatching(nodes, cond.a).map((n) => (sim.ledOn.has(n.id) ? sim.readings.get(n.id)?.current_a ?? 0 : 0)));
      const ib = Math.max(0, ...anyMatching(nodes, cond.b).map((n) => (sim.ledOn.has(n.id) ? sim.readings.get(n.id)?.current_a ?? 0 : 0)));
      return ia > 0 && ia > ib * 1.15;
    }
    case "no_failure":
      return (
        !sim.shortCircuited &&
        sim.ledOvercurrent.size === 0 &&
        !nodes.some((n) => n.type === "led" && isBurned(n, ctx))
      );
    case "switch_controls": {
      if (!ctx.resimulate || !nodes.some((n) => n.type === "switch")) return false;
      const leds = matching(nodes, "led", cond.led);
      if (leds.length === 0) return false;
      const closed = ctx.resimulate(withSwitches(nodes, true));
      const open = ctx.resimulate(withSwitches(nodes, false));
      return leds.some((n) => closed.ledOn.has(n.id)) && leds.every((n) => !open.ledOn.has(n.id));
    }
    case "max_parts":
      return nodes.filter((n) => n.type !== "wire_junction").length <= cond.count;
  }
}

export function checkWin(conditions: WinCondition[], ctx: WinContext): boolean {
  return conditions.length > 0 && conditions.every((c) => checkCondition(c, ctx));
}
