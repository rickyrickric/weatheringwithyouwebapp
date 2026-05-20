# Weathering With You Web App

A full-stack weather intelligence dashboard for Tagum City, inspired by the atmosphere and emotional tone of *Weathering with You*. The app combines live OpenWeather data, short-term forecast smoothing, sunshine-window recommendations, and a cinematic responsive UI built for quick weather decisions.

The project is designed as a school web application, but it is structured like a small production app: React on the client, Express on the server, typed shared weather contracts, optional Supabase persistence, and environment-based API configuration.

## What It Does

- Shows current weather conditions for the configured location.
- Displays a 24-hour hourly forecast with temperature trend and rain probability.
- Supports deterministic daily weather outputs for backend analytics pipelines:
  - Daily maximum temperature
  - Daily rainfall amount (when available from source payload)
- Computes practical sunshine windows for morning, midday, and afternoon planning.
- Adapts the visual background to the active weather condition and time of day.
- Includes a dashboard view for model and pipeline context.
- Supports optional Supabase storage for daily observations and forecast snapshots.

## Recent Updates (May 2026)

- **Data Consistency:** Standardized time labels across the UI (for example, 23:59 → 23:00).
- **NOW Marker:** Enhanced the "NOW" marker for clearer current-time visibility in timeline views.
- **Redundancy Removal:** Removed duplicate window references and simplified sunshine-window logic.
- **Visual Tweaks:** Promoted `DateAnchor` prominence, lightened UI icons, and adjusted visual hierarchy for readability.
- **QA & Deployment:** Changes tested in-browser and deployed to GitHub with zero new errors.

- Shows live system status (footer) with pipeline health and forecast accuracy.
- Uses safe local environment files so API keys do not need to be committed.

## Main Screens

- `Home` - cinematic landing experience with current temperature and rain chance.
- `Forecast` - live current conditions, hourly forecast, weather image card, and optimal weather windows.
- `Dashboard` - model/pipeline-focused technical overview.
- `About` - project inspiration, feature summary, and architecture context.
 - `System Status` - footer panel showing pipeline health, latest accuracy metrics, and last-updated time.

## Tech Stack

Frontend:

- React 19
- TypeScript
- Vite
- React Router
- Recharts
- Tailwind CSS / custom CSS design system

Backend:

- Node.js
- Express
- TypeScript
- OpenWeather API
- Regression smoothing for forecast points
- Optional Supabase REST persistence

## System Design (Web App + API)

The system has two layers:

- Frontend (React + Vite): renders weather views, charts, sunshine windows, and dashboard context.
- Backend (Express API): fetches and transforms weather data, validates inputs, computes analytics outputs, protects upstream quotas, and persists daily records.

The frontend calls versioned backend routes under `/api/v1`, and the backend acts as a controlled weather-data gateway. This keeps API keys server-side and centralizes weather logic in one place. Legacy `/api/weather/*` routes are still mounted as compatibility aliases.

## Why OpenWeather Is Used

OpenWeather is the source of live weather truth for this project.

What it provides:

- Current conditions (temperature, humidity, pressure, wind, condition metadata)
- Forecast series (time-indexed points used for 24-hour prediction views)
- A practical and stable API shape for city or coordinate lookups

Why this matters:

- The app is focused on Tagum City and needs real-time, reliable weather inputs.
- OpenWeather supports both city query (`OPENWEATHER_CITY`) and coordinate query (`OPENWEATHER_LAT`, `OPENWEATHER_LON`).
- Backend mapping keeps frontend contracts consistent even if upstream payload fields evolve.

## Why Supabase Is Present

Supabase is used as optional persistence for daily weather routines and forecast snapshots.

What it stores:

- Daily observation row per location/day (`daily_weather_observations`)
- Daily forecast snapshot rows per location/day/time (`daily_weather_forecasts`)
- Hourly observation rows for climatology (`weather_observations`)
- Rolling 90-day hourly climatology materialized view (`hourly_climatology_90d`)

Why this matters:

- Enables weather pattern tracking over time
- Supports future model evaluation and accuracy reporting
- Allows deterministic daily outputs to be audited historically
- Keeps storage and security managed through PostgreSQL + RLS

If Supabase variables are not configured, the app still runs with live API responses only.

## End-to-End Data Flow

1. Frontend requests weather endpoints from the backend (`/api/v1/weather/*`).
2. Backend service reads location config (Tagum City by default through env).
3. Request query params are validated with Zod (`city` or `lat` + `lon`).
4. Backend serves cached weather data when available, otherwise calls OpenWeather through a circuit breaker.
5. Backend maps provider payloads to typed internal contracts.
6. Forecast points are smoothed using polynomial regression for cleaner trends.
7. Sunshine windows and optimal windows are computed from forecast quality scoring.
8. Response is returned with HTTP cache headers for rendering and offline reuse.
9. In parallel (optional), daily observation/forecast snapshots are upserted into Supabase.

## How Data Storage Works

Storage behavior is idempotent per day to prevent duplicate rows:

- Observations use conflict key: `location_id, observed_date`
- Forecasts use conflict key: `location_id, forecast_date, target_time`

This means repeated API calls on the same day update existing records instead of creating unlimited duplicates.

Stored payload includes:

- normalized numeric columns for querying
- source metadata
- raw JSON payload for traceability/debugging

## Supabase Outage Fallback Setup

Supabase is not only optional persistence here. It also acts as the backend fallback store when OpenWeather is unavailable.

To make that fallback work on a fresh Supabase project:

1. Apply the SQL in `server/migrations/001_weather_core.sql` and `server/migrations/003_hourly_climatology.sql` or run the combined `server/supabase-schema.sql`.
2. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`.
3. Keep the backend running long enough to sync live observations and forecast rows while OpenWeather is healthy.

Important for new Supabase projects:

- Supabase changed Data API defaults on April 28, 2026. New tables in `public` may not be reachable through `/rest/v1` unless you grant access explicitly.
- This repo now includes explicit `service_role` grants in the schema SQL so the backend can still read and write its weather cache tables and climatology view.

When OpenWeather fails, the backend now restores:

- current conditions from the latest synced hourly observation
- forecast data from the latest synced forecast rows
- forecast response metadata with `source: "supabase-sync"` and medium confidence

Schema changes now live in `server/migrations/`:

- `001_weather_core.sql` creates the weather tables, RLS policies, uniqueness constraints, and query indexes.
- `002_weather_retention.sql` creates archive tables and a retention function for records older than 30 days.
- `003_hourly_climatology.sql` creates hourly observations, rolling 90-day climatology, and the refresh function.

## Backfill Hourly Climatology

Apply `server/migrations/003_hourly_climatology.sql` in the Supabase SQL editor first. The backend cannot create tables through the Supabase REST API.

Then backfill April 12, 2026 through today:

```bash
cd server
npm run backfill:hourly
```

Override dates when needed:

```bash
npm run backfill:hourly -- --start=2026-04-12 --end=2026-05-12
```

The script reads `OPENWEATHER_LAT`, `OPENWEATHER_LON`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` from `server/.env`, pulls historical hourly weather from Open-Meteo Archive, upserts rows into `weather_observations`, then calls `refresh_hourly_climatology_90d()`.

## Retention Model (Rolling 30 Days)

Implemented database policy:

- Keep only the latest 30 days of hot weather records.
- Move older raw rows into archive tables before deletion from hot tables.
- Run `select public.archive_weather_records_older_than(interval '30 days');` from a daily Supabase scheduled job.

Why rolling retention:

- Preserves a continuous recent window for analysis and short-term model checks
- Prevents unbounded data growth
- Keeps query performance stable for dashboard and analytics endpoints

For long-term reporting, store aggregates (daily/weekly metrics) before cleanup.

## Deterministic Daily Outputs

Beyond hourly chart data, the system can expose deterministic daily values for model/analytics workflows:

- Daily maximum temperature
- Daily rainfall amount

These outputs are useful for:

- reporting and KPI cards
- model comparison (predicted vs observed)
- simplified decision-oriented summaries for users

When rainfall amount is not present in the upstream payload for a given period, treat the value as unavailable rather than inferring from rain probability.

## Project Structure

```text
weatheringwithyouwebapp/
  src/
    components/       Reusable UI components
    pages/            Home, Forecast, Dashboard, About
    hooks/            UI state hooks
    types/            Shared frontend weather types
    utils/            Weather image/background helpers
  server/
    src/
      controllers/    Express route handlers
      routes/         API route definitions
    services/       OpenWeather, Supabase, smoothing, sunshine windows
      types/          Backend response contracts
    migrations/       SQL migrations for schema, indexes, and retention
    .env.example      Server environment template
  docs/
    regression-algorithm.md
  scripts/
    dev-all.cjs       Starts frontend and backend together
```

## Getting Started

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
cd ..
```

Create the backend environment file:

```bash
cd server
copy .env.example .env
cd ..
```

Fill in `server/.env` with your OpenWeather key:

```env
OPENWEATHER_API_KEY=your_openweather_api_key
OPENWEATHER_CITY=Tagum City,PH
```

You can use coordinates instead of a city:

```env
OPENWEATHER_LAT=7.4478
OPENWEATHER_LON=125.8078
```

Do not commit `server/.env`. It is intentionally ignored by Git.

## Running Locally

Start frontend and backend together:

```bash
npm run dev
```

Run only the frontend:

```bash
npm run dev:frontend
```

Run only the backend:

```bash
npm run dev:backend
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

The Vite frontend proxies `/api` requests to the backend at `http://127.0.0.1:3000`.

## Environment Variables

Backend variables live in `server/.env`.

Required:

| Variable | Description |
| --- | --- |
| `OPENWEATHER_API_KEY` | API key used for current weather and forecast data. |
| `OPENWEATHER_CITY` | City query used by OpenWeather. Use this or latitude/longitude. |
| `OPENWEATHER_LAT` | Latitude for coordinate-based weather lookup. |
| `OPENWEATHER_LON` | Longitude for coordinate-based weather lookup. |

Optional:

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | Express server port. | `3000` |
| `LOG_LEVEL` | Pino structured logging level. | `debug` locally, `info` in production |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API. | local Vite origins |
| `RATE_LIMIT_WINDOW_MS` | API rate-limit window. | `60000` |
| `RATE_LIMIT_MAX` | Max API requests per window per client. | `60` |
| `WEATHER_CACHE_TTL_MS` | In-memory weather response cache TTL. | `3600000` |
| `OPENWEATHER_TIMEOUT_MS` | External provider timeout for circuit breaker calls. | `8000` |
| `OPENWEATHER_CIRCUIT_ERROR_THRESHOLD` | Circuit breaker error threshold percentage. | `50` |
| `OPENWEATHER_CIRCUIT_RESET_MS` | Circuit breaker reset timeout. | `30000` |
| `SUPABASE_URL` | Supabase project URL for optional persistence. | unset |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key. Never expose this in frontend code. | unset |
| `WEATHER_LOCATION_ID` | Stable location identifier for saved weather rows. | `tagum-city-ph` |
| `SUPABASE_OBSERVATIONS_TABLE` | Table for daily current-weather observations. | `daily_weather_observations` |
| `SUPABASE_HOURLY_OBSERVATIONS_TABLE` | Table for hourly climatology observations. | `weather_observations` |
| `SUPABASE_FORECASTS_TABLE` | Table for daily forecast snapshots. | `daily_weather_forecasts` |
| `SUPABASE_CLIMATOLOGY_VIEW` | Materialized view used by regression blending. | `hourly_climatology_90d` |
| `CLIMATOLOGY_CACHE_TTL_MS` | In-memory climatology cache TTL. | `900000` |
| `BACKFILL_START_DATE` | Default hourly backfill start date. | `2026-04-12` |
| `BACKFILL_END_DATE` | Optional hourly backfill end date. | current date |

## API Routes

Primary API routes are served under `/api/v1`. API documentation is available at `/api/docs`, and the OpenAPI JSON spec is available at `/api/openapi.json`.

Weather endpoints accept either no location query, a `city` query, or both `lat` and `lon`:

```text
/api/v1/weather/current?city=Tagum%20City,PH
/api/v1/weather/current?lat=7.4478&lon=125.8078
```

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/v1/weather/current` | Returns current OpenWeather conditions. |
| `GET` | `/api/v1/weather/forecast` | Returns smoothed forecast data and sunshine windows. |
| `GET` | `/api/v1/weather/forecast/24h` | Alias for the 24-hour forecast response used by the UI. |
| `GET` | `/api/v1/weather/sunshine-windows` | Computes recommended outdoor windows from forecast data. |
| `GET` | `/api/v1/weather/accuracy` | Returns the current accuracy summary/status. |
| `GET` | `/api/docs` | Swagger UI API documentation. |
| `GET` | `/api/openapi.json` | Raw OpenAPI contract. |
| `GET` | `/health` | Confirms the backend is running. |

Error responses use a standard envelope:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request input",
    "requestId": "..."
  }
}
```

## Forecast Logic

The backend fetches OpenWeather forecast points, limits them to the next 24 hours, and applies a lightweight regression smoothing step before returning data to the client.

The full algorithm note is in `docs/regression-algorithm.md`.

Sunshine windows are scored from:

- rain probability
- temperature comfort
- time-of-day buckets

The result is turned into practical labels such as `OPTIMAL`, `GOOD`, or `FAIR`, with suggested activities like outdoor exercise, outdoor planning, or rain backup.

Deterministic daily outputs can be derived from this same forecast window:

- daily max temperature: maximum predicted temperature in the 24-hour window
- daily rainfall amount: sum of available rainfall amount fields in the same window

## Available Scripts

Root scripts:

| Script | Description |
| --- | --- |
| `npm run dev` | Starts backend and frontend together. |
| `npm run dev:frontend` | Starts Vite only. |
| `npm run dev:backend` | Starts the Express backend from the root project. |
| `npm run build` | Type-checks and builds the frontend. |
| `npm run lint` | Runs ESLint. |
| `npm run preview` | Serves the production frontend build locally. |
| `npm run test:server` | Runs backend Vitest tests. |

Server scripts:

| Script | Description |
| --- | --- |
| `npm run dev` | Runs the backend with `ts-node`. |
| `npm run dev:watch` | Runs the backend with `nodemon`. |
| `npm run build` | Compiles server TypeScript. |
| `npm test` | Runs backend unit and route tests. |
| `npm start` | Runs the compiled server from `dist`. |

## Build

Build the frontend:

```bash
npm run build
```

Build the backend:

```bash
cd server
npm run build
```

Run backend tests:

```bash
npm run test:server
```

## Security Notes

- Keep real API keys in `server/.env`.
- Never put secrets in `.env.example`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` through `VITE_*` variables or frontend code.
- API responses are protected with Helmet security headers, restricted CORS, request size limits, and weather-route rate limiting.
- OpenWeather calls are cached for 60 minutes by default and guarded by a circuit breaker.
- If a key was committed by mistake, rotate it immediately and remove it from Git history before pushing.

## Offline Support

Production builds register `public/service-worker.js`. It caches the app shell and uses a network-first strategy for `/api/v1/weather/*`, falling back to the last successful weather response when offline.

## Current Limitations

- OpenWeather's free forecast endpoint provides 3-hour forecast intervals, so hourly UI entries depend on available API points unless interpolation is added later.
- UV index and dew point may show as `NaN` when the current data source does not provide them.
- Supabase is optional; the app still runs without persistence configured.
- Rainfall amount coverage depends on source payload availability and may be missing for some entries.

## Future Improvements

- Add Redis as a distributed cache if the API runs on multiple backend instances
- Add WebSocket/SSE forecast pushes if live multi-user updates become necessary
- Add Playwright E2E coverage for Home -> Forecast flows
- Add Husky/lint-staged pre-commit hooks when root dev dependencies can be installed
- Add a daily summary table for deterministic outputs and trend queries
- Replace placeholder accuracy response with measured metrics from stored history
- Add aggregate retention strategy for monthly summaries

## Inspiration

The visual direction and title are inspired by *Weathering with You* (*Tenki no Ko*). The app is not an official product or affiliated project. It uses the theme as creative inspiration for a localized weather planning experience.
