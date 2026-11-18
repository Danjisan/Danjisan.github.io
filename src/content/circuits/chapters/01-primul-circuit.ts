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
/** LED montat invers: desenat întors, ca să se vadă. Fixat pe loc, dar elevul îl poate roti după ce mută firele. */
const LED_REVERSED: BoardPart = { ...LED, locked: "pinned", state: { rotation: 180 } };

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

/* ── Scene din viața reală ──────────────────────────────────────────────
 * Fundalul e desenat de components/CircuitScene.tsx; pozițiile de aici se potrivesc cu desenul
 * și trec testul de așezare (wireLayout.test.ts) pe laptop și pe telefon: fără fire prin piese,
 * fără fire încrucișate, totul în interiorul mesei. Au fost găsite cu o căutare automată.
 *
 * LED-ul are picioarele pe o parte (layout "legs"), − sus și + jos, întors spre unde luminează.
 * De aceea bateria stă deasupra, rezistorul dedesubt, iar întrerupătorul în spate.
 *
 * Piesele sunt „fixate”: nu se mută și nu se șterg, dar elevul le poate roti.
 */
const legs = (rotation: number) => ({ layout: "legs", rotation });

/** Lanterna lui Andrei: lipsește firul dintre rezistor și LED. Butonul din capac e pornit. */
const ANDREI_PARTS: BoardPart[] = [
  { id: "bat", part: "battery-9v", x: 0.47, y: 0.37, locked: "pinned", state: { rotation: 180 } },
  { id: "sw", part: "switch", x: 0.12, y: 0.49, locked: "pinned", state: { on: true, rotation: 90 } },
  { id: "res", part: "resistor-220", x: 0.46, y: 0.67, locked: "pinned", state: { rotation: 180 } },
  { id: "led", part: "led-red", x: 0.78, y: 0.47, locked: "pinned", state: legs(90) },
];
const andreiFull: BoardSetup = {
  scene: "flashlight",
  parts: ANDREI_PARTS,
  wires: [
    ["bat:+", "sw:a"],
    ["sw:b", "res:b"],
    ["res:a", "led:+"],
    ["led:-", "bat:-"],
  ],
};

/** Lampa de veghe a Anei, pe baterii: un fir ocolește întrerupătorul, așa că lampa stă mereu aprinsă. */
const ANA_PARTS: BoardPart[] = [
  { id: "bat", part: "battery-9v", x: 0.28, y: 0.7, locked: "pinned", state: { rotation: 90 } },
  { id: "sw", part: "switch", x: 0.77, y: 0.72, locked: "pinned", state: { on: false, rotation: 270 } },
  { id: "res", part: "resistor-220", x: 0.59, y: 0.46, locked: "pinned", state: { rotation: 90 } },
  { id: "led", part: "led-red", x: 0.53, y: 0.18, locked: "pinned", state: legs(0) },
];
const ANA_WIRES: [string, string][] = [
  ["bat:+", "sw:a"],
  ["sw:b", "res:b"],
  ["res:a", "led:+"],
  ["led:-", "bat:-"],
];

/** Bicicleta lui Mihai: farul în față, LED-ul legat invers. */
const MIHAI_PARTS: BoardPart[] = [
  { id: "bat", part: "battery-9v", x: 0.42, y: 0.29, locked: "pinned", state: { rotation: 270 } },
  { id: "sw", part: "switch", x: 0.17, y: 0.43, locked: "pinned", state: { on: true, rotation: 90 } },
  { id: "res", part: "resistor-220", x: 0.4, y: 0.74, locked: "pinned", state: { rotation: 180 } },
  { id: "led", part: "led-red", x: 0.87, y: 0.38, locked: "pinned", state: legs(90) },
];

/** Lanterna lui Radu: lipsește firul întrerupător → rezistor, iar LED-ul e legat invers. */
const RADU_PARTS: BoardPart[] = [
  { id: "bat", part: "battery-9v", x: 0.45, y: 0.3, locked: "pinned", state: { rotation: 180 } },
  { id: "sw", part: "switch", x: 0.14, y: 0.45, locked: "pinned", state: { on: true, rotation: 90 } },
  { id: "res", part: "resistor-220", x: 0.43, y: 0.65, locked: "pinned" },
  { id: "led", part: "led-red", x: 0.82, y: 0.5, locked: "pinned", state: legs(90) },
];

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
      summary: "Electronii au nevoie de un drum complet, de la {-} la {+}, ca să curgă: un circuit închis.",
      steps: [
        {
          kind: "concept",
          id: "c1-bateria-concept",
          title: "Bateria împinge electronii",
          text:
            "{battery-9v} Bateria împinge electronii prin fire: pleacă din borna {-} și se întorc în borna {+}. Curg doar dacă drumul e complet.",
          aside:
            "La școală vei auzi că „sensul curentului” e de la + la −. E o regulă stabilită înainte să se știe de electroni. Aici vezi chiar electronii, care merg invers: de la − la +.",
          board: noSwitchFull,
        },
        {
          kind: "predict",
          id: "c1-bateria-predict",
          question: "Lipsește firul dintre {led-red} LED și baterie. Se aprinde LED-ul?",
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
          goal: "Leagă firul care lipsește: de la {-} al LED-ului la {-} al bateriei. Atinge o bornă, apoi pe cealaltă.",
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
          question: "Acum lipsește firul dintre {resistor-220} rezistor și LED, nu cel de lângă baterie. Ce face LED-ul?",
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
          story: "🔦 Lanterna lui Andrei nu se aprinde. Toate piesele sunt la locul lor și butonul din capac e pornit, dar ceva nu e în regulă.",
          goal: "Fă lanterna să se aprindă.",
          board: { ...andreiFull, wires: withoutWire(andreiFull.wires, 2), lockedWires: true },
          inventory: [],
          win: [{ is: "led_on" }],
          hints: [
            "Urmărește drumul de la borna {-} a bateriei până la borna {+}. Unde se oprește?",
            "Între rezistor și LED nu e niciun fir.",
          ],
          explain_after:
            "La lanternele adevărate, „firul lipsă” e de obicei un contact desfăcut sau o baterie care nu atinge bine arcul.",
          solution: andreiFull,
        },
      ],
    },

    {
      id: "c1-intrerupator",
      title: "Întrerupătorul",
      difficulty: 1,
      summary: "Întrerupătorul deschide și închide drumul. Dacă un fir îl ocolește, întrerupătorul nu mai are niciun efect.",
      steps: [
        {
          kind: "concept",
          id: "c1-intrerupator-concept",
          title: "Un fir care se deschide",
          text:
            "{switch} Întrerupătorul e un fir care se poate deschide. Deschis, rupe drumul și lumina se stinge. Închis, reface drumul și lumina se aprinde.",
          aside:
            "Atenție la cuvinte: acasă spui „deschid lumina” când o aprinzi. În fizică e invers: întrerupătorul deschis înseamnă drum întrerupt, deci lumina e stinsă.",
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
          goal: "Pune întrerupătorul între {+} al bateriei și rezistor, apoi închide-l.",
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
            "Leagă {+} al bateriei la {A} de la întrerupător, apoi {B} de la întrerupător la rezistor.",
          ],
          explain_after: "Acum întrerupătorul e pe drumul electronilor: când îl deschizi, curentul se oprește în tot circuitul și LED-ul se stinge.",
          solution: seriesOn,
        },
        {
          kind: "fix",
          id: "c1-intrerupator-fix",
          story:
            "💡 Lampa de veghe a Anei, pe baterii, stă mereu aprinsă, orice ar face cu întrerupătorul. Bateriile se termină peste noapte!",
          goal: "Fă în așa fel încât întrerupătorul să aprindă și să stingă LED-ul.",
          board: {
            scene: "nightlamp",
            parts: ANA_PARTS,
            wires: [...ANA_WIRES, ["bat:+", "res:b"]],
          },
          inventory: [],
          win: [{ is: "switch_controls" }],
          hints: [
            "Lumina e aprinsă chiar și cu întrerupătorul deschis. Pe unde ajung electronii, dacă nu prin el?",
            "Un fir merge direct de la {+} al bateriei la rezistor, pe lângă întrerupător. Scoate-l.",
          ],
          explain_after:
            "Firul acela făcea un drum ocolitor: curentul trecea pe lângă întrerupător, deci întrerupătorul nu mai putea opri nimic.",
          solution: { scene: "nightlamp", parts: ANA_PARTS, wires: ANA_WIRES },
        },
      ],
    },

    {
      id: "c1-led-sens",
      title: "LED-ul are sens",
      difficulty: 2,
      summary: "LED-ul lasă curentul să treacă într-un singur sens: {+} spre {+} al bateriei, {-} spre {-}.",
      steps: [
        {
          kind: "concept",
          id: "c1-led-concept",
          title: "Piciorul lung e +",
          text:
            "{led-red} LED-ul lasă curentul să treacă într-un singur sens. Piciorul lung e {+} și merge spre + al bateriei. Pus invers, nu se aprinde.",
          aside:
            "LED vine de la „diodă luminoasă”. O diodă e ca o ușă care se deschide într-o singură direcție. Piciorul scurt al LED-ului e −, iar capsula are o margine teșită pe partea aceea.",
          board: {
            parts: [{ id: "led", part: "led-red", x: 0.5, y: 0.45, locked: true, state: { layout: "legs" } }],
            wires: [],
          },
        },
        {
          kind: "predict",
          id: "c1-led-predict",
          question: "Aici LED-ul e legat invers. Ce se întâmplă când închizi întrerupătorul?",
          board: {
            parts: [BAT, SW_OPEN, RES, LED_REVERSED],
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
            scene: "bike",
            parts: MIHAI_PARTS,
            wires: [
              ["bat:+", "sw:a"],
              ["sw:b", "res:b"],
              ["res:a", "led:-"],
              ["led:+", "bat:-"],
            ],
            allowCrossings: true,
          },
          inventory: [],
          win: [{ is: "led_on" }],
          hints: [
            "Uită-te la semnele de pe bornele LED-ului: {+} și {-}.",
            "{+} al LED-ului trebuie legat spre rezistor (deci spre {+} al bateriei), iar {-} al LED-ului la {-} al bateriei.",
          ],
          explain_after:
            "Pe LED-urile adevărate vezi sensul după picioare (cel lung e {+}) și după marginea teșită a capsulei, care e pe partea {-}.",
          solution: { scene: "bike", parts: MIHAI_PARTS, wires: SERIES_WIRES },
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
            "{resistor-220} Rezistorul frânează curentul. Pus pe același drum cu LED-ul, face ca prin tot circuitul să treacă mai puțin curent, așa că LED-ul nu se mai arde.",
          aside:
            "Cu un rezistor de 220 Ω și o baterie de 9 V, prin LED trec cam 29 mA (miliamperi): destul ca să lumineze, prea puțin ca să se ardă. Electronii merg mai încet în tot circuitul, nu doar prin rezistor.",
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
            "Leagă {B} de la întrerupător la rezistor, apoi rezistorul la {+} de la LED. Abia apoi închide întrerupătorul.",
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
            "Baterie {+} → întrerupător → rezistor → {+} LED, apoi {-} LED → baterie {-}.",
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
            scene: "flashlight",
            parts: RADU_PARTS,
            wires: [
              ["bat:+", "sw:a"],
              ["res:b", "led:-"],
              ["led:+", "bat:-"],
            ],
            allowCrossings: true,
          },
          inventory: [],
          win: [{ is: "led_on" }, { is: "no_failure" }],
          hints: [
            "Urmărește drumul de la bornă la bornă. Lipsește ceva între întrerupător și rezistor?",
            "Și uită-te la LED: e {+} spre {+} și {-} spre {-}?",
          ],
          explain_after: "Ai găsit un fir lipsă și un LED întors — cele mai dese două greșeli la primele circuite.",
          solution: {
            scene: "flashlight",
            parts: RADU_PARTS,
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
  ],
};
