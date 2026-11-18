# Circuite electrice — propunere de revamp

> Propunere din 2026-11-17, actualizată cu răspunsurile lui Dan. Status: **pașii 0 și 1 făcuți** (plus o parte din pasul 5: piese SVG și electroni pe fire). Pornește de la auditul codului actual (`src/pages/lessons/templates/circuit/`).

## Direcția pe termen lung

Elevii învață electricitate prin capitole scurte și provocări, deblochează piese noi și le folosesc în **atelier** ca să construiască lucruri tot mai interesante. Mai târziu: mini-roboței din componente pe care le pot cumpăra de la magazin, cu o vedere 3D a ansamblului (nu a schemei). Și, la un moment dat, o zonă mai „open source”: componente proprii cu parametri, ansambluri făcute de useri.

Consecință pentru arhitectură: **piesele, nivelurile și circuitele sunt date simple (JSON-serializabile), nu cod.** Azi stau în repo; mâine aceleași structuri pot veni din DB sau de la useri fără rescriere.

## Ce păstrăm

- Motorul de simulare (`logic/sim/`: netlist + MNA DC) și testele lui.
- Editorul 2D (masă, plasare, fire, pan/zoom), structura de componente și hooks.

## Decizii de arhitectură

### 1. Structura: capitol → mini-lecții → pași

```
Lumea lecțiilor
 └─ Capitol „Primul circuit”  (un rând în `lessons`, template circuit_electric)
      ├─ Mini-lecția 1 „Circuitul închis”      ── XP
      │    ├─ concept     (explicație scurtă, poate cu animație)
      │    ├─ exercițiu   (provocare pe masa de lucru)
      │    └─ scenariu real („Lanterna nu merge. De ce?”)
      ├─ Mini-lecția 2 „Întrerupătorul”        ── XP
      └─ …
```

- Capitolele se deblochează între ele prin `prerequisite_lesson_id` (există deja).
- Mini-lecțiile se deblochează pe rând, dar **cele parcurse se pot redeschide oricând** dintr-o hartă a capitolului (azi nu se poate).
- Pașii unei mini-lecții sunt de 3 feluri: `concept`, `exercise`, `scenario`. Scenariul real e tot un exercițiu, dar pornit dintr-o situație de zi cu zi, ca să se vadă de ce e util conceptul.

### 2. Conținutul stă în repo, ca date

```
src/content/circuits/
  parts.ts                 ← catalogul de piese (tip, variantă, parametri, preț, cum se deblochează)
  chapters/01-primul-circuit.ts
  chapters/02-rezistenta.ts
  …
  __tests__/levels.test.ts ← fiecare exercițiu are o soluție de referință; testul o trece prin simulator
```

Rândul din `lessons` ține doar `metadata: { "chapter": "01-primul-circuit" }`. Metadata veche (`challenges` în JSONB) rămâne citită până mutăm lecția live.

**De ce:** TypeScript prinde greșelile, schimbările se văd în review, iar testul garantează că **orice exercițiu se poate rezolva**. Fișierele exportă doar date (fără funcții), deci pot fi mutate mai târziu în DB / editor / conținut făcut de useri.

### 3. Catalogul de piese

```ts
interface PartDef {
  id: string;                    // "resistor-220", "led-red", "battery-9v"
  type: ComponentType;           // comportamentul în simulator
  label: string;
  electrical: Partial<…>;        // parametrii acestei variante
  price: number;                 // „lei” virtuali, pentru exercițiile cu buget
  unlock?: { after: string };    // id-ul mini-lecției care o deblochează în atelier
}
```

- Simulatorul citește parametrii de pe piesă (`node.state.params`), nu pe tip. Asta permite 220Ω și 1kΩ pe aceeași masă, baterii diferite, LED-uri de culori diferite.
- Piese noi (buzzer, buton, senzor de lumină, baterie AA…) = o intrare nouă în catalog + un model în simulator.

### 4. Schema unui exercițiu

```ts
interface ExerciseStep {
  kind: "exercise" | "scenario";
  id: string;                    // stabil, folosit la progres
  story?: string;                // pentru scenariu: situația reală
  goal: string;
  hints: string[];               // dezvăluite pe rând
  explain_after: string;         // de ce a mers

  inventory: { part: string; count: number }[];
  preset?: { nodes; edges; locked?: string[] };  // piese deja puse
  win: WinCondition[];
  limits?: { max_burned?: number; budget?: number };  // „poți arde maxim 2 LED-uri” / „ai 20 de lei”
  solution: { nodes; edges };    // doar pentru teste
}
```

### 4b. Fire și ramificații (decis 2026-11-17)

- Pe un terminal se pot lega **oricâte fire**, ca în realitate. Ramificațiile (paralel) nu mai cer piesa „nod de legătură”; ea rămâne opțională, pentru scheme mai ordonate. `required_types` ignoră nodurile.
- Un fir se șterge atingând firul (apare „×”), nu terminalul.
- Motiv: cu un singur fir pe terminal, provocarea „Potențiometru în circuit” era imposibilă (9 capete de legat, număr impar), iar nodurile erau greu de folosit.

### 4d. Borne și fire (decis 2026-11-18)

- Bornele nu se mișcă singure (copiii învață tocmai unde e + și −). În schimb: piese rotibile la 90°, fire curbe care ies din bornă spre exterior, aranjamente de borne pe scenă (LED cu picioarele jos în scenele realiste).
- Test automat: în mesele noastre niciun fir nu trece printr-o piesă sau peste o bornă străină.
- Mai târziu, dacă în atelier firele tot se încâlcesc: rutare automată care ocolește piesele (în unghi drept).

### 4c. Soluții de referință și „Arată-mi cum”

- `src/content/circuits/solutions.ts`: soluția fiecărei provocări (piese + fire), doar date.
- Butonul „Arată-mi cum” o desenează pas cu pas: piesele, apoi câte un fir (evidențiat), la final întrerupătorul — cu simularea pornită, deci se văd LED-ul și electronii.
- Testul `logic/__tests__/solutions.test.ts` verifică pe o copie a provocărilor din DB (`fixtures/`) că fiecare soluție chiar rezolvă provocarea și folosește doar piese din inventar. La pasul 2, provocările se mută în repo și fixture-ul dispare.

### 5. Condiții de câștig

| Tip | Exemplu |
|---|---|
| `component` | `{ type: "led", is: "on" }`, cu `all` / `any` pentru mai multe piese |
| `measure` | curentul prin LED între 10 și 20 mA |
| `compare` | LED-ul A luminează mai tare decât B |
| `no_failure` | nimic ars, niciun scurtcircuit |
| `parts` | maxim N piese folosite |
| `hold` | condiția ține 1 s |

Limitele (`max_burned`, `budget`) se verifică pe toată încercarea: dacă le depășești, exercițiul se resetează cu o explicație, nu pierzi progresul.

### 6. Progres (implementat 2026-11-17)

- Tabele `lesson_items` (lista albă: mini-lecție → XP, invizibilă din client) și `lesson_item_progress` (elevul își vede doar rândurile lui).
- Singura cale de scriere: `rpc("complete_lesson_item")` — SECURITY DEFINER, dă XP o singură dată, marchează lecția finalizată la ultima mini-lecție. Id-urile necunoscute sunt respinse.
- Clientul: `useChapterProgress`; vizitatorii rămân pe localStorage, iar la logare progresul lor urcă în cont. Dacă serverul nu răspunde, progresul rămâne local.
- La un capitol nou: rânduri noi în `lesson_items` (migrație), cu aceleași id-uri și XP ca în fișierul capitolului; `serverItems.test.ts` verifică potrivirea (local, când `colabme-server` e lângă repo).

### 6 (plan inițial) și XP

- Tabel nou în `colabme-server`: `lesson_step_progress (user_id, lesson_id, step_id, completed_at, xp)` cu RLS.
- XP pe fiecare mini-lecție terminată, **în funcție de dificultate** (câmp `difficulty` pe mini-lecție → XP); redeschiderea nu mai dă XP.
- Până la migrație, provocările rezolvate se țin în `localStorage` (per user + lecție), ca elevul să poată reveni la ele.
- Când toate mini-lecțiile sunt gata → insert automat în `lesson_completions` (butonul manual dispare pentru circuite).
- Fără cont: progres doar în `localStorage`, cu îndemn să-și facă cont.

### 7. Atelierul

- Zonă **sigură**: poți arde orice, nu te costă nimic, totul se poate reseta.
- Piesele disponibile = cele deblocate din mini-lecții (motivație să mai învețe).
- Circuitele se **salvează în cont**: tabel `user_circuits (id, user_id, title, data jsonb, created_at, updated_at)`.
- **Decis**: un profesor vede doar circuitele elevilor din școala lui (fără clase deocamdată); adminii văd tot. Nu construim acum interfața de profesor, dar ne pregătim: `user_circuits` ține `user_id`, iar școala se ia din `user_profiles`, așa că o politică RLS „profesor din aceeași școală” se poate adăuga ulterior fără schimbare de schemă.

### 8. Simulare

- **LED iterativ**: repetăm până când starea LED-urilor (conduce / nu) nu se mai schimbă (pasul 0).
- **Luminozitate LED** și **viteză motor** proporționale cu curentul.
- Mai multe baterii (în serie = tensiune mai mare).
- Rezultat unificat per piesă, ca UI-ul să nu mai calculeze nimic singur.

### 9. Vizual

- Schema rămâne 2D. Desenăm noi **piese SVG** (văzute de sus), LED care strălucește, motor care se rotește, **curent animat pe fire**.
- **Electronii pe fire** (făcut): buline care pleacă de la − spre +, cu viteza ∝ √curent; portocalii când un LED primește prea mult curent sau e scurtcircuit. Curentul pe fiecare fir se reconstruiește din soluția MNA (`logic/sim/wireCurrents.ts`), pentru că simulatorul unește firele în noduri.
- 3D vine mai târziu, separat de schemă: vederea ansamblului / robotului construit.

## Curriculum (schiță, de detaliat cu echipa)

Electricitatea e la fizică în clasa a VIII-a; ținta e gimnaziu, curbă lină. Câteva idei de scenarii reale între paranteze.

1. **Primul circuit**: circuit închis vs deschis (lanterna nu merge) · întrerupătorul (lumina din cameră) · LED-ul are + și − (beculețul pus invers) · de ce ne trebuie rezistor (îl arzi intenționat o dată)
2. **Rezistența**: 220Ω vs 1kΩ (luminozitate) · citești curentul · alege rezistorul pentru 10–20 mA (legea lui Ohm) · buget limitat
3. **Serie și paralel**: două LED-uri în serie / paralel (instalația de brad: de ce se stinge tot când se arde un bec) · scurtcircuitul (de ce sare siguranța)
4. **Control**: potențiometrul ca dimmer (variatorul de lumină) · motorul DC (ventilatorul) · viteza motorului · motor + LED indicator
5. **Atelier**: deschis din primul capitol, cu tot mai multe piese

## Pași de implementare

| # | Pas | Ce se vede |
|---|---|---|
| 0 ✅ | Bug-uri: potențiometru la 0, câștig doar pe prima piesă, LED iterativ, piese cerute care lipsesc din inventar. Aliniem skill-ul cu regula `.mdc`. Plus: lista de provocări cu revizitare | provocarea 1 se poate trece, simularea e mai corectă |
| 1 ✅ | Catalog de piese (`src/content/circuits/parts.ts`) + parametri pe piesă + inventar per provocare (`inventory` opțional în metadata, altfel din `required_types`). Plus: piesele nelegate nu mai blochează simularea (GMIN) | 2 LED-uri / 2 rezistoare diferite pe masă |
| 2 ✅ | Schema capitol → mini-lecție → pași, condiții noi, test de rezolvabilitate; capitolul 1 (vezi `docs/circuit-step2.md`) | capitolul 1 jucabil |
| 3 ✅ | Harta capitolului cu redeschiderea mini-lecțiilor; flux prezice → încearcă → construiește → repară | navigare ușoară între mini-lecții |
| 4 ✅ | Progres + XP salvate (`colabme-server` `20261117_lesson_item_progress.sql` + client) + finalizare automată | progresul rămâne după refresh și pe alt dispozitiv |
| 5 | Vizual 2D: ~~piese SVG~~ ✅, ~~curent pe fire (electroni)~~ ✅, ~~fire curbe~~ ✅, ~~scene „repară” (lanternă, cameră, bicicletă) cu lumină~~ ✅, luminozitate LED ∝ curent | arată ca un joc |
| 6 | Atelier: piese deblocate, circuite salvate în cont, vizibile pentru profesori și admini | sandbox |
| 7 | Capitolele 2–4 | conținut |
| 8 | Experiment 3D / roboței | de decis după |

## De nu uitat

- Interfața de profesor pentru circuitele elevilor din școala lui (după atelier).
- Legături profesor ↔ elevi / clase — doar când avem nevoie.
