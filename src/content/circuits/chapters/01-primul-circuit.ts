import type { BoardPart, BoardSetup, Chapter } from "./types";

/*
 * Capitolul 1 — „Primul circuit”.
 * Piese: baterie 9V, întrerupător, rezistor 220 Ω, LED roșu.
 * Textele: fizică de gimnaziu, verificate de noi; urmează revizia unui profesor.
 *
 * Așezare comună pe masă (bucla în serie, în sensul acelor de ceasornic):
 *   baterie (sus-stânga) → întrerupător (sus-dreapta) → rezistor (jos-dreapta) → LED (jos-stânga) → baterie
 */

const BAT: BoardPart = { id: "bat", part: "battery-9v", x: 0.22, y: 0.22, locked: true };
const SW_OPEN: BoardPart = { id: "sw", part: "switch", x: 0.62, y: 0.22, locked: true, state: { on: false } };
const SW_ON: BoardPart = { ...SW_OPEN, state: { on: true } };
const RES: BoardPart = { id: "res", part: "resistor-220", x: 0.72, y: 0.68, locked: true };
const LED: BoardPart = { id: "led", part: "led-red", x: 0.32, y: 0.68, locked: true };

/** Fără întrerupător: baterie → rezistor → LED → baterie */
const RES_TOP: BoardPart = { ...RES, x: 0.7, y: 0.3 };
const LED_LOW: BoardPart = { ...LED, x: 0.45, y: 0.72 };
const NO_SWITCH_WIRES: [string, string][] = [
  ["bat:+", "res:a"],
  ["res:b", "led:+"],
  ["led:-", "bat:-"],
];

const SERIES_WIRES: [string, string][] = [
  ["bat:+", "sw:a"],
  ["sw:b", "res:b"],
  ["res:a", "led:+"],
  ["led:-", "bat:-"],
];

const withoutWire = (wires: [string, string][], i: number) => wires.filter((_, k) => k !== i);

const noSwitchFull: BoardSetup = { parts: [BAT, RES_TOP, LED_LOW], wires: NO_SWITCH_WIRES };
const noSwitchMissingLast: BoardSetup = { parts: [BAT, RES_TOP, LED_LOW], wires: withoutWire(NO_SWITCH_WIRES, 2) };
const seriesOn: BoardSetup = { parts: [BAT, SW_ON, RES, LED], wires: SERIES_WIRES };

export const CHAPTER_01: Chapter = {
  id: "01-primul-circuit",
  title: "Primul circuit",
  intro:
    "Afli ce face bateria, de ce curentul are nevoie de un drum complet și cum aprinzi un LED fără să-l arzi.",
  lessons: [
    {
      id: "c1-bateria",
      title: "Ce face bateria",
      difficulty: 1,
      summary: "Electronii au nevoie de un drum complet, de la − la +, ca să curgă: un circuit închis.",
      steps: [
        {
          kind: "concept",
          id: "c1-bateria-concept",
          title: "Bateria împinge electronii",
          text:
            "Bateria are două borne: + și −. Ea împinge electronii, niște particule foarte mici din fire: pleacă din borna −, trec prin fire și prin piese și ajung la borna +. Ca să curgă, au nevoie de un drum complet, fără întreruperi.\n\nLa școală vei auzi că „sensul curentului” e de la + la −. E o convenție stabilită înainte să se știe de electroni. Aici vezi chiar electronii, deci îi vei vedea mergând de la − la +.",
          board: noSwitchFull,
        },
        {
          kind: "predict",
          id: "c1-bateria-predict",
          question: "Lipsește firul dintre LED și baterie. Se aprinde LED-ul?",
          board: noSwitchMissingLast,
          options: [
            { text: "Da, bateria e legată la rezistor și la LED." },
            { text: "Nu, drumul nu e complet.", correct: true },
          ],
          explain_after:
            "Electronii nu au pe unde să se întoarcă la baterie, așa că nu pornesc deloc. Nici prin firele legate nu curge nimic.",
        },
        {
          kind: "try",
          id: "c1-bateria-try",
          goal: "Leagă firul care lipsește: de la − al LED-ului la − al bateriei. Atinge un terminal, apoi pe celălalt.",
          board: { ...noSwitchMissingLast, lockedWires: true },
          allow: ["add_wire"],
          win: [{ is: "led_on" }],
          explain_after:
            "Acum drumul e complet: ăsta e un circuit închis. Electronii curg în același timp prin toate firele, nu „pleacă” abia când îi împinge bateria.",
          solution: noSwitchFull,
        },
      ],
    },

    {
      id: "c1-inchis-deschis",
      title: "Circuit închis, circuit deschis",
      difficulty: 1,
      summary: "Dacă drumul se întrerupe oriunde, curentul se oprește peste tot: circuit deschis.",
      steps: [
        {
          kind: "try",
          id: "c1-deschis-try",
          goal: "Scoate oricare fir: atinge-l, apoi apasă ×.",
          board: noSwitchFull,
          allow: ["remove_wire"],
          win: [{ is: "led_off" }],
          explain_after: "Un singur fir lipsă e de ajuns: circuitul e deschis și electronii se opresc peste tot.",
          solution: { ...noSwitchFull, wires: withoutWire(NO_SWITCH_WIRES, 0) },
        },
        {
          kind: "predict",
          id: "c1-deschis-predict",
          question: "Acum lipsește firul dintre rezistor și LED, nu cel de lângă baterie. Ce face LED-ul?",
          board: { ...noSwitchFull, wires: withoutWire(NO_SWITCH_WIRES, 1) },
          options: [
            { text: "Rămâne aprins, pentru că e încă legat la baterie." },
            { text: "Se stinge: oricare fir ai scoate, drumul se întrerupe.", correct: true },
            { text: "Luminează mai slab." },
          ],
          explain_after:
            "Când există un singur drum (piesele sunt în serie), orice întrerupere oprește curentul în tot circuitul.",
        },
        {
          kind: "fix",
          id: "c1-deschis-fix",
          story: "🔦 Lanterna lui Andrei nu se aprinde. Toate piesele sunt la locul lor, dar ceva nu e în regulă.",
          goal: "Fă lanterna să se aprindă.",
          board: { ...noSwitchFull, wires: withoutWire(NO_SWITCH_WIRES, 1), lockedWires: true },
          inventory: [],
          win: [{ is: "led_on" }],
          hints: [
            "Urmărește drumul de la borna − a bateriei până la borna +. Unde se oprește?",
            "Între rezistor și LED nu e niciun fir.",
          ],
          explain_after:
            "La lanternele adevărate, „firul lipsă” e de obicei un contact desfăcut sau o baterie care nu atinge bine arcul.",
          solution: noSwitchFull,
        },
      ],
    },

    {
      id: "c1-intrerupator",
      title: "Întrerupătorul",
      difficulty: 1,
      summary: "Întrerupătorul deschide și închide drumul. Dacă un fir îl ocolește, nu mai comandă nimic.",
      steps: [
        {
          kind: "concept",
          id: "c1-intrerupator-concept",
          title: "Un fir care se deschide",
          text:
            "Întrerupătorul e ca un fir pe care îl poți deschide și închide. Deschis, rupe drumul: circuit deschis. Închis, îl reface: circuit închis. Așa aprinzi lumina fără să scoți fire.",
        },
        {
          kind: "try",
          id: "c1-intrerupator-try",
          goal: "Închide întrerupătorul: apasă pe eticheta DESCHIS.",
          board: { parts: [BAT, SW_OPEN, RES, LED], wires: SERIES_WIRES, lockedWires: true },
          allow: ["toggle_switch"],
          win: [{ is: "led_on" }],
          explain_after: "Pârghia atinge acum contactul și drumul e complet. Deschide-l la loc dacă vrei să vezi electronii oprindu-se.",
          solution: seriesOn,
        },
        {
          kind: "build",
          id: "c1-intrerupator-build",
          goal: "Pune întrerupătorul între + al bateriei și rezistor, apoi închide-l.",
          board: {
            parts: [BAT, RES, LED],
            wires: [
              ["res:a", "led:+"],
              ["led:-", "bat:-"],
            ],
            lockedWires: true,
          },
          inventory: [{ part: "switch", count: 1 }],
          win: [{ is: "switch_controls" }, { is: "led_on" }],
          hints: [
            "Trage întrerupătorul din inventar pe masă.",
            "Leagă + al bateriei la A de la întrerupător, apoi B de la întrerupător la rezistor.",
          ],
          explain_after: "Întrerupătorul e acum pe singurul drum al electronilor, deci îl comandă complet.",
          solution: seriesOn,
        },
        {
          kind: "fix",
          id: "c1-intrerupator-fix",
          story:
            "💡 Ana a montat un întrerupător pentru lumina din cameră. Doar că lumina stă mereu aprinsă, orice ar face cu întrerupătorul.",
          goal: "Fă în așa fel încât întrerupătorul să aprindă și să stingă LED-ul.",
          board: {
            parts: [BAT, SW_OPEN, { ...RES, x: 0.75, y: 0.62 }, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["sw:b", "res:a"],
              ["bat:+", "res:a"],
              ["res:b", "led:+"],
              ["led:-", "bat:-"],
            ],
          },
          inventory: [],
          win: [{ is: "switch_controls" }],
          hints: [
            "Lumina e aprinsă chiar și cu întrerupătorul deschis. Pe unde ajung electronii, dacă nu prin el?",
            "Un fir merge direct de la + al bateriei la rezistor, pe lângă întrerupător. Scoate-l.",
          ],
          explain_after:
            "Firul acela făcea un drum ocolitor: curentul trecea pe lângă întrerupător. La instalațiile adevărate, așa ceva se repară doar de electrician, cu curentul oprit!",
          solution: {
            parts: [BAT, SW_OPEN, { ...RES, x: 0.75, y: 0.62 }, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["sw:b", "res:a"],
              ["res:b", "led:+"],
              ["led:-", "bat:-"],
            ],
          },
        },
      ],
    },

    {
      id: "c1-led-sens",
      title: "LED-ul are sens",
      difficulty: 2,
      summary: "LED-ul lasă curentul să treacă într-un singur sens: + spre + al bateriei, − spre −.",
      steps: [
        {
          kind: "concept",
          id: "c1-led-concept",
          title: "Piciorul lung e +",
          text:
            "LED-ul e o diodă care luminează. O diodă lasă curentul să treacă doar într-un sens. Piciorul mai lung al LED-ului e + și trebuie să ajungă (prin restul circuitului) la + al bateriei; piciorul scurt e − și merge spre −. Pus invers, LED-ul nu se aprinde.",
        },
        {
          kind: "predict",
          id: "c1-led-predict",
          question: "Aici LED-ul e legat invers. Ce se întâmplă când închizi întrerupătorul?",
          board: {
            parts: [BAT, SW_OPEN, RES, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["sw:b", "res:b"],
              ["res:a", "led:-"],
              ["led:+", "bat:-"],
            ],
          },
          options: [
            { text: "Se aprinde normal." },
            { text: "Nu se aprinde.", correct: true },
            { text: "Se arde." },
          ],
          explain_after:
            "Prin LED-ul întors nu trece curent. Și fiindcă e un singur drum, nu trece curent nici prin restul circuitului: electronii stau pe loc.",
        },
        {
          kind: "fix",
          id: "c1-led-fix",
          story: "🚲 Luminița de la bicicleta lui Mihai nu merge, deși toate firele sunt legate și bateria e nouă.",
          goal: "Fă luminița să meargă.",
          board: {
            parts: [BAT, SW_ON, RES, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["sw:b", "res:b"],
              ["res:a", "led:-"],
              ["led:+", "bat:-"],
            ],
          },
          inventory: [],
          win: [{ is: "led_on" }],
          hints: [
            "Uită-te la semnele de pe terminalele LED-ului: + și −.",
            "+ al LED-ului trebuie legat spre rezistor (deci spre + al bateriei), iar − al LED-ului la − al bateriei.",
          ],
          explain_after:
            "Pe LED-urile adevărate vezi sensul după picioare (cel lung e +) și după marginea teșită a capsulei, care e pe partea −.",
          solution: seriesOn,
        },
      ],
    },

    {
      id: "c1-rezistor",
      title: "De ce rezistor?",
      difficulty: 2,
      summary: "Rezistorul limitează curentul din tot circuitul și protejează LED-ul.",
      steps: [
        {
          kind: "predict",
          id: "c1-rezistor-predict",
          question: "Aici LED-ul e legat la baterie fără rezistor. Ce se întâmplă când închizi întrerupătorul?",
          board: {
            parts: [BAT, SW_OPEN, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["sw:b", "led:+"],
              ["led:-", "bat:-"],
            ],
          },
          options: [
            { text: "Se aprinde normal și rămâne așa." },
            { text: "Se aprinde foarte tare, apoi se arde.", correct: true },
            { text: "Nu se aprinde deloc." },
          ],
          explain_after:
            "Fără nimic care să limiteze curentul, prin LED trec peste 100 mA, deși el suportă doar câteva zeci. Se încălzește și se arde. Ai văzut cât de repede (și portocalii) mergeau electronii?",
        },
        {
          kind: "concept",
          id: "c1-rezistor-concept",
          title: "Rezistorul limitează curentul",
          text:
            "Rezistorul se opune trecerii curentului. Pus pe același drum cu LED-ul, face ca prin tot circuitul să treacă mai puțin curent. De aceea electronii merg mai încet peste tot, nu doar prin rezistor.\n\nCu un rezistor de 220 Ω și o baterie de 9 V, prin LED trec cam 29 mA: destul ca să lumineze, prea puțin ca să se ardă.",
          board: seriesOn,
        },
        {
          kind: "build",
          id: "c1-rezistor-build",
          goal: "Pune rezistorul între întrerupător și LED, apoi închide întrerupătorul. LED-ul trebuie să lumineze fără să se ardă.",
          board: {
            parts: [BAT, SW_OPEN, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["led:-", "bat:-"],
            ],
            lockedWires: true,
          },
          inventory: [{ part: "resistor-220", count: 1 }],
          win: [{ is: "led_on" }, { is: "no_failure" }],
          hints: [
            "Trage rezistorul pe masă, între întrerupător și LED.",
            "Leagă B de la întrerupător la rezistor, apoi rezistorul la + de la LED. Abia apoi închide întrerupătorul.",
          ],
          explain_after: "LED-ul luminează și nu se încălzește: rezistorul ține curentul în limite sigure.",
          solution: seriesOn,
        },
      ],
    },

    {
      id: "c1-singur",
      title: "Construiește singur",
      difficulty: 3,
      summary: "Poți construi un circuit complet: sursă, întrerupător, rezistor de protecție și consumator.",
      unlocksParts: ["battery-9v", "switch", "resistor-220", "led-red"],
      steps: [
        {
          kind: "build",
          id: "c1-singur-build",
          goal:
            "Construiește o lanternă: baterie, întrerupător, rezistor și LED. Întrerupătorul trebuie să o aprindă și să o stingă, iar LED-ul să nu se ardă.",
          inventory: [
            { part: "battery-9v", count: 1 },
            { part: "switch", count: 1 },
            { part: "resistor-220", count: 1 },
            { part: "led-red", count: 1 },
          ],
          win: [{ is: "switch_controls" }, { is: "led_on" }, { is: "no_failure" }],
          hints: [
            "Toate piesele stau pe un singur drum, una după alta.",
            "Baterie + → întrerupător → rezistor → + LED, apoi − LED → baterie −.",
          ],
          help: "show_solution",
          explain_after: "Asta e schema oricărei lanterne: sursă, întrerupător, rezistor de protecție și consumator.",
          solution: seriesOn,
        },
        {
          kind: "fix",
          id: "c1-singur-fix",
          story:
            "🔦 Radu și-a făcut singur o lanternă, dar nu se aprinde. A verificat bateria: e bună. Se pare că a greșit două lucruri.",
          goal: "Găsește ambele greșeli și fă lanterna să meargă.",
          board: {
            parts: [BAT, SW_ON, RES, LED],
            wires: [
              ["bat:+", "sw:a"],
              ["res:a", "led:-"],
              ["led:+", "bat:-"],
            ],
          },
          inventory: [],
          win: [{ is: "led_on" }, { is: "no_failure" }],
          hints: [
            "Urmărește drumul de la bornă la bornă. Lipsește ceva între întrerupător și rezistor?",
            "Și uită-te la LED: e + spre + și − spre −?",
          ],
          explain_after: "Ai găsit un fir lipsă și un LED întors — cele mai dese două greșeli la primele circuite.",
          solution: seriesOn,
        },
      ],
    },
  ],
};
