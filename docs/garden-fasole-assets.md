# Grădina Virtuală — Asset-uri 3D Fasole (M1 → detalii)

> Document de lucru pentru Technical Artist + integrare web.  
> Scop: **6 mesh-uri obligatorii** acum, cu cale clară spre etape intermediare fără rewrite pe simulare.

---

## Principiu: două straturi

| Strat | Ce e | Se schimbă des? |
|---|---|---|
| **Logică joc** | `growth_progress` 0→1 + 6 etichete pedagogice | Rareori |
| **Vizual (LOD mesh)** | Tabel `progress → fișier GLB` | Da — aici adăugăm detalii |

Simularea (udat, soare, buruieni) **nu** depinde de numărul de GLB-uri.  
UI poate afișa eticheta „Germinare” în timp ce mesh-ul trece prin 2–3 look-uri.

Cod actual etichete: `src/pages/lessons/templates/garden/species.ts` → `GROWTH_STAGES`.

**Referințe foto / biologie (PASSEL + alte specii):**  
→ [`docs/garden-reference-photos.md`](./garden-reference-photos.md)  
→ Fasole (principal): https://passel2.unl.edu/view/lesson/ecfd27c27b15

---

## Cele 6 asset-uri obligatorii (M1)

Naming (kebab + prefix specie):

| # | Filename | Etichetă joc | Prag `progress` (orientativ) | Descriere model |
|---|---|---|---|---|
| 1 | `fasole_seed.glb` | Sămânță | 0.00 – 0.05 | Sămânță uscată, înainte de plantat / abia în sol |
| 2 | `fasole_germ.glb` | Germinare | 0.05 – 0.20 | Radiculă și/sau cotiledoane abia ieșite |
| 3 | `fasole_sprout.glb` | Răsad | 0.20 – 0.45 | Tulpină scurtă + frunze tinere |
| 4 | `fasole_grow.glb` | Creștere | 0.45 – 0.70 | Plantă vegetativă mai înaltă |
| 5 | `fasole_flower.glb` | Înflorire / formare | 0.70 – 0.95 | Flori și/sau păstăi foarte tinere |
| 6 | `fasole_mature.glb` | Matură | 0.95 – 1.00 | Păstăi vizibile, look „gata de recoltat” |

### Opționale M1 (parcela)

| Filename | Rol |
|---|---|
| `garden_bed.glb` | Background parcelă / sol / ghiveci (separat de plantă) |
| `weed_clump_a.glb` | Buruieni (1 variantă e destul) |

**Nu** lipi fundalul în mesh-ul plantei — swap-ul pe etape rămâne simplu.

---

## Extindere ulterioară (intermediare) — fără durere

Când vrei mai mult detaliu morphologic, **adaugi rânduri** în maparea vizuală, nu schimbi DB-ul.

Exemplu țintă fasole (8–10 mesh-uri):

| Filename sugerat | Look |
|---|---|
| `fasole_seed.glb` | uscată |
| `fasole_seed_imbibed.glb` | umflată |
| `fasole_radicle.glb` | rădăcină |
| `fasole_emergence.glb` | ieșire din sol / cârlig |
| `fasole_cotyledon.glb` | cotiledoane deschise |
| `fasole_true_leaf.glb` | primele frunze adevărate |
| `fasole_grow.glb` | vegetativ |
| `fasole_flower.glb` | flori |
| `fasole_pod_young.glb` | păstăi tinere |
| `fasole_mature.glb` | matur |

Mapare tip (pseudocod — de implementat în app când apar fișierele):

```ts
// Alege ULTIMUL prag cu progress >= min
const FASOLE_VISUAL = [
  { min: 0.00, glb: "fasole_seed.glb" },
  { min: 0.05, glb: "fasole_germ.glb" },
  { min: 0.20, glb: "fasole_sprout.glb" },
  { min: 0.45, glb: "fasole_grow.glb" },
  { min: 0.70, glb: "fasole_flower.glb" },
  { min: 0.95, glb: "fasole_mature.glb" },
];
```

Intermediar nou = un obiect `{ min: 0.12, glb: "fasole_radicle.glb" }` inserat în listă.

---

## Convenții tehnice (obligatorii pentru consistență)

### Transform
- **Origin** = baza plantei (unde intră în pământ), pe sol `Z=0` sau `Y=0` — **aceeași axă pe toate**
- Preferință ColabMe / Three: **Y-up** la export GLB
- Fără rotații „ascunse” pe obiectul root; aplică transforms înainte de export (`Ctrl+A` Location/Rotation/Scale)
- Scară: **1 unitate Blender = 1 metru**; sămânța ~0.02–0.04 m, planta matură ~0.4–0.6 m (sau scară stilizată, dar **identică** pe set)

### Topologie / stil
- Low-poly **stilizat** (educațional, mobil)
- Budget orientativ: **1–5k tri** per etapă plantă; `garden_bed` &lt; **10k**
- Evită intersecții urâte la frunze; mai bine mai puține plane lizibile

### Materiale / UV
- UV unwrap curat pe fiecare mesh (sau atlas pe specie)
- PBR simplu: **Base Color** (+ Roughness opțional)
- Texturi 512–1024; fără 4K
- Ideal: același stil de culoare pe toate cele 6 (paletă verde/maro coerentă)

### Export
- Format: **`.glb`**
- Compresie: Draco ok dacă pipeline-ul web o suportă (drei/GLTFLoader)
- Fără animații în M1 (static mesh swap)
- Fără camere / lumini în fișier (lumina e în R3F)

### Storage (când sunt gata)
- Supabase Storage (public bucket sau signed URL)
- Pattern sugerat:  
  `garden/fasole/fasole_seed.glb` …  
  `garden/shared/garden_bed.glb`

---

## Checklist Blender (per fișier)

- [ ] Origin la bază, Y-up, scale aplicat  
- [ ] Polycount în buget  
- [ ] UV fără overlap critic pe zone vizibile  
- [ ] Un material predictibil (nume: `fasole_mat` sau similar)  
- [ ] Export GLB, test import într-un viewer (ex. https://gltf-viewer.donmccurdy.com/)  
- [ ] Alăturat vizual cu etapa anterioară (salt de scară / stil?)  

---

## Referințe & legal

- Folosește poze de pe net ca **referință de formă**, nu ca textură finală copyright  
- Preferabil: textură stilizată proprie sau AI pe **UV-ul tău**  
- Stil unitar &gt; realism foto

---

## Prompturi utile

### Referință imagine (pentru modelat manual)

```
Educational low-poly stylized common bean plant (Phaseolus), [STAGE],
clean silhouette, soft clay-like forms, no photorealism, white background,
orthographic side view, game asset reference
```

Înlocuiește `[STAGE]` cu: `dry seed` / `germinating with radicle` / `seedling with first leaves` / `vegetative plant` / `flowering` / `mature with pods`.

### Textură pe UV (după unwrap)

```
Stylized PBR basecolor for a low-poly bean plant UV layout,
soft greens and warm browns, subtle AO in crevices, no logos,
no text, seamless within islands, children educational game look
```

### AI mesh (doar draft — apoi retopo în Blender)

Folosește doar dacă vrei schiță; **nu** export direct în producție fără cleanup.

---

## Integrare app (viitor apropiat)

1. Placeholder emoji rămâne până `glb != null`  
2. Componentă R3F pe parcelă: încarcă GLB din mapare + opțional `garden_bed`  
3. Buruieni: scale/opacity după `weed_level` pe `weed_clump_a`  
4. Același pattern se replică pe roșii / ceapă etc. cu prefix specie  

Fișiere relevante acum:
- Logică: `src/pages/lessons/templates/garden/*`  
- UI: `PlantTamagotchiTemplate.tsx`  
- Convenții 3D proiect: `.cursor/skills/web3d-r3f/SKILL.md`

---

## Ordinea de lucru recomandată (Dan)

1. `fasole_seed` + `fasole_mature` (capetele continuumului — setează stilul)  
2. `fasole_sprout` + `fasole_grow` (volum principal)  
3. `fasole_germ` + `fasole_flower` (tranziții)  
4. `garden_bed`  
5. (Opțional) intermediare morphologice  

Când ai primul GLB pe Storage, anunță — legăm maparea în template.
