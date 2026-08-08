# Grădină Virtuală — plan UX 3D (fără implementare încă)

Status: **documentare / plan**. Nu implementăm slider de zoom sau redesign expand până decidem împreună după push-ul curent.

## Ce e „decent” acum (OK de push)

- GLB `fasole_seed.glb` în `public/garden/fasole/`
- Mapare `visualAssets.ts` (doar sămânța `ready: true`)
- Viewer în panoul Îngrijire, cu `autoFit: false` (fără Bounds intro/snap)
- Framing încă **prea mic** pe sămânță — acceptat temporar; nu mai chase-uim `fitMargin` / Bounds în acest pas

## Lecții ModelBox (de ce nu „un slider rapid”)

Am investit deja într-un model de control care protejează scroll-ul pe mobil:

| Stare | Comportament |
| --- | --- |
| **Adormit** (default) | Shield peste canvas: scroll/drag de pagină trec; auto-rotate vizual |
| **Activ** (tap/click „Apasă pentru a interacționa”) | OrbitControls: rotație (+ zoom nativ Orbit dacă e permis) |
| **Dezactivare** | mouse leave (PC) / tap în afară (mobil) |
| **Expand** | overlay CSS `position: fixed; inset: 0` (nu Fullscreen API); Esc / ✕; `body` overflow hidden |

Reguli de păstrat:

1. **Niciun control de zoom pe gest vertical în view-ul inline** — pe mobil se confundă cu scroll-ul paginii.
2. Shield rămâne obligatoriu în caseta din pagină.
3. Controale „fine” (slider zoom, detalii) → doar în **mod expand / detalii**, unde pagina din spate e blocată.
4. Nu stricăm ModelBox-ul folosit și de lecțiile 3D; grădina extinde sau wrap-uiește, nu rescrie orbite/shield fără nevoie.

## Bug cunoscut: expand pe PC „lat, dar scund”

Simptom: expand apare sus, peste meniu, pe lățime, **nu pe toată înălțimea**.

Cauză probabilă (CSS): în grădină există

```css
.garden-viz-model .model-box {
  height: 240px;
}
```

care vine **după** `.model-box.fullscreen` și forțează 240px chiar în overlay. Deci nu e „feature mobil” — e conflict de specificitate. De reparat când facem UX-ul de expand (ex. `.garden-viz-model .model-box.fullscreen { height: auto; inset: 0; }`).

Pe mobil, expand-ul **ar trebui** să fie viewport real (lat + înalt), altfel e inutil pentru „detaliu plantă”.

## Direcție UX propusă (de discutat)

### A. Prima pagină grădină (compact)

- Listă plante + preview 3D mic (sau chiar emoji până e expand)
- Status scurt + 1–2 acțiuni esențiale (Udă / Buruieni) — sau doar CTA „Deschide planta”
- **Fără** pereți de text, metere lungi, slider zoom

### B. Expand = „fișa plantei” (detaliu)

Layout tip sheet / overlay full viewport:

- Canvas 3D mare (orbită activă din start în expand)
- **Zoom doar aici**: slider sau +/− (pointer pe slider, nu pinch obligatoriu pe canvas — pinch pe OrbitControls e ok în expand pentru că scroll-ul paginii e blocat; totuși slider e predictibil pe iOS)
- Meters: creștere, umiditate, sănătate, buruieni
- Acțiuni: Udă, Smulge, Recoltează
- Hint soare / mesaje
- Închidere clară (✕ / Esc / gest back pe mobil — de decis)

### C. Inline activ (fără expand)

- Doar rotație ușoară (cum e acum)
- Zoom Orbit **dezactivat sau foarte limitat** în inline, ca să nu lupte cu scroll
- Zoom „serios” → expand

## Zoom slider — principii (când îl facem)

- Doar în expand (sau panel detalii dedicat)
- Nu folosi wheel pe canvas în inline
- Slider = `input type="range"` / butoane +/− care setează `camera.position` distance sau `controls.dolly` — **nu** un al doilea Bounds/observe
- Păstrăm `minDistance` / `maxDistance` ca limite
- Test obligatoriu: iOS Safari + Chrome Android + desktop (trackpad + mouse)

## Pași recomandați

1. **Push acum** cu GLB + viewer stabil (framing imperfect OK)
2. Fix mic separat: CSS fullscreen vs `height: 240px` (poate fi un PR scurt)
3. Design expand „fișă plantă” (wireframe / listă UI) — acord pe ce mutăm din prima pagină
4. Abia apoi: zoom controls + eventual `GardenPlantSheet` care wrap-uiește ModelBox
5. Abia la final: tuning default scale/cameră pe sămânță (sau preset per LOD în `visualAssets`)

## Întrebări deschise (înainte de cod mare)

1. Expand = tot ecranul pe mobil **și** desktop, sau pe desktop un panel 70% / drawer?
2. Acțiunile Udă/Buruieni rămân și pe prima pagină sau doar în expand?
3. Preview inline: păstrăm 3D mic sau revenim la emoji + expand pentru 3D?
4. Un singur canvas partajat (inline → expand același WebGL) vs remount — tradeoff memorie vs simplitate?
