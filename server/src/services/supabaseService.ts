import { ChartDataPoint, CurrentWeather, ForecastResponse } from '../types';
import { logger } from '../utils/logger';

const DEFAULT_OBSERVATIONS_TABLE = 'daily_weather_observations';
const DEFAULT_FORECASTS_TABLE = 'daily_weather_forecasts';

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
    observationsTable: process.env.SUPABASE_OBSERVATIONS_TABLE || DEFAULT_OBSERVATIONS_TABLE,
    forecastsTable: process.env.SUPABASE_FORECASTS_TABLE || DEFAULT_FORECASTS_TABLE,
    locationId: process.env.WEATHER_LOCATION_ID || 'tagum-city-ph',
  };
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const postgrestHeaders = (serviceRoleKey: string) => ({
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  'Content-Type': 'application/json',
  Prefer: 'resolution=merge-duplicates,return=minimal',
});

const upsertRows = async (table: string, rows: unknown[], conflictColumns: string) => {
  const config = getSupabaseConfig();
  if (!config) return;

  const endpoint = new URL(`${config.url}/rest/v1/${table}`);
  endpoint.searchParams.set('on_conflict', conflictColumns);

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: postgrestHeaders(config.serviceRoleKey),
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase insert failed for ${table}: ${response.status} ${message}`);
  }
};

export async function storeDailyObservation(weather: CurrentWeather) {
  const config = getSupabaseConfig();
  if (!config) return;

  await upsertRows(
    config.observationsTable,
    [
      {
        location_id: config.locationId,
        observed_date: getTodayKey(),
        observed_at: new Date().toISOString(),
        temperature: weather.temperature,
        feels_like: weather.feelsLike,
        humidity: weather.humidity,
        pressure: weather.pressure,
        wind_speed: weather.windSpeed,
        visibility: weather.visibility,
        rain_chance: weather.rainChance,
        uv_index: weather.uvIndex,
        dew_point: weather.dewPoint,
        weather_id: weather.weatherId,
        condition: weather.condition,
        source: 'openweather',
        raw_payload: weather,
      },
    ],
    'location_id,observed_date',
  );
}

export async function storeDailyForecast(response: ForecastResponse) {
  const config = getSupabaseConfig();
  if (!config) return;

  const rows = response.forecast.map((point: ChartDataPoint) => ({
    location_id: config.locationId,
    forecast_date: getTodayKey(),
    generated_at: response.generatedAt,
    target_time: point.time,
    predicted_temperature: point.temperature,
    predicted_rain_probability: point.rainProbability,
    source: response.source,
    accuracy_status: response.accuracy.status,
    raw_payload: {
      point,
      sunshineWindows: response.sunshineWindows,
      optimalWindows: response.optimalWindows,
    },
  }));

  if (rows.length > 0) {
    await upsertRows(config.forecastsTable, rows, 'location_id,forecast_date,target_time');
  }
}

export async function tryStoreDailyObservation(weather: CurrentWeather) {
  try {
    await storeDailyObservation(weather);
  } catch (error) {
    logger.warn({ err: error }, 'Supabase observation persistence skipped');
  }
}

export async function tryStoreDailyForecast(response: ForecastResponse) {
  try {
    await storeDailyForecast(response);
  } catch (error) {
    logger.warn({ err: error }, 'Supabase forecast persistence skipped');
  }
}
