---
name: circuit-electric
description: Architecture and implementation guide for the ColabMe electric circuit lesson template. Use when working on CircuitElectricTemplate.tsx, circuit simulation logic, circuit metadata schema, or any lesson feature involving electronic components (battery, LED, resistor, potentiometer, switch, DC motor, wires).
---

# Template Lecție: Circuit Electric

## Fișier principal

`src/pages/lessons/templates/CircuitElectricTemplate.tsx`

Tipul templateului în DB: `circuit_electric`

## Componente permise în M1

`battery` · `led` · `resistor` · `potentiometer` · `switch` · `dc_motor` · `wire`

Fiecare componentă are un GLB furnizat de Dan. Până la livrarea GLB-urilor, se folosesc placeholder-e vizuale (culoare + etichetă).

## Schema `metadata` JSONB (tabel `lessons`)

```json
{
  "components": ["battery", "switch", "resistor", "led"],
  "challenge": {
    "id": "led-on",
    "description": "Aprinde LED-ul folosind bateria și întrerupătorul.",
    "win_condition": { "type": "component_state", "target": "led", "state": "on" }
  },
  "models": {
    "battery":      { "glb": null, "label": "Baterie 9V" },
    "led":          { "glb": null, "label": "LED roșu" },
    "resistor":     { "glb": null, "label": "Rezistor 220Ω" },
    "switch":       { "glb": null, "label": "Întrerupător" },
    "potentiometer":{ "glb": null, "label": "Potențiometru" },
    "dc_motor":     { "glb": null, "label": "Motor DC" }
  }
}
```

`glb: null` = placeholder activ; înlocuit cu URL Supabase Storage când assetul e livrat.

## Straturi de implementare (nu le amesteca)

| Strat | Conținut | Milestone |
|---|---|---|
| 0 | Viewer static + inventar componente + panou info | M1 |
| 1 | Plasare pe masă + conectare simplă + potențiometru slider | M1 stretch |
| 2 | Simulare graf: LED aprins, motor animat | M2 |
| 3 | Editor profesor + provocări random | M2+ |

**Implementează un strat complet înainte de a începe următorul.**

## Structura de date internă (Strat 1+)

```ts
interface CircuitNode {
  id: string;
  type: ComponentType;
  position: [number, number]; // 2D pe masa de lucru
  state: Record<string, unknown>; // ex: { on: false }, { resistance: 220 }
}

interface CircuitEdge {
  id: string;
  from: { nodeId: string; terminal: "+" | "-" | "a" | "b" };
  to:   { nodeId: string; terminal: "+" | "-" | "a" | "b" };
}

interface CircuitState {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
}
```

Starea circuitului e locală în template (`useState` sau `useReducer`) — nu merge în Supabase sau WebSocket.

## Validare circuit (Strat 1 minim)

Nu simula fizică electrică reală. Validare didactică:
1. Există un path conectat de la `+` baterie la `-` baterie?
2. Componentele din `win_condition` sunt în path și în starea corectă?
3. Întrerupătorul e închis?

Potențiometrul în M1 = slider HTML simplu care modifică `state.resistance` — nu animație 3D.

## NU face în M1

- Simulare curent/tensiune realistă (Ohm, Kirchhoff)
- Editor UI pentru profesori (ei editează direct JSONB în Supabase)
- Generator random de provocări
- Mai mult de o provocare fixă per lecție
- Fire 3D cu fizică — dacă implementezi fire, sunt linii SVG 2D sau `<Line>` drei

## Referință skill 3D

Pentru orice Canvas R3F în acest template, citește skill-ul `web3d-r3f`.
