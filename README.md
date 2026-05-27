# LaunchTracker

A space launch tracking app built with React 19 and Vite. Browse upcoming and past rocket launches, read the latest space news, and get notified before missions you care about.

![A rocket launches](spacex-OHOU-5UVIYQ-unsplash.jpg)
Photo by [SpaceX](https://unsplash.com/@spacex) on [Unsplash](https://unsplash.com/photos/gray-spacecraft-taking-off-during-daytime-OHOU-5UVIYQ)

## Features

- **Live Launch Data** — Upcoming and past launches from [The Space Devs Launch Library 2 API](https://thespacedevs.com/llapi), refreshed with a 1-minute client-side cache and background revalidation
- **Space News Highlight** — 5 latest articles from the [Spaceflight News API](https://www.spaceflightnewsapi.net/) displayed at the top of the home page, with a link to the full news feed
- **Live T-minus Countdown** — Per-launch countdown that ticks to zero and flips to "Launched"
- **Launch Window Slider** — Visual progress bar showing the open/close window and liftoff time
- **Watchlist** — Star launches to save them; filter the list to watched items only
- **Launch Alerts** — Browser notification subscriptions for launches, with 1-hour and 10-minute reminders
- **Search, Filter & Sort** — Real-time keyword search across name, provider, rocket, and location; dropdowns for provider / rocket / location; sort by date or name
- **Calendar View** — Monthly calendar of upcoming launches (upcoming tab only)
- **Grid & Calendar toggle** — Switch between card grid and calendar layout
- **Pagination** — 10 / 20 / 30 / 50 results per page
- **Multi-stream Watch Live** — Direct link(s) to launch streams when available
- **Starfield background** — Canvas-drawn starfield with nebula colour washes, redrawn only on resize (zero steady-state CPU cost)
- **Edge-cached image proxy** — Launch images routed through a Vercel edge function with a 24-hour `s-maxage` to avoid repeated upstream fetches
- **Responsive & dark** — Mobile-first layout, dark space theme (`bg-black`, accent `#7f1212`)

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Routing | React Router v7 |
| Launch data | The Space Devs Launch Library 2 API (v2.3.0) |
| News data | Spaceflight News API v4 |
| Hosting | Vercel (serverless functions in `api/`) |
| Testing | Vitest + React Testing Library |

## Routes

| Path | Component | Description |
|---|---|---|
| `/` | `LaunchList` | Paginated grid with news highlight, search, filter, and calendar view |
| `/launch/:id` | `LaunchDetails` | Full mission detail — rocket, booster, payload, related articles |
| `/news` | `NewsFeed` | Scrollable grid of the latest space news articles |

## Project Structure

```
├── api/
│   ├── image.js          # Edge image proxy (24h cache)
│   ├── launch/[id].js    # Single-launch detail endpoint
│   ├── launches.js       # Launch list endpoint with field normalisation
│   └── news.js           # Spaceflight News API proxy
├── public/
│   ├── launch-placeholder.svg
│   └── manifest.json
└── src/
    ├── components/
    │   ├── CalendarView.jsx
    │   ├── Countdown.jsx
    │   ├── Header.jsx
    │   ├── HeroBanner.jsx
    │   ├── LaunchCard.jsx
    │   ├── LaunchDetails.jsx
    │   ├── LaunchList.jsx
    │   ├── NewsFeed.jsx
    │   ├── NewsHighlight.jsx
    │   └── SearchBar.jsx
    ├── hooks/
    │   ├── useNotifications.js   # Browser notification subscriptions
    │   └── useWatchlist.js       # localStorage-backed watchlist
    ├── test/
    │   └── setup.js              # Vitest + jest-dom setup
    ├── utils/
    │   └── drawStarField.js      # Canvas starfield renderer
    ├── App.jsx
    ├── index.css
    └── main.jsx
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone git@github.com:samuel-sarmah/library.git
cd library
npm install
```

### Development

```bash
npm run dev        # http://localhost:5173
```

The dev server proxies `/api/launches`, `/api/launch/:id`, and `/api/news` directly to the upstream APIs, so no Vercel CLI is needed during development.

#### Optional: API key

Create `.env.local` (already gitignored) to use an authenticated Space Devs account and avoid free-tier rate limits:

```
SPACE_DEVS_API_KEY=your_key_here
```

### Production Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the dist/ build locally
```

Deploy to Vercel — the `api/` directory is picked up automatically as serverless functions.

## Testing

```bash
npm test           # run all tests once
npm run test:watch # watch mode
```

The suite covers:

| File | What's tested |
|---|---|
| `src/utils/drawStarField.test.js` | Canvas dimensions, gradient calls, star arc count |
| `src/hooks/useWatchlist.test.js` | Toggle add/remove, localStorage persistence, corruption handling |
| `src/hooks/useNotifications.test.js` | Permission states, subscribe/unsubscribe, localStorage |
| `src/components/Countdown.test.jsx` | Compact + prominent variants, timer transition, T- prefix |
| `src/components/Header.test.jsx` | Links, active state, sticky class |
| `src/components/SearchBar.test.jsx` | Type toggle, search, filter expand/collapse, callbacks |
| `src/components/LaunchCard.test.jsx` | Mission name, badges, navigation, Save/Notify/Watch Live |
| `src/components/NewsHighlight.test.jsx` | Skeleton, articles, fallback, See More, error → null |
| `api/news.test.js` | URL construction, params, cache headers, 504/502 error paths |

## API Proxy

Two environments use the same `/api/*` URL shape:

**Development**: Vite `server.proxy` in `vite.config.js` rewrites requests and optionally injects `SPACE_DEVS_API_KEY`.

**Production (Vercel)**: Serverless functions in `api/` handle the same routes and apply normalisation and caching:

| Endpoint | Function | Notes |
|---|---|---|
| `GET /api/launches` | `api/launches.js` | `?type=upcoming\|previous&limit=N`; normalises field aliases |
| `GET /api/launch/:id` | `api/launch/[id].js` | `?mode=detailed`; 8 s abort timeout |
| `GET /api/image` | `api/image.js` | `?url=<encoded>`; `s-maxage=86400` |
| `GET /api/news` | `api/news.js` | `?limit=N&launch=<id>`; `s-maxage=300` |

## License

MIT
