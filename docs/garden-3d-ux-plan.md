# Grădină Virtuală — plan UX 3D

Status: **acord pe direcție** — expand = fișă plantă cu HUD peste 3D. Fără slider zoom (pinch/wheel e suficient).

## Decizii închise

- Zoom: OrbitControls (wheel PC / pinch mobil) — **fără slidere**
- Expand fullscreen: fix CSS `height: 240px` vs fullscreen — done
- Detalii îngrijire (status, metere, Udă/Buruieni/…) → **în expand**, peste 3D, optimizat mobil

## Ce e live acum

- GLB `fasole_seed.glb` + `visualAssets.ts` (sămânța `ready`)
- Viewer inline cu `autoFit: false`
- Framing sămânță încă mic — tuning ulterior (scale/cameră), nu blocker

## Lecții ModelBox (păstrăm)

| Stare | Comportament |
| --- | --- |
| **Adormit** | Shield: scroll pagină liber; auto-rotate |
| **Activ** | Orbit (rotație + zoom) |
| **Expand** | `fixed; inset: 0`; Esc / ✕; body overflow hidden |

Reguli:

1. Inline: shield obligatoriu; zoom ok dar gesturile pot lupta cu scroll — de-asta detaliul e în expand.
2. Expand: pagină blocată → pinch/wheel safe.
3. Nu stricăm ModelBox-ul lecțiilor; grădina adaugă un **HUD/sheet** în expand (slot / wrapper), nu rescrie orbita.

## Direcție UX aleasă: bottom HUD peste 3D

### De ce asta (nu altceva)

| Pattern | Exemplu tipic | La noi |
| --- | --- | --- |
| **Bottom sheet / dock pe media** | Maps (card locație), Spotify Now Playing, multe AR try-on | **Da** — degete jos, 3D liber sus, ✕ rămâne sus-dreapta |
| HUD colțuri tip joc | Fortnite / AR measure | Posibil pentru chips scurte; acțiunile mari tot jos |
| Split 50/50 3D \| panel | Desktop dashboards | **Nu pe mobil** — taie planta; pe PC opțional mai târziu |
| Drawer din lateral | Admin apps | Mai greu pe one-hand mobil |
| Modal text peste tot | Dialoguri | Ascunde 3D-ul — evitat |

**Recomandare ColabMe:** pe expand, canvas full-bleed + **bandă de sticlă jos** (safe-area pe iPhone) cu:

1. Titlu scurt: `Fasole — Sămânță` + status
2. 4 metere compacte (sau 2 vizibile + „mai mult”)
3. Rând acțiuni: Udă | Buruieni | Recoltează (thumb zone)
4. Hint soare pe o linie, discret

Sus: doar ✕ (și eventual un chip „Apasă & trage / pinch” o dată).

3D rămâne zona de gesturi; HUD-ul **nu** capturează drag pe canvas (pointer-events pe panou, nu pe tot ecranul).

### Inline (prima pagină) — țintă

- Listă plante + preview 3D mic
- Fără metere lungi / fără zid de butoane — CTA implicit = expand (⛶) sau tap pe plantă → expand
- Opțional: un singur status scurt pe rândul din listă (cum e acum)

### Desktop

- Același HUD jos (consistență) **sau** rail îngust dreapta dacă banda jos acoperă prea mult bobul pe landscape — de decis la implementare după un screenshot
- Nu e nevoie de layout total diferit în v1

## Ce evităm

- Slider zoom / +/− zoom (redundant)
- Observe/Bounds care re-fit-uiește la orbită
- Panou opac full-screen care ascunde planta
- Acțiuni doar pe prima pagină + duplicate confuze — sursa de adevăr = expand; inline rămâne listă + preview

## Implementare

1. ModelBox `fullscreenChrome` + `GardenCareDock` (HUD jos) — done
2. Îngrijire mutată în expand; inline = preview + status scurt — done
3. Fallback emoji cu același expand + dock — done
4. Tuning scale/cameră sămânță — ulterior
5. Test mobil: pinch + tap Udă; PC wheel + butoane

## Întrebări rămase (fine)

1. Pe prima pagină: păstrăm și Udă rapid, sau **doar** în expand?
   → **Decis: cât mai mult în expand.** Pagina tamagotchi rămâne pentru restul grădinii; îngrijirea detaliată (status, metere, Udă/Buruieni/Recoltează, hint soare) trăiește în expand.
2. HUD jos: mereu deschis (dock fix) sau „peek” care se trage în sus pentru detalii?
   → **Propunere default:** dock jos mereu vizibil în expand (acțiuni + status esențial). Dacă devine prea înalt, al doilea pas = secțiune „Detalii” expandabilă în același panou — nu pe pagina principală.
