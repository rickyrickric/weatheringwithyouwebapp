# Weathering With You Web App

A full-stack weather intelligence dashboard for Tagum City, inspired by the atmosphere and emotional tone of *Weathering with You*. The app combines live OpenWeather data, short-term forecast smoothing, sunshine-window recommendations, and a cinematic responsive UI built for quick weather decisions.

The project is designed as a school web application, but it is structured like a small production app: React on the client, Express on the server, typed shared weather contracts, optional Supabase persistence, and environment-based API configuration.

## What It Does

- Shows current weather conditions for the configured location.
- Displays a 24-hour hourly forecast with temperature trend and rain probability.
- Computes practical sunshine windows for morning, midday, and afternoon planning.
- Adapts the visual background to the active weather condition and time of day.
- Includes a dashboard view for model and pipeline context.
- Supports optional Supabase storage for daily observations and forecast snapshots.
- Uses safe local environment files so API keys do not need to be committed.

## Main Screens

- `Home` - cinematic landing experience with current temperature and rain chance.
- `Forecast` - live current conditions, hourly forecast, weather image card, and optimal weather windows.
- `Dashboard` - model/pipeline-focused technical overview.
- `About` - project inspiration, feature summary, and architecture context.

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
    .env.example      Server environment template
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
| `SUPABASE_URL` | Supabase project URL for optional persistence. | unset |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key. Never expose this in frontend code. | unset |
| `WEATHER_LOCATION_ID` | Stable location identifier for saved weather rows. | `tagum-city-ph` |
| `SUPABASE_OBSERVATIONS_TABLE` | Table for daily current-weather observations. | `daily_weather_observations` |
| `SUPABASE_FORECASTS_TABLE` | Table for daily forecast snapshots. | `daily_weather_forecasts` |

## API Routes

All API routes are served under `/api`.

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/weather/current` | Returns current OpenWeather conditions. |
| `GET` | `/api/weather/forecast` | Returns smoothed forecast data and sunshine windows. |
| `GET` | `/api/weather/forecast/24h` | Alias for the 24-hour forecast response used by the UI. |
| `GET` | `/api/weather/sunshine-windows` | Computes recommended outdoor windows from forecast data. |
| `GET` | `/api/weather/accuracy` | Returns the current accuracy summary/status. |
| `GET` | `/health` | Confirms the backend is running. |

## Forecast Logic

The backend fetches OpenWeather forecast points, limits them to the next 24 hours, and applies a lightweight regression smoothing step before returning data to the client.

Sunshine windows are scored from:

- rain probability
- temperature comfort
- time-of-day buckets

The result is turned into practical labels such as `OPTIMAL`, `GOOD`, or `FAIR`, with suggested activities like outdoor exercise, outdoor planning, or rain backup.

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

Server scripts:

| Script | Description |
| --- | --- |
| `npm run dev` | Runs the backend with `ts-node`. |
| `npm run dev:watch` | Runs the backend with `nodemon`. |
| `npm run build` | Compiles server TypeScript. |
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

## Security Notes

- Keep real API keys in `server/.env`.
- Never put secrets in `.env.example`.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` through `VITE_*` variables or frontend code.
- If a key was committed by mistake, rotate it immediately and remove it from Git history before pushing.

## Current Limitations

- OpenWeather's free forecast endpoint provides 3-hour forecast intervals, so hourly UI entries depend on available API points unless interpolation is added later.
- UV index and dew point may show as `NaN` when the current data source does not provide them.
- Supabase is optional; the app still runs without persistence configured.

## Inspiration

The visual direction and title are inspired by *Weathering with You* (*Tenki no Ko*). The app is not an official product or affiliated project. It uses the theme as creative inspiration for a localized weather planning experience.
