# Akış

A mobile-first PWA that replaces Instagram scrolling with a structured Turkish grammar feed — rules as formulas, immediate drilling, vocabulary through exposure, ordered by a real spaced-repetition engine (FSRS).

**Docs:** [PDR.md](PDR.md) (project definition) · [docs/CURRICULUM.md](docs/CURRICULUM.md) (grammar source of truth) · [docs/CONTENT_AUTHORING.md](docs/CONTENT_AUTHORING.md) (card contract)

## Quickstart

```sh
npm install
npm run dev              # dev server
npm test                 # domain unit tests (Vitest)
npm run typecheck        # tsc
npm run validate-content # 3-gate content check (schema · grammar · vocabulary)
npm run build            # production build (dist/)
```

## Stack

React 18 · TypeScript · Vite · Zustand+Immer · Dexie (IndexedDB) · ts-fsrs · Zod · vite-plugin-pwa (Workbox)

## Deploy (GitHub Pages)

1. Create a GitHub repo (e.g. `Akis`) and push `main`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Every push to `main` runs [deploy.yml](.github/workflows/deploy.yml): validate → build (with `VITE_BASE=/<repo>/`) → publish.
4. Install on iPhone: open the Pages URL in Safari → Share → **Add to Home Screen**.

## Project layout

```
src/
  content/   curriculum JSON + Zod schemas + allowlist (validated in CI)
  domain/    pure logic — turkish engine, srs, feed, answer checking (no React)
  data/      Dexie (IndexedDB) stores
  app/       shell, global styles
  features/  feed / lesson / exercise / review / stats UI  (Phase 1+)
scripts/     validate-content, icon generation
docs/        curriculum + authoring contract
```

## Status

Phase 0 (scaffold) — shell, schemas, validator, harmony engine, CI. See PDR §12 for the phase plan.
