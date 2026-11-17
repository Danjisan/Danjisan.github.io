# Circuite — pasul 2: capitole, mini-lecții, pași

> Propunere din 2026-11-17. Status: **aprobată și implementată (2a–2d)**; lecția nouă se activează cu `colabme-server/supabase/migrations/20261117_circuit_chapter_01.sql`. Continuă `docs/circuit-revamp.md` (secțiunile 1, 2, 4, 5).

## Ideea de bază: întâi te uiți, apoi schimbi, apoi construiești

Ca să nu fie nici greu de la început, nici plictisitor, fiecare mini-lecție urmează aceeași curbă:

1. **Prezice** — vezi un circuit gata făcut și ghicești ce se va întâmpla („Se aprinde LED-ul?”).
2. **Încearcă** — apeși tu (întrerupător, rotești LED-ul, scoți un fir) și vezi dacă ai ghicit. Electronii pe fire arată de ce.
3. **Modifică** — schimbi ceva într-un circuit aproape gata (adaugi o piesă, legi ultimul fir).
4. **Construiește** — faci singur circuitul, de la zero, din inventar.
5. **Repară** (scenariu real) — „Lanterna nu merge. De ce?” Primești un circuit stricat și îl repari.

Nu fiecare mini-lecție are toți cei 5 pași; primele sunt mai mult 1–3, ultimele mai mult 4–5. Fiecare pas durează sub un minut, o mini-lecție ~3–5 minute.

„Arată-mi cum” apare **doar** la pașii *construiește* marcați ca grei, nu la exersarea conceptelor (cum ai zis).

## Felurile de pași

| Fel | Ce vede elevul | Ce face | Când e gata |
|---|---|---|---|
| `concept` | Text scurt (2–3 propoziții) + opțional un circuit „viu”, doar de privit | Citește | Apasă „Continuă” |
| `predict` | Circuit gata + întrebare cu 2–4 variante | Alege o variantă, apoi apasă „Pornește” ca să vadă | După ce a văzut rezultatul (răspunsul greșit nu blochează, doar explică) |
| `try` | Circuit gata, piese blocate; doar anumite acțiuni permise (ex. doar întrerupătorul) | Face acțiunea | Condiția de câștig |
| `build` | Masă (goală sau cu piese puse) + inventar | Construiește | Condiția de câștig |
| `fix` | Poveste reală + circuit stricat | Repară | Condiția de câștig |

`predict` e legătura cu **quiz-ul** de mai târziu: aceleași întrebări pot apărea în lumea online.

## Schema (date simple, în `src/content/circuits/chapters/*.ts`)

```ts
interface Chapter {
  id: string;                       // "01-primul-circuit"
  title: string;
  intro: string;
  lessons: MiniLesson[];
}

interface MiniLesson {
  id: string;                       // stabil: progres + XP
  title: string;
  difficulty: 1 | 2 | 3;            // XP: 10 / 20 / 30
  steps: Step[];
  unlocksParts?: string[];          // piese care apar în atelier după ce o termini
}

type Step = ConceptStep | PredictStep | TryStep | BuildStep | FixStep;

interface BoardSetup {
  parts: { id: string; part: string; x: number; y: number; state?: object; locked?: boolean }[];
  wires: [string, string][];        // ["bat:+", "sw:a"]
  lockedWires?: boolean;            // firele puse nu se pot șterge
}

interface TryStep {
  kind: "try";
  id: string;
  goal: string;
  board: BoardSetup;
  allow: ("toggle_switch" | "flip" | "pot" | "remove_wire" | "add_wire")[];
  win: WinCondition[];
  explain_after: string;
}

interface BuildStep {
  kind: "build" | "fix";
  id: string;
  story?: string;                   // pentru fix: situația reală
  goal: string;
  board?: BoardSetup;               // fără = masă goală
  inventory: { part: string; count: number }[];
  win: WinCondition[];
  limits?: { max_burned?: number; budget?: number };
  hints: string[];                  // dezvăluite pe rând, după ce elevul cere
  help?: "show_solution";           // doar la cele grele → „Arată-mi cum”
  solution: BoardSetup;             // obligatorie: testele o rulează prin simulator
  explain_after: string;
}
```

**Condițiile de câștig** (funcții pure peste rezultatul simulării, ușor de testat):

| Condiție | Exemplu |
|---|---|
| `{ is: "led_on", part?: "led1" }` | LED-ul (sau un anume LED) e aprins |
| `{ is: "motor_running" }` | motorul merge |
| `{ is: "current", part, min_ma, max_ma }` | 10–20 mA prin LED |
| `{ is: "brighter", a, b }` | LED-ul A mai luminos decât B |
| `{ is: "no_failure" }` | nimic ars, niciun scurtcircuit |
| `{ is: "max_parts", count }` | maxim N piese pe masă |
| `{ is: "led_off", part? }` | (pentru `try`) LED-ul s-a stins |

## Interfața

```
Capitol „Primul circuit”                       60 / 120 XP
 ┌──────────────────────────────────────────────┐
 │ ✓ 1. Ce face bateria            10 XP        │  ← se poate redeschide
 │ ✓ 2. Circuit închis / deschis   10 XP        │
 │ ▶ 3. Întrerupătorul             10 XP        │  ← următoarea
 │ 🔒 4. LED-ul are sens            20 XP        │
 └──────────────────────────────────────────────┘

Mini-lecție:   ● ● ◉ ○ ○   (pașii)
 ┌ text pasului ────────────────────────────────┐
 │ masa de lucru (aceeași ca acum)              │
 └ [Indiciu]                [Continuă →] ───────┘
 La final: „+10 XP” + ce ai învățat (1 frază) + „Următoarea mini-lecție”.
```

Pe telefon, masa ocupă tot ecranul (ca editorul de acum), textul pasului stă deasupra.

## Capitolul 1 — „Primul circuit” (schiță de conținut, de corectat)

Piese: baterie 9V, LED roșu, rezistor 220Ω, întrerupător. Totul cu electronii vizibili.

**1. Ce face bateria** · dificultate 1
- `concept` Bateria împinge electronii: pleacă de la − și se întorc la +. Au nevoie de un drum complet.
- `predict` Baterie + rezistor + LED, lipsește un fir. „Se aprinde LED-ul?” (Da / Nu)
- `try` Leagă ultimul fir (doar `add_wire`). → LED aprins, electronii curg.
- explică: drumul complet se numește *circuit închis*.

**2. Circuit închis, circuit deschis** · 1
- `try` Circuit care merge; scoate orice fir (`remove_wire`) → `led_off`.
- `predict` „Dacă scot firul de jos în loc de cel de sus, ce se întâmplă?”
- `fix` 🔦 *Lanterna nu se aprinde.* Un fir e legat greșit (pe același terminal la ambele capete). Repar-o.

**3. Întrerupătorul** · 1
- `concept` Întrerupătorul deschide și închide drumul, fără să scoți fire.
- `try` Doar `toggle_switch`: închide-l, apoi deschide-l.
- `build` Circuitul de la 1 + întrerupător (piesele puse, lipsește întrerupătorul).
- `fix` 💡 *Lumina din cameră*: întrerupătorul e pus pe un fir care nu e pe drum (ramură moartă). Mută-l.

**4. LED-ul are sens** · 2
- `concept` LED-ul lasă curentul doar într-o direcție: piciorul lung e +.
- `predict` LED pus invers. „Se aprinde?”
- `try` Doar `flip`: rotește LED-ul.
- `fix` 🚲 *Luminița de bicicletă nu merge*, deși toate firele sunt legate. (LED invers.)

**5. De ce rezistor?** · 2
- `predict` LED direct pe baterie, fără rezistor. „Ce se întâmplă?” (Se aprinde mai tare / Se arde / Nimic)
- `try` Închide întrerupătorul → electronii portocalii, foarte repezi; LED-ul se arde. *(aici arsul e voie)*
- `concept` Rezistorul încetinește electronii — limitează curentul.
- `build` Pune rezistorul în circuit, `no_failure`, `max_burned: 0`.

**6. Construiește singur** · 3 *(recapitulare)*
- `build` Masă goală, toate piesele: LED aprins, fără să ardă nimic. `help: "show_solution"`.
- `fix` 🔦 *Lanterna nouă se arde imediat ce o pornești.* Găsește ce lipsește.
- La final: piesele din capitol apar în **atelier**.

Total: 6 mini-lecții, ~100 XP, ~20–25 minute.

Provocările actuale (motor, paralel, potențiometru) se mută în capitolele 3–4, refăcute cu aceeași curbă.

## Ce rămâne la fel / ce se schimbă

- Masa de lucru, simularea, electronii, „Arată-mi cum” — refolosite.
- Lecția live (`circuit-electric-de-baza`) merge ca acum până când rândul ei din `lessons` primește `metadata.chapter = "01-primul-circuit"`. Asta e o schimbare în Supabase (o face Dan / migrație în `colabme-server`), nu în repo.
- Progresul + XP: local (ca acum) până la pasul 4; atunci trec în Supabase.

## Pași de implementare (fiecare se poate testa)

| | Pas | Ce se vede |
|---|---|---|
| 2a | Schema + condiții de câștig + `try`/`board` blocat, cu teste (fiecare `solution` trece prin simulator) | nimic în UI încă |
| 2b | Player de mini-lecție: pașii pe rând, `concept` / `predict` / `try` / `build` / `fix` | o mini-lecție de test jucabilă |
| 2c | Harta capitolului + progres local + XP afișat | navigare între mini-lecții |
| 2d | Conținutul capitolului 1 (textele de mai sus, corectate de echipă) | capitolul 1 complet |

## Decizii (Dan, 2026-11-17)

- Curba și toate felurile de pași: da; iterăm după ce le vedem jucate.
- XP 10 / 20 / 30: da, deocamdată.
- Textele: verificate de noi; urmează revizia unui profesor de fizică.
- Supabase: Dan rulează migrația, Claude o scrie. Capitolul 1 e o **lecție nouă** (`primul-circuit`); „Circuit Electric de Bază” rămâne până mutăm motorul / paralelul / potențiometrul în capitolele 3–4.

## Unde e codul

| Ce | Unde |
|---|---|
| Schema | `src/content/circuits/chapters/types.ts` |
| Capitolul 1 | `src/content/circuits/chapters/01-primul-circuit.ts` |
| Masa din date, condiții de câștig | `circuit/logic/board.ts`, `circuit/logic/winConditions.ts` |
| Editorul refolosibil (provocări vechi + mini-lecții) | `circuit/components/CircuitEditor.tsx` |
| Harta capitolului, player | `circuit/components/CircuitChapter.tsx`, `MiniLessonPlayer.tsx` |
| Teste: fiecare pas se poate rezolva, nu e rezolvat de la început, respectă acțiunile permise | `circuit/logic/__tests__/chapters.test.ts` |

Corecturi de conținut față de schiță: am adăugat explicația „sensul convențional al curentului” (+ → −) vs. electroni (− → +); rezistorul „limitează curentul din tot circuitul”, nu „încetinește electronii”; lanterna din lecția 2 are un fir lipsă (un fir pe aceeași piesă nu se poate face). LED-ul întors se repară mutând firele: butonul „rotește” schimbă doar desenul, nu polaritatea.
