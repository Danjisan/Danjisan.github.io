# ColabMe — Document de Viziune și Arhitectură

> Document viu — se actualizează pe măsură ce proiectul evoluează.
> Scopul: context persistent pentru AI, referință de decizie pentru echipă.

---

## Viziune

ColabMe este o platformă EdTech care face legătura dintre:
- **Teorie ↔ Practică** — cunoștințele devin aplicabile, nu rămân abstracte
- **Digital ↔ Real** — simulările virtuale au echivalent în lumea fizică

Platforma combină un **compendiu educațional** (lecții multi-format, laborator virtual) cu o **lume online competitivă** (PvP de cunoștințe, challenge-uri de echipă). Conținutul STEM, științe naturale, cultură generală, sănătate, comunitate.

---

## Clienți (interfețe utilizator)

| Client | Status | Tech |
|---|---|---|
| **Web client** (`colabme.eu`) | Activ — baza M1 | React + Vite + TypeScript + R3F |
| **Mobile / PC** | Există demo anterior, se reface | Unreal Engine |
| **XR** | Planificat | Unreal Engine |
| **Hardware** | Planificat | Raspberry Pi, Arduino |

> Web client-ul este prima poartă de intrare pentru majoritatea userilor.
> Toți clienții consumă același backend prin API unificat.
> `danjisan.github.io` = sandbox de teste → redirect spre `colabme.eu` la finalul M1.

---

## Arhitectură backend

```
┌─────────────────┐     ┌──────────────────────────┐
│   Web Client    │     │  Unreal / XR / Hardware   │
│ React/Vite/R3F  │     │     (M2+)                 │
└────────┬────────┘     └────────────┬──────────────┘
         │                           │
         ▼                           ▼
┌────────────────────────────────────────────────────┐
│              API unificat (REST + WebSocket)        │
├────────────────────────┬───────────────────────────┤
│   Supabase             │   WebSocket Server         │
│   - Auth + roluri      │   Node.js + Socket.io      │
│   - PostgreSQL (DB)    │   Sesiuni Triviador live    │
│   - Row Level Security │   Lobby, chat, game state  │
│   - Storage (assets)   │   Hosted: Railway           │
│   - EU region (GDPR)   │                            │
│   Hosted: Supabase     │                            │
└────────────────────────┴───────────────────────────┘
```

### Cost estimat M1
| Serviciu | Plan | Cost/lună |
|---|---|---|
| Vercel (web client) | Hobby → Pro când comercial | €0 → €20 |
| Supabase | Pro (EU Frankfurt) | ~€23 |
| Railway (WebSocket server) | Starter | €5–15 |
| **Total** | | **~€30–40** |

> La 100 useri concurenți: același stack, ~€50–60/lună.
> Scalare: upgrade plan Supabase + mai multe instanțe Railway. Fără rewrite.

---

## Roluri utilizatori

| Rol | Drepturi principale |
|---|---|
| **Admin** | Acces total |
| **Profesor** | Aparține unei școli; scrie întrebări în DB; creează/configurează challenge-uri; chat în lobby; poate moddera sesiuni cu elevi |
| **Părinte** | Nedefinit complet; chat posibil în anumite contexte; low priority M1 |
| **Elev** | User standard; aparține unei școli; are profesor asociat; acces la toate funcțiile de bază |
| **Anonim** | Poate crea și joina sesiuni Triviador; drepturi minime |

### Relații între entități
- Profesor → Școală (many-to-one)
- Elev → Școală (many-to-one)
- Elev → Profesor (many-to-one, în cadrul școlii)
- Elev → Părinte (many-to-one, TBD)
- Verificarea legăturilor cu școala: proces separat, TBD

---

## Lumile ColabMe

### Lumea Online (PvP — „Triviador")
Competiție de cunoștințe în timp real.

**M1 — 1v1:**
- Lobby vizibil tuturor: sesiuni disponibile, tipul userului afișat
- Oricine poate crea sau joina o sesiune
- Chat în lobby: Admini + Profesori mereu; Părinți și Elevi în anumite contexte (cu adult verified)
- Sesiune 1v1 configurabilă: timer per întrebare (on/off + durată), număr de întrebări, categorie
- Răspunsuri semi-simultane: serverul trimite întrebarea la amândoi simultan; când primul răspunde, celălalt primește un interval de grație; serverul reține răspuns + timestamp pentru fiecare
- Scorare: corectitudine + viteză (mai rapid = mai multe puncte); răspuns greșit sau timeout = 0 puncte, fără penalizare; nu există „pass"
- După fiecare întrebare: răspunsul corect afișat ambilor jucători, indiferent de rezultat
- Câștigă cel cu cele mai multe puncte la final
- Deconectare mid-game: jucătorul rămas termină quizul; disconnected player păstrează scorul acumulat; câștigă cel cu scor mai mare
- Rezultatele sesiunilor se acumulează la nivel de școală (leaderboard școală → regiune → țară)
- Serverul este sursa de adevăr — clienții doar afișează starea primită

**Formate de întrebări (extensibile):**

| Format | Status | Descriere |
|---|---|---|
| `multiple_choice` | M1 default | 4 variante, una corectă |
| `free_text` | M2+ | Răspuns scris liber |
| `challenge` | M2+ | Challenge complex (referențiază conținut din lecții, variabile configurabile) |

**M2+ — extindere:**
- Sesiuni de echipă
- Editor challenge-uri pentru profesori (referențiere lecție + range-uri de valori pentru dificultate variabilă)
- Moduri de joc configurabile (condiție de câștig, reguli speciale)

### Lumea Lectiilor (async)
Conținut educațional multi-format, parcurs în ritm propriu.

**Tipuri de experiențe (web, R3F):**
- Prezentare 3D morfologie (ex: tipuri de bacterii — sferică, cilindrică, spiralată, șirag, ciorchine)
- Builder circuit electric (componente reale accesibile, exercițiu cu echivalent fizic)
- Simulări parametrice (gen PhET Colorado, standard modern)
- Experiență tip Tamagotchi cu semințe de plante (TBD: lecție / laborator / spațiu propriu)

> Asset-urile 3D (GLB) sunt create de technical artist (owner proiect).
> Integrare web: Three.js / React Three Fiber (fundație deja construită).
> Conținutul din lecții poate fi referențiat în întrebările din Lumea Online.

---

## Division of labor

| Responsabilitate | Owner |
|---|---|
| Cod (frontend, backend, infra) | AI (Cursor) |
| Arhitectură, planning, securitate | AI (Cursor) |
| Design experiență, UX decisions | Technical Artist |
| Assets 3D (GLB, animații, efecte) | Technical Artist |
| Assets 2D, branding | Technical Artist |
| Integrarea assets în experiență | Technical Artist + AI |

---

## Schema bază de date (Supabase PostgreSQL)

### Tabele principale

**`schools`**
| Câmp | Tip | Notă |
|---|---|---|
| id | uuid PK | |
| name | text | |
| region | text | |
| country | text | default 'RO' |
| created_at | timestamptz | |

**`user_profiles`** (extinde `auth.users` din Supabase)
| Câmp | Tip | Notă |
|---|---|---|
| id | uuid PK | = auth.users.id |
| display_name | text | |
| role | enum | admin, profesor, parinte, elev, anonim |
| school_id | uuid FK → schools | null pentru anonim |
| xp | int | default 0 |
| created_at | timestamptz | |

**`questions`**
| Câmp | Tip | Notă |
|---|---|---|
| id | uuid PK | |
| type | enum | multiple_choice (M1); free_text, challenge (M2+) |
| text | text | |
| options | jsonb | array de stringuri pentru multiple_choice |
| correct_answer | text | |
| explanation | text | afișat după fiecare întrebare |
| default_timer_sec | int | setat la crearea întrebării |
| difficulty | int | 1–5 |
| category | text | |
| created_by | uuid FK → user_profiles | |
| created_at | timestamptz | |

**`quiz_sessions`**
| Câmp | Tip | Notă |
|---|---|---|
| id | uuid PK | |
| created_by | uuid FK → user_profiles | |
| status | enum | waiting, starting, active, finished, abandoned |
| config | jsonb | { timer_sec, question_count, category } |
| player1_id | uuid FK → user_profiles | |
| player2_id | uuid FK → user_profiles | null până joinează |
| winner_id | uuid FK → user_profiles | null până la final |
| started_at | timestamptz | |
| ended_at | timestamptz | |

**`session_questions`**
| Câmp | Tip | Notă |
|---|---|---|
| session_id | uuid FK → quiz_sessions | |
| question_id | uuid FK → questions | |
| order_index | int | ordinea în sesiune |

**`session_answers`**
| Câmp | Tip | Notă |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK | |
| question_id | uuid FK | |
| player_id | uuid FK → user_profiles | |
| answer | text | |
| answered_at | timestamptz | pentru calculul vitezei |
| is_correct | bool | |
| points_awarded | int | |

**`leaderboard`** — view calculată (nu tabel separat)
Agregare din `session_answers`: total puncte per user, rankuri pe școală / regiune / țară.

---

## WebSocket server — state machine (sesiune 1v1)

### Stări
```
WAITING        → sesiunea e în lobby, așteaptă al doilea jucător
STARTING       → amândoi sunt în cameră, countdown 3-2-1
QUESTION_ACTIVE → întrebarea trimisă la amândoi, timere pornite
QUESTION_GRACE  → primul a răspuns; celălalt are intervalul de grație
ROUND_RESULT   → ambii au răspuns sau grația a expirat; afișăm rezultatul
GAME_OVER      → toate întrebările epuizate; scor final, salvare în DB
ABANDONED      → un jucător s-a deconectat; restul continuă; scor comparat la final
```

### Evenimente

**Client → Server**
| Eveniment | Date |
|---|---|
| `lobby:join` | — |
| `session:create` | config { timer_sec, question_count, category } |
| `session:join` | session_id |
| `session:answer` | question_id, answer |
| `lobby:chat` | text |
| `session:leave` | — |

**Server → Client**
| Eveniment | Când | Date |
|---|---|---|
| `lobby:state` | join + orice schimbare | lista sesiuni disponibile |
| `session:starting` | al doilea jucător a joinat | countdown, info jucători |
| `session:question` | fiecare întrebare | text, opțiuni, timer_sec, index |
| `session:opponent_answered` | primul a răspuns | timp rămas de grație |
| `session:round_result` | grație expirată / ambii răspuns | răspuns corect, puncte rundă, scoruri totale |
| `session:game_over` | toate întrebările epuizate | scoruri finale, winner_id |
| `session:player_disconnected` | deconectare | player_id, scor acumulat |
| `lobby:chat_message` | cineva trimite în chat | user info, text, role |

### Formula de scorare
```
puncte_runda = corect ? (100 + floor((timp_ramas / timer_sec) × 50)) : 0
```
Corect instant = 150p · Corect la limită ≈ 100p · Greșit / timeout = 0p

Serverul este sursa de adevăr. Clienții afișează starea primită, nu calculează nimic local.

---

## Hosting și infrastructură

| Serviciu | Rol | Plan inițial | Cost/lună |
|---|---|---|---|
| Vercel | Web client (colabme.eu) | Hobby → Pro când comercial | €0 → €20 |
| Supabase | DB + Auth + Storage | Pro, EU region (Frankfurt) | ~€23 |
| Railway | WebSocket server | Starter | €5–15 |
| **Total** | | | **~€30–40** |

**Flux de hosting în etape:**
1. **Dev**: totul pe localhost; ngrok pentru teste externe punctuale
2. **M1 launch**: Vercel (colabme.eu) + Supabase Pro EU + Railway
3. **Scalare**: upgrade planuri; fără rewrite de arhitectură

**GDPR**: date în EU (Supabase Frankfurt); platformă cu minori → consimțământ parental TBD.

---

## Milestone-uri

### Milestone 1 (în lucru)

Ordinea de implementare (fiecare pas are propriile task-uri, detaliate când ajungem acolo):

```
1. Supabase setup
   Schema DB, Auth configurat, Row Level Security pe tabele sensibile

2. Auth web client
   Login / register, sesiune persistentă, roluri vizibile în UI

3. WebSocket server (local → Railway)
   Lobby + sesiune 1v1: state machine, events, scorare
   (poate rula în paralel cu pasul 6 dacă assets 3D sunt gata)

4. UI Lobby + Joc
   Pagina lobby, pagina sesiune activă, afișare rezultate

5. Teacher interface
   Scriere întrebări în DB prin web

6. Lumea Lectiilor — primele experiențe 3D
   Bacterii morfologie + 1-2 experiențe suplimentare
   (assets GLB furnizate de technical artist)

7. Deploy M1
   colabme.eu pe Vercel + Supabase Pro EU + Railway
   GDPR basics: date în EU, privacy policy placeholder
```

> Taskurile din fiecare pas se detaliază când ajungem la acel pas.
> Ordinea se poate ajusta dacă apar dependențe noi.

### Milestone 2+ (TBD)
- Sesiuni de echipă în Triviador
- Editor challenge-uri pentru profesori
- Clienți Unreal Engine (mobile/PC)
- Extensie Lumea Lectiilor
- Funcții sociale / comunitate
- Hardware bridge (RPi, Arduino)

### Milestone 2+ (TBD)
- Sesiuni de echipă în Triviador
- Editor challenge-uri pentru profesori
- Clienți Unreal Engine (mobile/PC)
- Extensie Lumea Lectiilor
- Funcții sociale / comunitate
- Hardware bridge (RPi, Arduino)

---

## Note tehnice

- **GDPR**: Platformă cu minori (elevi) → date în EU (Supabase Frankfurt), consimțământ parental TBD
- **Securitate**: Row Level Security în Supabase pe toate tabelele sensibile
- **Assets 3D web**: GLB optimizat pentru web (Draco compression recomandat pentru modele mari)
- **Repo curent**: `danjisan.github.io` = web client sandbox. La M1 final → deploy pe `colabme.eu`.
- **Branding**: Logo SVG + PNG în `public/branding/`. SVG preferabil peste tot.
