# danjisan.github.io

Site personal — work in progress. Construit cu **Vite + React + TypeScript**, găzduit pe **GitHub Pages**.

## Dezvoltare locală

Cerință unică: [Node.js LTS](https://nodejs.org) (v20+).

```bash
npm install     # o singură dată (sau după modificări în package.json)
npm run dev     # server local cu live-reload → http://localhost:5173
```

## Build & Deploy

Nu e nevoie de build manual. La fiecare **push pe `master`**, GitHub Actions
(`.github/workflows/deploy.yml`) face build și publică automat pe
[danjisan.github.io](https://danjisan.github.io).

Pentru un build local de verificare:

```bash
npm run build    # verifică tipurile + generează dist/
npm run preview  # servește dist/ local, pentru testare
```

> **Setare necesară o singură dată:** în GitHub → Settings → Pages →
> „Build and deployment" → Source: **GitHub Actions**.

## Structură

```
src/
  components/   # componente reutilizabile (Header, ...)
  pages/        # o componentă per pagină (HomePage, AboutPage, ...)
  styles/       # global.css cu variabilele de temă
  App.tsx       # layout + definirea rutelor
  main.tsx      # punctul de intrare
```

## Plan de viitor

- [ ] Conținut pentru pagina Despre
- [ ] Login prin BaaS (Supabase / Firebase) — GitHub Pages e hosting static,
      deci autentificarea va folosi un serviciu extern
- [ ] Reintegrarea experimentelor WebAR ca secțiune separată
