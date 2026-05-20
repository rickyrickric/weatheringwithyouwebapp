import { ChartDataPoint, CurrentWeather, ForecastResponse, HourlyClimatologyPoint } from '../types';
import { logger } from '../utils/logger';

const DEFAULT_OBSERVATIONS_TABLE = 'daily_weather_observations';
const DEFAULT_HOURLY_OBSERVATIONS_TABLE = 'weather_observations';
const DEFAULT_FORECASTS_TABLE = 'daily_weather_forecasts';
const CLIMATOLOGY_CACHE_TTL_MS = Number(process.env.CLIMATOLOGY_CACHE_TTL_MS || 15 * 60 * 1000);

type ClimatologyRow = {
  hour_of_day: number;
  avg_temperature: number | string | null;
  std_temperature: number | string | null;
  temperature_count: number | string | null;
  avg_rain_probability: number | string | null;
  std_rain_probability: number | string | null;
  rain_probability_count: number | string | null;
  avg_rain_mm?: number | string | null;
};

type HourlyObservationRow = {
  location_id: string;
  observed_at: string;
  source: string;
  temperature: number | null;
  rain_probability: number | null;
  rain_mm: number | null;
  humidity: number | null;
  wind_speed: number | null;
  weather_id: number | null;
  raw_payload: unknown;
};

type SyncedCurrentWeatherRow = {
  temperature: number | string | null;
  rain_probability: number | string | null;
  humidity: number | string | null;
  wind_speed: number | string | null;
  weather_id: number | string | null;
  raw_payload: unknown;
};

type SyncedForecastRow = {
  target_time: string | null;
  predicted_temperature: number | string | null;
  predicted_rain_probability: number | string | null;
  raw_payload: unknown;
};

let climatologyCache:
  | {
      key: string;
      expiresAt: number;
      value: HourlyClimatologyPoint[];
    }
  | null = null;
let hasWarnedMissingSupabaseConfig = false;

const warnMissingSupabaseConfig = (missingVars: string[]) => {
  if (hasWarnedMissingSupabaseConfig) return;

  hasWarnedMissingSupabaseConfig = true;
  logger.warn(
    { missingVars },
    'Supabase env vars missing; using in-memory mode until configuration is provided',
  );
};

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    const missingVars = [
      !url ? 'SUPABASE_URL' : null,
      !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : null,
    ].filter((value): value is string => value !== null);

    warnMissingSupabaseConfig(missingVars);
    return null;
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
    observationsTable: process.env.SUPABASE_OBSERVATIONS_TABLE || DEFAULT_OBSERVATIONS_TABLE,
    hourlyObservationsTable:
      process.env.SUPABASE_HOURLY_OBSERVATIONS_TABLE || DEFAULT_HOURLY_OBSERVATIONS_TABLE,
    forecastsTable: process.env.SUPABASE_FORECASTS_TABLE || DEFAULT_FORECASTS_TABLE,
    climatologyView: process.env.SUPABASE_CLIMATOLOGY_VIEW || 'hourly_climatology_90d',
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

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isCurrentWeatherPayload = (payload: unknown): payload is CurrentWeather => {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as Partial<CurrentWeather>;
  return (
    typeof candidate.temperature === 'number' &&
    typeof candidate.rainChance === 'number' &&
    typeof candidate.humidity === 'number' &&
    typeof candidate.windSpeed === 'number'
  );
};

const isForecastPointPayload = (payload: unknown): payload is { point: ChartDataPoint } => {
  if (!payload || typeof payload !== 'object') return false;
  const point = (payload as { point?: Partial<ChartDataPoint> }).point;
  return (
    !!point &&
    typeof point.time === 'string' &&
    typeof point.temperature === 'number' &&
    typeof point.rainProbability === 'number'
  );
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

export async function storeHourlyObservation(weather: CurrentWeather) {
  const config = getSupabaseConfig();
  if (!config) return;

  const observedAt = new Date();
  observedAt.setMinutes(0, 0, 0);

  await upsertRows(
    config.hourlyObservationsTable,
    [
      {
        location_id: config.locationId,
        observed_at: observedAt.toISOString(),
        source: 'openweather',
        temperature: weather.temperature,
        rain_probability: weather.rainChance,
        rain_mm: null,
        humidity: weather.humidity,
        wind_speed: weather.windSpeed,
        weather_id: weather.weatherId,
        raw_payload: weather,
      },
    ],
    'location_id,observed_at,source',
  );
}

export async function storeHourlyObservationRows(rows: Omit<HourlyObservationRow, 'location_id'>[]) {
  const config = getSupabaseConfig();
  if (!config || rows.length === 0) return;

  await upsertRows(
    config.hourlyObservationsTable,
    rows.map((row) => ({
      location_id: config.locationId,
      ...row,
    })),
    'location_id,observed_at,source',
  );
}

export async function refreshHourlyClimatology90d() {
  const config = getSupabaseConfig();
  if (!config) return;

  const response = await fetch(`${config.url}/rest/v1/rpc/refresh_hourly_climatology_90d`, {
    method: 'POST',
    headers: postgrestHeaders(config.serviceRoleKey),
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase climatology refresh failed: ${response.status} ${message}`);
  }

  climatologyCache = null;
}

export async function getClimatology90d(): Promise<HourlyClimatologyPoint[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  const cacheKey = `${config.locationId}:${config.climatologyView}`;
  if (climatologyCache?.key === cacheKey && climatologyCache.expiresAt > Date.now()) {
    return climatologyCache.value;
  }

  const endpoint = new URL(`${config.url}/rest/v1/${config.climatologyView}`);
  endpoint.searchParams.set('location_id', `eq.${config.locationId}`);
  endpoint.searchParams.set(
    'select',
    [
      'hour_of_day',
      'avg_temperature',
      'std_temperature',
      'temperature_count',
      'avg_rain_probability',
      'std_rain_probability',
      'rain_probability_count',
      'avg_rain_mm',
    ].join(','),
  );
  endpoint.searchParams.set('order', 'hour_of_day.asc');

  const response = await fetch(endpoint, {
    headers: postgrestHeaders(config.serviceRoleKey),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase climatology read failed: ${response.status} ${message}`);
  }

  const rows = (await response.json()) as ClimatologyRow[];
  const value = rows.map((row) => ({
    hourOfDay: toNumber(row.hour_of_day),
    avgTemperature: toNumber(row.avg_temperature),
    stdTemperature: row.std_temperature === null ? null : toNumber(row.std_temperature),
    temperatureCount: toNumber(row.temperature_count),
    avgRainProbability: toNumber(row.avg_rain_probability),
    stdRainProbability:
      row.std_rain_probability === null ? null : toNumber(row.std_rain_probability),
    rainProbabilityCount: toNumber(row.rain_probability_count),
    avgRainMm: row.avg_rain_mm === null ? null : toNumber(row.avg_rain_mm),
  }));

  climatologyCache = {
    key: cacheKey,
    expiresAt: Date.now() + CLIMATOLOGY_CACHE_TTL_MS,
    value,
  };

  return value;
}

export async function getLatestSyncedCurrentWeather(): Promise<CurrentWeather | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const endpoint = new URL(`${config.url}/rest/v1/${config.hourlyObservationsTable}`);
  endpoint.searchParams.set('location_id', `eq.${config.locationId}`);
  endpoint.searchParams.set(
    'select',
    [
      'temperature',
      'rain_probability',
      'humidity',
      'wind_speed',
      'weather_id',
      'raw_payload',
    ].join(','),
  );
  endpoint.searchParams.set('order', 'observed_at.desc');
  endpoint.searchParams.set('limit', '1');

  const response = await fetch(endpoint, {
    headers: postgrestHeaders(config.serviceRoleKey),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase current weather read failed: ${response.status} ${message}`);
  }

  const [row] = (await response.json()) as SyncedCurrentWeatherRow[];
  if (!row) return null;
  if (isCurrentWeatherPayload(row.raw_payload)) return row.raw_payload;

  return {
    temperature: toNumber(row.temperature),
    rainChance: toNumber(row.rain_probability),
    humidity: toNumber(row.humidity),
    windSpeed: toNumber(row.wind_speed),
    weatherId: row.weather_id === null ? undefined : toNumber(row.weather_id),
  };
}

export async function getLatestSyncedForecast(): Promise<ChartDataPoint[]> {
  const config = getSupabaseConfig();
  if (!config) return [];

  const endpoint = new URL(`${config.url}/rest/v1/${config.forecastsTable}`);
  endpoint.searchParams.set('location_id', `eq.${config.locationId}`);
  endpoint.searchParams.set(
    'select',
    [
      'target_time',
      'predicted_temperature',
      'predicted_rain_probability',
      'raw_payload',
    ].join(','),
  );
  endpoint.searchParams.set('order', 'generated_at.desc,target_time.asc');
  endpoint.searchParams.set('limit', '24');

  const response = await fetch(endpoint, {
    headers: postgrestHeaders(config.serviceRoleKey),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase forecast read failed: ${response.status} ${message}`);
  }

  const rows = (await response.json()) as SyncedForecastRow[];
  return rows
    .map((row) => {
      if (isForecastPointPayload(row.raw_payload)) return row.raw_payload.point;

      return {
        time: row.target_time || '00:00',
        temperature: toNumber(row.predicted_temperature),
        rainProbability: toNumber(row.predicted_rain_probability),
      };
    })
    .sort((left, right) => left.time.localeCompare(right.time));
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
    await storeHourlyObservation(weather);
  } catch (error) {
    logger.warn({ err: error }, 'Supabase observation persistence skipped');
  }
}

export async function tryGetClimatology90d(): Promise<HourlyClimatologyPoint[]> {
  try {
    return await getClimatology90d();
  } catch (error) {
    logger.warn({ err: error }, 'Supabase climatology read skipped');
    return [];
  }
}

export async function tryGetLatestSyncedCurrentWeather(): Promise<CurrentWeather | null> {
  try {
    return await getLatestSyncedCurrentWeather();
  } catch (error) {
    logger.warn({ err: error }, 'Supabase current weather fallback skipped');
    return null;
  }
}

export async function tryGetLatestSyncedForecast(): Promise<ChartDataPoint[]> {
  try {
    return await getLatestSyncedForecast();
  } catch (error) {
    logger.warn({ err: error }, 'Supabase forecast fallback skipped');
    return [];
  }
}

export async function tryStoreDailyForecast(response: ForecastResponse) {
  try {
    await storeDailyForecast(response);
  } catch (error) {
    logger.warn({ err: error }, 'Supabase forecast persistence skipped');
  }
}

export function resetSupabaseWarningsForTests() {
  hasWarnedMissingSupabaseConfig = false;
}
