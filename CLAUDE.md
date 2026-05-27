# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at http://localhost:5173
npm run build      # Production build to dist/
npm run preview    # Preview production build locally
npm run lint       # Run ESLint
```

There is no test suite configured.

## Local skills

`.agents/skills/prototype/` defines a `/prototype` skill. Use it when the user wants to explore a design before committing:

- **Logic question** (state model, data shape) → builds an interactive terminal app. Logic goes in a pure module; a thin TUI shell drives it. One command to run via `package.json` scripts.
- **UI question** (what should this look like) → generates 3 radically different variants on a single route, switchable via `?variant=` URL param and a floating bottom bar. Strongly prefer embedding variants in an **existing route** (sub-shape A) over a throwaway route (sub-shape B). The switcher is hidden in production builds.

Both shapes produce throwaway code. When the question is answered, fold the winner into real code and delete the prototype.

## Architecture

**LaunchTracker** is a React 19 SPA (Vite + Tailwind CSS v4) that tracks space launches using [The Space Devs Launch Library 2 API](https://thespacedevs.com/llapi).

### Routes

- `/` → `LaunchList` — paginated grid with search, filter, and sort
- `/launch/:id` → `LaunchDetails` — detailed view with rocket/mission/booster info

`LaunchDetails` receives the list-card data via React Router `location.state` for an instant render, then immediately fires a second fetch to `/api/launch/:id` (`mode=detailed`) to hydrate the full details.

### API proxy — two environments

**Development**: Vite's `server.proxy` in `vite.config.js` rewrites `/api/launches` and `/api/launch/:id` to `https://ll.thespacedevs.com/2.3.0/launches/...` and optionally injects a `SPACE_DEVS_API_KEY` from `.env.local`.

**Production (Vercel)**: Serverless functions under `api/` handle the same routes:
- `api/launches.js` — list endpoint; normalizes the upstream response (aliases `window_start/end` → `window_open/close`, `net` → `liftoff_exact`, and de-duplicates video URLs across several legacy field names)
- `api/launch/[id].js` — detail endpoint with an 8-second abort timeout
- `api/image.js` — image proxy that caches upstream images at the edge (24h `s-maxage`) to avoid repeated fetches

### Image handling

`toImageSrc(url)` in `LaunchCard` and `LaunchDetails`:
- In **dev** (`import.meta.env.DEV`): returns the URL directly (no proxy, avoids hot-reloading overhead)
- In **production**: wraps the URL as `/api/image?url=<encoded>` to route through the edge cache

Cards attempt `thumbnail_url` first, fall back to `image_url`, then `/launch-placeholder.svg` (public/). The fallback chain is tracked with `imageStage` state (0 → 1 → 2).

### Client-side caching

`LaunchList` keeps a module-level `launchCache` object (`{ upcoming, previous }`) with a 1-minute TTL. On navigation back from the detail page the cached data renders immediately; a background revalidation runs if the cache is stale. On mount it also idle-prefetches the opposite type (`requestIdleCallback` with 500 ms timeout fallback).

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin — no separate `tailwind.config.js` needed. Dark space theme: `bg-black` base, accent color `#7f1212` (dark red). All layout is Tailwind utility classes directly in JSX; there is no separate component CSS except `src/index.css` for global resets.

### Environment variables

| Variable | Usage |
|---|---|
| `SPACE_DEVS_API_KEY` | Injected as `Authorization: Token <key>` header in dev proxy. Optional — free-tier requests work without it but hit rate limits faster. |

Create `.env.local` (already gitignored) to set this locally.
