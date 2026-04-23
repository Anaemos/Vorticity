# Vorticity — Frontend

This is the web interface for the Vorticity market intelligence system. It is a Next.js 16 app written in TypeScript that reads static JSON files from GitHub and renders them as a financial dashboard. There is no backend server, no database, and no API of its own — everything the frontend knows about market conditions comes from the JSON files that `pipeline.py` writes and pushes to the repository every night.

---

## How it connects to the ML pipeline

The Python pipeline runs nightly, fetches fresh OHLCV data for each instrument, runs HMM regime detection and TFT inference, and writes one JSON file per ticker into `data/results/`. It then commits and pushes those files to GitHub. The frontend fetches those files directly from GitHub's raw content URL at page load time:

```
https://raw.githubusercontent.com/YOUR_USER/Vorticity/main/data/results/HDFCBANK_NS.json
```

The dashboard fetches all 21 tickers in parallel when you open `/dashboard`. Each fetch either succeeds and returns data, or fails silently — that ticker is dropped from the grid with no crash. If a ticker's JSON doesn't exist yet (pipeline hasn't run for it, or models aren't trained), its card simply won't appear.

JSON fetches use `cache: 'no-store'` so users always get the freshest data after a pipeline push. The price chart fetches go through a server-side API proxy (`/api/price`) which caches Yahoo Finance responses for 15 minutes, refreshing automatically during market hours.

---

## File structure

```
frontend/
|
+-- app/                            Next.js App Router pages
|   |
|   +-- page.tsx                    Splash / landing page
|   +-- layout.tsx                  Root layout — fonts, metadata template, wraps all pages
|   +-- globals.css                 All design tokens (CSS variables), shared classes
|   +-- not-found.tsx               Custom 404 page shown for any unknown URL
|   +-- error.tsx                   Global error boundary — shown if a page fetch throws
|   |
|   +-- api/
|   |   +-- price/
|   |       +-- route.ts            Server-side Yahoo Finance proxy (avoids CORS)
|   |
|   +-- dashboard/
|   |   +-- page.tsx                Server component — fetches all tickers, passes to client
|   |   +-- DashboardClient.tsx     Client component — filter and sort state, renders grid
|   |   +-- loading.tsx             Skeleton loader shown while dashboard fetches
|   |   |
|   |   +-- [ticker]/
|   |       +-- page.tsx            Detail page per instrument (e.g. /dashboard/HDFCBANK)
|   |
|   +-- help/
|       +-- page.tsx                Glossary index — all 10 terms grouped by category
|       |
|       +-- [term]/
|           +-- page.tsx            Individual term page (e.g. /help/entropy)
|
+-- components/
|   |
|   +-- Header.tsx                  Sticky top bar — logo, live IST clock, HELP link
|   +-- SummaryBar.tsx              7 aggregate stats across all loaded tickers
|   +-- FilterBar.tsx               Regime and stability filter buttons, sort dropdown
|   +-- TickerCard.tsx              Instrument card shown in the dashboard grid
|   |
|   +-- detail/
|       +-- RiskPanel.tsx           TFT risk gauges, VaR, return range, entropy
|       +-- TransitionMatrix.tsx    3x3 regime transition probability table
|       +-- ReturnChart.tsx         1-year price chart (live from Yahoo) + volatility bars
|       +-- RegimeStatsTable.tsx    Full distribution stats for all three regimes
|
+-- lib/
|   +-- types.ts                    TypeScript interfaces matching the pipeline JSON schema
|   +-- data.ts                     Ticker registry, fetch functions, slug/ticker helpers
|   +-- fmt.ts                      Number formatters, color logic, bar width calculations
|   +-- helpContent.ts              All glossary content — 10 terms, 3 groups
|
+-- public/
|   +-- mini.svg                    Vorticity logo used on splash page
|
+-- .env.local                      Local env vars (not committed)
+-- next.config.ts                  Security headers, React compiler flag
+-- tsconfig.json
+-- package.json
```

---

## Routes

```
/                       Splash page — typewriter intro then particle landing
/dashboard              Main grid of all instrument cards
/dashboard/HDFCBANK     Detail page for HDFC Bank
/dashboard/GOLDBEES     Detail page for Nippon Gold BeES
... (one route per ticker, slug is ticker symbol without .NS)
/help                   Glossary index
/help/regime            Individual term — Volatility Regime
/help/entropy           Individual term — Entropy
/help/var               Individual term — Value at Risk
... (one route per term slug, 10 total)
```

`[ticker]` and `[term]` are Next.js dynamic route folders — one folder handles all instrument URLs, one handles all glossary URLs. The slug is the ticker symbol with `.NS` stripped, so `HDFCBANK.NS` becomes `/dashboard/HDFCBANK`. The `.NS` is still shown in the UI wherever it matters for clarity.

---

## Pages in detail

### Splash page (app/page.tsx)

Two phases run sequentially inside the same component. First the typewriter intro: the quote types character by character using a `sleep` loop in a `useEffect`, with a single blinking cursor that starts on line 1 and moves to line 2 at the right moment. Both text lines glow with a cyan `textShadow`. The intro fades out after roughly 5 to 6 seconds then the landing content fades in.

The particle effect spawns DOM divs at the cursor position on mousemove. Each particle has velocity and a `life` value decrementing each frame. The physics apply a vortex: particles are pulled toward the screen center and experience a sideways swirl force, spiralling inward. Particles are blocked from spawning when the cursor is inside the bounding box of the central content div, so they only appear in the empty background areas.

### Dashboard (app/dashboard/page.tsx + DashboardClient.tsx)

A server component fetches all 21 JSONs in parallel and passes the results as props to `DashboardClient`, which is a client component holding filter and sort state. The split means data fetching happens server-side while interactivity runs client-side. While fetching, Next.js automatically shows `loading.tsx` — 21 shimmer skeleton cards matching the real layout.

The empty state handles two distinct cases: `data.length === 0` means all fetches failed (shows a diagnostic message about env vars and pipeline), while `filtered.length === 0` with data present means the current filters match nothing (shows a simple "no results" message).

Cards sit in a fixed 3-column grid. High-regime cards have a slow pulsing red glow via CSS animation. Clicking any card navigates to that instrument's detail page.

### Detail page (app/dashboard/[ticker]/page.tsx)

A server component. Reads the ticker slug from URL params (awaited as a Promise, required by Next.js 15), converts it to a full ticker symbol, fetches the JSON, and renders four panels. The page title is set per-instrument via `generateMetadata` so browser tabs show "HDFCBANK — Vorticity" rather than just "Vorticity".

`ReturnChart` is the only client component on the page because it fetches live price data and uses the browser. It calls `/api/price?ticker=HDFCBANK.NS&range=1y` which routes through the server-side proxy to Yahoo Finance. The result is a Google Finance style area line chart in pure SVG — no charting library, no heavy dependencies. Mouse hover shows a crosshair tooltip with price and date. A range selector (3M / 6M / 1Y / 2Y) re-fetches automatically. Below the chart, volatility bars compare standard deviation across all three regimes.

### API proxy (app/api/price/route.ts)

A Next.js API route that fetches from Yahoo Finance server-side, bypassing CORS. Inputs are sanitized: the `range` parameter is validated against a whitelist of allowed values, and the ticker string is stripped of any character that isn't alphanumeric, a dot, a caret, or a hyphen, then capped at 20 characters. This prevents the route from being used to proxy arbitrary URLs.

### Help pages (app/help/)

All content lives in `lib/helpContent.ts` as a plain TypeScript object — 10 terms, each with `slug`, `group`, `summary`, `detail`, `example`, and `seeAlso`. The index page groups them into three categories. Individual term pages set their own browser title via `generateMetadata`. Both pages are server components with no client-side state.

### Error handling

`app/not-found.tsx` — shown for any URL that doesn't match a route or when `notFound()` is called (bad ticker slug, unknown help term). Styled to match the design system with a link back to dashboard.

`app/error.tsx` — global error boundary. If any server component throws (GitHub unreachable, malformed JSON, network timeout), this page catches it and shows a "Try again" button that calls `reset()` to re-render without a full reload.

---

## Design system

Everything visual is defined as CSS custom properties in `globals.css`. No color values are hardcoded in component files — everything references variables like `var(--low)`, `var(--high)`, `var(--accent)`. Changing the palette is a single-file edit.

```
--bg       #0d1117   page background
--bg2      #111827   card and panel surfaces
--bg3      #161f2e   hover state for cards
--bg4      #1c2638   bar track backgrounds (empty portion)
--border   #1e2d45   card borders
--border2  #2a3d5c   hover borders
--dim      #d8d4fa   faintest text — labels, dates, section headers
--muted    #c8d6e8   secondary text
--base     #e8f3fc   primary text
--accent   #00e5ff   cyan — links, highlights, cursor, logo border
--low      #00c47a   green — Low regime, low risk
--med      #f5a623   amber — Medium regime, moderate risk
--high     #e84040   red — High regime, high risk
```

Font is IBM Plex Mono for all data, labels, and UI chrome. IBM Plex Sans is used only for names, descriptions, and longer prose where monospace would be hard to read. Both loaded from Google Fonts via `globals.css`.

Color thresholds for risk values are calibrated to the actual model output ranges rather than a naive 0 to 1 scale. `riskBarWidth` in `fmt.ts` scales against a 0.40 maximum because real TFT transition risk outputs rarely exceed 0.40 on normal days. Entropy bars scale against 0.60 for the same reason.

Security headers are applied globally in `next.config.ts`: `X-Frame-Options: DENY` (prevents clickjacking), `X-Content-Type-Options: nosniff` (prevents MIME sniffing), and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## Data flow summary

```
pipeline.py runs nightly (Windows Task Scheduler, 4 PM IST)
    |
    writes data/results/TICKER_NS.json  (one per instrument, 21 total)
    |
    git push to GitHub main branch
    |
Next.js dashboard page (server side, cache: no-store)
    |
    fetch() all 21 JSONs from raw.githubusercontent.com in parallel
    |
    passes data as props to DashboardClient
    |
    React renders 21 ticker cards in 3-column grid
    |
user clicks a card
    |
    navigates to /dashboard/HDFCBANK
    |
Next.js detail page (server side)
    |
    fetch() single JSON for that ticker
    |
    renders RiskPanel + TransitionMatrix + ReturnChart + RegimeStatsTable
    |
ReturnChart (client side)
    |
    fetch() /api/price?ticker=HDFCBANK.NS&range=1y
    |
Next.js API route (server side, cache: 15 min)
    |
    fetch() Yahoo Finance with browser-mimicking headers
    |
    returns OHLCV JSON to client
    |
    SVG area line chart renders in browser
```

---

## Environment variables

Create `frontend/.env.local` — already in `.gitignore`, never committed.

```
NEXT_PUBLIC_GITHUB_USER=your-github-username
NEXT_PUBLIC_GITHUB_REPO=Vorticity
NEXT_PUBLIC_GITHUB_BRANCH=main
```

On Vercel, add the same three variables under Project Settings -> Environment Variables.

---

## Running locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. The splash typewriter plays, then the dashboard loads. If `.env.local` is missing or `data/results/` hasn't been populated, the dashboard shows the "No data loaded" diagnostic message. Run `python pipeline.py --dry-run` from the repo root to generate the JSON files without pushing.

---

## Adding a new ticker

Two files need updating every time:

1. `tickers.json` in the repo root — for the pipeline
2. `frontend/lib/data.ts` in the TICKERS array — for the frontend

The entry in `data.ts`:

```ts
{ ticker: 'TICKER.NS', slug: 'TICKER', name: 'Full Name', category: 'Stock', sector: 'Sector Name', type: 'stock' },
```

The `slug` is the ticker without `.NS`. After adding, run the pipeline for that ticker to generate its JSON, push, and the card appears automatically. If the pipeline fails for the new ticker it likely means the HMM and TFT models haven't been trained for it yet — run notebook 07 first.

---

## Known limitations

**Model weights are local.** The `.pkl` and `.pt` model files live on the developer's machine and are not in the repository (too large, and unnecessary for the frontend). This means the pipeline can only run on that machine. GitHub Actions cannot run the pipeline without those files being accessible.

**Yahoo Finance availability.** The price chart depends on Yahoo Finance's public API which has no SLA. If Yahoo changes their API or starts blocking the proxy's user agent, the chart will show an error while everything else on the detail page continues to work normally.

**No real-time data.** The regime labels, risk scores, and all stats in the cards are from the previous night's pipeline run. The price chart is live but everything else updates once per day at most.

---

## Dependencies

```
next                16.2.1    framework, routing, server components, API routes
react               19.2.4    UI rendering
typescript          5.x       type safety throughout
lightweight-charts  5.x       (installed but no longer used in production — SVG chart replaced it)
tailwindcss         4.x       utility classes for layout and spacing
IBM Plex Mono                 loaded from Google Fonts via globals.css
IBM Plex Sans                 loaded from Google Fonts via globals.css
```

No state management library, no component library, no icon set. Styling is almost entirely inline styles referencing CSS variables, with Tailwind used only for a handful of layout utilities.
