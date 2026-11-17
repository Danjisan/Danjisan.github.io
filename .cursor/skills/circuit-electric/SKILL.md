---
name: circuit-electric
description: Architecture and implementation guide for the ColabMe electric circuit lesson template. Use when working on CircuitElectricTemplate.tsx, circuit simulation logic, circuit metadata schema, or any lesson feature involving electronic components (battery, LED, resistor, potentiometer, switch, DC motor, wires).
---

# Template lecție: Circuit electric

Planul de revamp (direcție, schemă de date, pași): **`docs/circuit-revamp.md`** — citește-l înainte de orice schimbare mai mare.
Contextul tehnic detaliat (modele electrice, parametri, fișiere): `.cursor/rules/circuit-electric-context.mdc`.

## Fișiere

| Fișier | Rol |
|---|---|
| `src/pages/lessons/templates/CircuitElectricTemplate.tsx` | orchestrator (template `circuit_electric` în DB) |
| `circuit/logic/sim/` | simulare DC: `netlist.ts` (union-find → noduri), `mnaSolve.ts`, `dcSimulation.ts` |
| `circuit/logic/challengeWin.ts`, `validateCircuit.ts` | condiții de câștig |
| `circuit/electricalDefaults.ts` | parametri impliciți + mesaje de eșec |
| `circuit/parseMetadata.ts` | citește `lessons.metadata` (schema actuală, cu `challenges`) |
| `circuit/logic/directedCircuit.ts` | legacy: doar verificarea „bucla e închisă” și pinii accesibili |

## Ce face simularea (stare actuală)

- **DC real**: Ohm + Kirchhoff prin MNA, valori în V / A / W.
- LED: blocat sub Vf, sursă Vf + R_on când conduce; starea se găsește **iterativ** până e consistentă (corect pentru LED-uri în serie/paralel).
- LED invers, LED ars după `burn_after_s` peste `max_current_a`, scurtcircuit peste `short_circuit_current_a`.
- Motor: rezistență de bobinaj, „merge” peste `min_run_current_a`.
- Potențiometru: două rezistențe a–wiper / wiper–b după `state.value` (0..1).
- Condițiile `component_state` sunt îndeplinite dacă **cel puțin o piesă** de tipul cerut are starea cerută.

## Piese și inventar

- Catalogul: `src/content/circuits/parts.ts` (doar date). Nodul ține `state.partId`; `logic/parts.ts` dă piesa, parametrii (`electricalForNode`) și inventarul (`buildInventory`, `canPlacePart`).
- Parametrii = valorile tipului din lecție + ce suprascrie piesa. Piesele implicite nu suprascriu nimic.
- Desenele: `components/ComponentIcon.tsx` (SVG; LED colorat după piesă, benzi de rezistor după valoare).
- Electronii pe fire: `logic/sim/wireCurrents.ts` (curent per fir) + `logic/electronFlow.ts` (viteză/sens).
- Solverul are GMIN (`mnaSolve.ts`) ca piesele nelegate să nu facă matricea singulară; LED-ul blocat (`OPEN_RESISTANCE`) trebuie să rămână mult mai conductiv decât GMIN.

## Limitări cunoscute (rezolvate în pașii din `docs/circuit-revamp.md`)

- Progresul provocărilor se ține doar local; finalizarea lecției e manuală.
- Firele sunt linii drepte și pot trece peste piese.

## Reguli de lucru

- Schema de date pentru piese / niveluri / circuite: **date simple, JSON-serializabile**, ca mai târziu să poată veni din DB sau de la useri.
- Orice schimbare în `logic/sim/` vine cu test în `logic/sim/__tests__/` (rulează `npm test`).
- Editorul de schemă rămâne 2D; 3D doar pentru vederi separate (ansamblu / roboței), mai târziu.
- Starea circuitului e locală în template; nu trece prin WebSocket.
- Pentru orice Canvas R3F, citește skill-ul `web3d-r3f`.
