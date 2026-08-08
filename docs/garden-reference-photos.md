# Grădina Virtuală — Referințe foto / biologie (per specie)

> Surse educaționale pentru modelat 3D (nu stock „piață”).  
> Actualizat: 2026-08-08.

---

## Fasole (*Phaseolus* / red kidney) — SURSA PRINCIPALĂ

Seria **UNL PASSEL – From Seed to Seed** (University of Nebraska–Lincoln).  
Poze de laborator pe zile, cu credit; autorii spun că imaginile pot fi folosite de instructori **cu caption**.

| Parte | Conținut | Link |
|---|---|---|
| **Part 1** — Developing Bean Plant | Germinare → vegetativ (Day 0–27), index imagini | https://passel2.unl.edu/view/lesson/ecfd27c27b15 |
| **Part 1 — story pe zile** | Overview Day 0–27 | https://passel2.unl.edu/view/lesson/ecfd27c27b15/4 |
| **Part 1 — Index of Images** | Toate figurile Part 1 | https://passel2.unl.edu/view/lesson/ecfd27c27b15/22 |
| Exemplu util (cotiledoane / frunzulițe) | Day 8–9 | https://passel2.unl.edu/view/lesson/ecfd27c27b15/10 |
| **Part 2** — Flowering & Mature | Floare, păstaie, maturitate | https://passel2.unl.edu/view/lesson/a4de8d747720 |
| **Part 3** — How to grow / observe | Ghid observare + linkuri PDF | https://passel2.unl.edu/view/lesson/bb92d6199625 |
| Hub linkuri 1+2+3 | Pagina cu toate părțile | https://passel2.unl.edu/view/lesson/bb92d6199625/8 |

**De ce e „de departe” cea mai bună:** secvență pe zile, aceleași condiții de lab, detalii morfologice (radiculă, cotiledoane, unifoliate, trifoliate), nu food photography.

Document asset-uri mesh: [`garden-fasole-assets.md`](./garden-fasole-assets.md).

---

## Există același tip de serie pe PASSEL pentru alte plante?

**Nu** — pe `passel2.unl.edu`, „From Seed to Seed” e **doar fasole** (3 părți).

### Dar pe restul netului?

**Da, există lucruri similare — dar rareori la același nivel.**

| Tip | Ce e | Față de PASSEL |
|---|---|---|
| Bloguri / experimente pe școală („bean in a bag”, germinare în borcan) | Foto pe zile, 1–2 săptămâni | Mult mai scurte, calitate amatoare, deseori doar fasole/mazăre |
| Timelapse YouTube / hobby | Uneori seed→plant | Cadru/stil inconsistent; greu de folosit ca referință de modelat |
| Dataset-uri științifice (timelapse laborator) | Ex. tomato/radish (Zenodo), bean+tomato+rapeseed (Plant Methods 2025) | Pentru ML / fenotipare — multe cadre, nu „ghid frumos pe etape” |
| Scale BBCH / Croptime | Descrieri oficiale de stadii | Text + diagrame, nu diary foto dens |

**Concluzie:** PASSEL rămâne **excepțional** (univ. + pe zile + caption + floare/maturitate). Pentru roșii/ceapă/ardei/castravete/floarea-soarelui **nu** am găsit un echivalent public la fel de bun. Calea realistă: PASSEL pentru fasole + BBCH/Croptime pentru etape + **propriul timelapse** (telefon, aceeași oră, același unghi) pentru celelalte.

Exemple (mai slabe, dar există):
- Germinare kids / borcan: https://www.howweelearn.com/seed-germination-kids-results/ (fasole, mazăre, castravete…)
- Bean in a bag: https://www.mombrite.com/growing-beans-in-a-bag/
- Timelapse tomato/radish (dataset școală): https://doi.org/10.5281/zenodo.345391
- Seedling RGB-D (bean, tomato, rapeseed): https://link.springer.com/article/10.1186/s13007-025-01334-3

---

## Floarea-soarelui (*Helianthus annuus*)

| Sursă | Tip | Link / notă |
|---|---|---|
| **BBCH sunflower** | Scale standard germinare → frunze → cap floral → maturitate (text + coduri) | PDF BBCH (ex. Meier): căutare „BBCH sunflower Weber Bleiholder”; inclus în compendiul BBCH |
| NCAL / educational life cycle | Carduri ciclu (mai simplu, K-2) | https://www.agliteracy.org/matrix/lessons/364/ |

Nu e serie foto pe zile ca PASSEL; BBCH e referința de **etape** pentru mesh-uri.

---

## Roșii, ardei, castraveți

| Sursă | Tip | Link |
|---|---|---|
| **UA CEAC Ch. 7** | Germinare comună (radiculă, plumular hook, cotiledoane) pentru tomato / pepper / cucumber | https://ceac.arizona.edu/sites/default/files/Chapter%207.pdf |
| **OSU Croptime Growth Stage Guide** | BBCH-oriented: tomato, pepper, cucumber & summer squash (descrieri stagii) | https://smallfarms.oregonstate.edu/sites/agscid7/files/croptimegrowthstageguide2016-04-28.pdf |
| BBCH tomato / pepper / cucumber | Scale internaționale (uneori 3 digiți) | Compendiu BBCH (Meier et al.) |

Din nou: **descrieri + scale**, rar secvență foto densă ca la fasolea UNL.

---

## Ceapă (*Allium*)

| Sursă | Tip | Notă |
|---|---|---|
| BBCH onion | Scale (germinare, frunze, bulb) | În compendiul BBCH; ceapa e menționată explicit ca specie cu subdiviziuni |
| Extension univ. (căutare) | „onion growth stages diagram extension” | Diagrame 2D tip extension; calitate variabilă |

---

## Scale generale (toate speciile)

| Sursă | Link |
|---|---|
| BBCH English monograph (Meier) | https://www.masaf.gov.it/flex/AppData/WebLive/Agrometeo/MIEPFY800/BBCHengl2001.pdf |
| OSU Croptime guide | https://smallfarms.oregonstate.edu/sites/agscid7/files/croptimegrowthstageguide2016-04-28.pdf |

---

## Strategie practică pentru ColabMe

1. **Fasole** → PASSEL Parts 1–3 (foto).  
2. **Restul** → BBCH / Croptime pentru *ce* etape există + poze proprii (timelapse în ghiveci) sau referințe extension când apar.  
3. Nu aștepta un „PASSEL pentru roșii” — probabil nu există în același format; fasolea rămâne template-ul vizual al grădinii.

### Credit / folosire

- PASSEL: autorii încurajează folosirea de către instructori **cu caption** (vezi Introduction Part 1).  
- Verifică licența pe fiecare PDF/extension înainte de redistribuire publică a imaginilor; pentru **modelat intern** ca referință e uzual OK — nu urca pozele copyright pe site ca asset final.
