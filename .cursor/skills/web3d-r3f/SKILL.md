---
name: web3d-r3f
description: Conventions for React Three Fiber (R3F) 3D development in ColabMe. Use when working on 3D viewers, GLB models, interactive 3D experiences, ModelBox, ModelViewer3D, lesson templates with 3D content, or any @react-three/fiber / @react-three/drei code.
---

# Web 3D cu R3F în ColabMe

## Stack 3D existent

```
@react-three/fiber    — Canvas, useFrame, hooks R3F
@react-three/drei     — OrbitControls, Bounds, Center, useGLTF, useAnimations
three                 — tipuri TypeScript
```

## Componente existente (reutilizează, nu recrea)

| Componentă | Fișier | Rol |
|---|---|---|
| `ModelBox` | `src/components/media/ModelBox.tsx` | Shell cu activare tap, fullscreen, scroll-lock |
| `ModelViewer3D` | `src/components/media/ModelViewer3D.tsx` | Canvas R3F cu OrbitControls, Bounds, animații auto |

`ModelBox` învelește `ModelViewer3D` cu lazy import — folosește `ModelBox` când vrei viewer simplu în pagini.

Pentru template-uri de lecție cu interacțiuni custom, creează un Canvas propriu în template, nu extinde `ModelViewer3D`.

## Reguli mobile-first pentru 3D

- `dpr={[1, 2]}` pe Canvas — limitează pixel ratio
- Evită geometrii complexe (>50k poly) fără LOD pe mobile
- Interacțiunile touch: folosește `onPointerDown/Up/Move` nu `onClick` pe mesh-uri 3D
- Nu bloca scroll-ul paginii cu canvas — activare explicită (tap to activate)
- Landscape mobil: limitează înălțimea canvas cu `max-height: 60vh`

## GLB-uri

- Furnizate de Dan (artist tehnic) ca fișiere locale sau URL Supabase Storage
- URL Storage: `https://<project>.supabase.co/storage/v1/object/public/lesson-thumbnails/<file>.glb`
- Încarcă cu `useGLTF(url)` — drei face caching automat
- Placeholder până la GLB real: div CSS cu emoji/text, nu un mesh generat

## Pattern Canvas în template de lecție

```tsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";

// Canvas dedicat templateului — nu folosiți ModelBox pentru interacțiuni complexe
<Canvas
  camera={{ position: [0, 1.5, 4], fov: 50 }}
  dpr={[1, 2]}
  style={{ height: "min(400px, 55vh)" }}
>
  <ambientLight intensity={0.8} />
  <directionalLight position={[5, 6, 4]} intensity={1.4} />
  <Suspense fallback={null}>
    {/* conținut scenă */}
  </Suspense>
  <OrbitControls enablePan={false} />
</Canvas>
```

## Anti-pattern-uri

- Nu importa `three` direct pentru mesh-uri simple — folosește JSX R3F (`<mesh>`, `<boxGeometry>`)
- Nu folosi `useEffect` pentru animații per-frame — folosește `useFrame`
- Nu crea Canvas multiple pe aceeași pagină fără necesitate
- Nu pune `position: fixed` pe canvas în template — poate conflicta cu layout-ul lecției
