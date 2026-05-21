# Data Pipeline Visualization

This project does not train a large machine learning model in the traditional sense.
Instead, it uses a lightweight forecast pipeline:

- live forecast data from OpenWeather
- historical hourly observations stored in Supabase
- a rolling 90-day climatology baseline
- polynomial regression and climatology-residual blending

The diagram below shows how data moves from fetch, to historical preparation, to prediction output.

```mermaid
flowchart TD
    A["Frontend (React pages)"] --> B["GET /api/v1/weather/forecast"]
    B --> C["Express route + weatherController"]

    C --> D["weatherService.getForecastBundle()"]
    D --> E["OpenWeather forecast API"]
    D --> F["In-memory cache"]
    D --> G["Fallback: latest synced forecast from Supabase"]

    E --> H["Map 3-hour provider payload"]
    H --> I["Interpolate into 24 hourly forecast points"]
    F --> I
    G --> I

    J["Backfill script: backfillHourlyObservations.ts"] --> K["Open-Meteo archive API"]
    K --> L["Supabase weather_observations"]
    L --> M["refresh_hourly_climatology_90d()"]
    M --> N["hourly_climatology_90d materialized view"]

    C --> O["supabaseService.getClimatology90d()"]
    O --> N

    I --> P["mlService.blendedRegression()"]
    N --> P
    P --> Q["Smoothed forecast output"]

    Q --> R["sunshineWindowService.computeSunshineWindows()"]
    R --> S["Optimal windows + sunshine windows"]

    Q --> T["Forecast response JSON"]
    S --> T

    T --> U["Frontend charts, cards, dashboard"]

    C --> V["tryStoreDailyForecast()"]
    T --> V
    V --> W["Supabase daily_weather_forecasts"]

    C --> X["Current weather endpoint"]
    X --> Y["OpenWeather current API"]
    X --> Z["tryStoreDailyObservation()"]
    Z --> L
```

## Step-by-Step Flow

1. The frontend calls `/api/v1/weather/forecast`.
2. The backend fetches live forecast data from OpenWeather, using cache and fallback logic.
3. The raw provider data is mapped and interpolated into 24 hourly forecast points.
4. Historical hourly observations are collected separately through the backfill script and stored in Supabase.
5. Supabase refreshes `hourly_climatology_90d`, which acts as the historical baseline for each hour of day.
6. `blendedRegression()` combines the live forecast with the climatology baseline:
   - if climatology is unavailable, it falls back to polynomial smoothing only
   - if climatology is available, it fits residual curves and blends them back into the hourly averages
7. The backend computes sunshine windows and optimal activity windows from the smoothed forecast.
8. The final JSON response is returned to the frontend for charts, KPIs, and weather recommendations.
9. The forecast snapshot is also saved to Supabase so it can be reused during provider outages.

## Practical Interpretation

- "Fetch" comes from OpenWeather for live inference and Open-Meteo Archive for historical backfill.
- "Train" in this setup means building the rolling hourly climatology baseline from stored observations.
- "Output" is the smoothed forecast plus sunshine/optimal windows returned by the API and rendered in the UI.
