# ColabMe — client web (danjisan.github.io)

Regulile proiectului sunt ținute în `.cursor/rules/` și sunt comune pentru Cursor și Claude Code.
Sursa unică de adevăr rămâne acolo; acest fișier doar le importă și adaugă ce e specific lui Claude.

## Reguli mereu active

@.cursor/rules/project-overview.mdc
@.cursor/rules/quality.mdc
@.cursor/rules/react-conventions.mdc

## Context pe zone (citește înainte să lucrezi acolo)

| Zonă | Citește |
|---|---|
| Viziune, arhitectură, roluri, milestones | `docs/COLABME.md` |
| Template circuit electric (`src/pages/lessons/templates/Circuit*`, `circuit/`) | `.cursor/rules/circuit-electric-context.mdc`, `.cursor/skills/circuit-electric/SKILL.md` |
| 3D / R3F (`ModelBox`, `ModelViewer3D`, GLB, template-uri 3D) | `.cursor/skills/web3d-r3f/SKILL.md` |
| Grădina / fasole | `docs/garden-3d-ux-plan.md`, `docs/garden-fasole-assets.md`, `docs/garden-reference-photos.md` |

## Comenzi

- `npm run dev` — server local (http://localhost:5173)
- `npm run build` — verificare tipuri + build; trebuie să treacă înainte de orice push
- `npm test` — vitest (teste pentru logica circuitului)

## Mod de lucru cu Dan

- Răspunsurile către Dan în română.
- Pentru schimbări mai mari: propun arhitectura întâi, apoi pași mici, testabili.
- Commit/push doar după confirmarea lui Dan; push pe `master` = deploy live.
- Backend-ul (`colabme-server`, migrații SQL Supabase) e în alt repo — aici doar client static.
- Variabilele `VITE_*` vin din `.env.local` (local) și din secretele GitHub (deploy); nu se comit niciodată.
