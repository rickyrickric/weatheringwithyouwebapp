import axios from 'axios';
import { createRequire } from 'module';
import { LocationQuery } from '../middleware/validateRequest';
import {
  tryGetLatestSyncedCurrentWeather,
  tryGetLatestSyncedForecast,
} from './supabaseService';
import { ChartDataPoint, CurrentWeather, DailyOutlook, RainIntensity, WeatherAlert } from '../types';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const OPENWEATHER_ONE_CALL_URL = 'https://api.openweathermap.org/data/3.0/onecall';
const WEATHER_CACHE_TTL_MS = Number(process.env.WEATHER_CACHE_TTL_MS || 60 * 60 * 1000);
const FORECAST_CACHE_VERSION = 'hourly-v2';
const nodeRequire = createRequire(__filename);

type OpenWeatherEndpoint = 'weather' | 'forecast';
type OpenWeatherParams = Record<string, string | number>;
type CircuitBreakerOptions = {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
};
type CircuitBreakerConstructor = new <TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<TResult>,
  options?: CircuitBreakerOptions,
) => {
  fire(...args: TArgs): Promise<TResult>;
};
type OpenWeatherCurrentPayload = {
  coord?: {
    lat?: number;
    lon?: number;
  };
  main?: {
    temp?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  wind?: { speed?: number };
  clouds?: { all?: number };
  weather?: Array<{ description?: string; id?: number }>;
  visibility?: number;
};
type OpenWeatherForecastEntry = {
  dt?: number;
  main?: { temp?: number };
  pop?: number;
  rain?: { '3h'?: number };
  weather?: Array<{ description?: string; id?: number; main?: string }>;
};
type OpenWeatherForecastPayload = {
  list?: OpenWeatherForecastEntry[];
};
type OpenWeatherOneCallPayload = {
  current?: {
    uvi?: number;
  };
};
type OpenWeatherForecastEntryWithTimestamp = OpenWeatherForecastEntry & {
  dt: number;
};
type ForecastSourcePoint = {
  timestamp: number;
  temperature: number;
  rainProbability: number;
  rainMmPerHour: number;
};
type ProviderStatus = 'live' | 'synced';
type CurrentWeatherResult = {
  weather: CurrentWeather;
  providerStatus: ProviderStatus;
};
type ForecastBundleResult = {
  forecast: ChartDataPoint[];
  dailyOutlook: DailyOutlook[];
  alerts: WeatherAlert[];
  providerStatus: ProviderStatus;
};

const responseCache = new Map<string, { expiresAt: number; value: unknown }>();

const requireEnv = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
};

const formatTime = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatTagumDate = (timestamp: number, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-PH', { timeZone: 'Asia/Manila', ...options }).format(
    new Date(timestamp),
  );

const getTagumDateKey = (timestamp: number) =>
  formatTagumDate(timestamp, { year: 'numeric', month: '2-digit', day: '2-digit' });

const getRainIntensity = (rainMm: number): RainIntensity => {
  if (rainMm <= 0) return 'none';
  if (rainMm < 2.5) return 'light';
  if (rainMm < 7.6) return 'moderate';
  return 'heavy';
};

const getDailySummary = (rainMm: number, rainChance: number, high: number) => {
  if (rainMm >= 8) return 'Heavy rain bands expected';
  if (rainMm > 2) return 'Scattered showers likely';
  if (rainMm > 0 && rainChance >= 80) return 'Mostly cloudy, light drizzle';
  if (rainMm > 0 || rainChance >= 30) return 'Isolated showers possible';
  if (high >= 32) return 'Warm midday, isolated rain';
  return 'Mostly cloudy breaks';
};

const getOpenWeatherLocationParams = (location?: LocationQuery): OpenWeatherParams => {
  if (location?.city) {
    return { q: location.city };
  }

  if (typeof location?.lat === 'number' && typeof location?.lon === 'number') {
    return { lat: location.lat, lon: location.lon };
  }

  const lat = process.env.OPENWEATHER_LAT?.trim();
  const lon = process.env.OPENWEATHER_LON?.trim();
  if (lat && lon) {
    return { lat, lon };
  }

  const city = process.env.OPENWEATHER_CITY;
  if (!city) {
    throw new Error(
      'Missing location: set OPENWEATHER_CITY or both OPENWEATHER_LAT and OPENWEATHER_LON',
    );
  }
  return { q: city };
};

const getCacheKey = (endpoint: OpenWeatherEndpoint, params: OpenWeatherParams) =>
  `${endpoint}:${Object.entries(params)
    .filter(([key]) => key !== 'appid')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')}`;

const getCached = <T>(key: string, options: { allowStale?: boolean } = {}) => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    if (!options.allowStale) return null;
    return entry.value as T;
  }
  return entry.value as T;
};

const getFallbackCached = <T>(key: string) => getCached<T>(key, { allowStale: true });

const getDailyOutlookFromForecast = (forecast: ChartDataPoint[]): DailyOutlook[] => {
  if (forecast.length === 0) return [];

  const rainMm = Number(forecast.reduce((sum, point) => sum + (point.rainMm ?? 0), 0).toFixed(1));
  const rainChance = Math.max(...forecast.map((point) => point.rainProbability), 0);
  const high = Math.round(Math.max(...forecast.map((point) => point.temperature)));
  const low = Math.round(Math.min(...forecast.map((point) => point.temperature)));
  const outlook: DailyOutlook[] = [
    {
      day: formatTagumDate(Date.now(), { weekday: 'short' }),
      date: formatTagumDate(Date.now(), { month: 'short', day: 'numeric' }),
      high,
      low,
      rainChance,
      rainMm,
      summary: getDailySummary(rainMm, rainChance, high),
      intensity: getRainIntensity(rainMm),
    },
  ];

  while (outlook.length < 7) {
    const previous = outlook[outlook.length - 1];
    const timestamp = Date.now() + outlook.length * 24 * 60 * 60 * 1000;
    const nextRainMm = Number(Math.max(0.2, previous.rainMm * 0.76).toFixed(1));
    const nextRainChance = Math.max(15, Math.round(previous.rainChance * 0.88));
    outlook.push({
      day: formatTagumDate(timestamp, { weekday: 'short' }),
      date: formatTagumDate(timestamp, { month: 'short', day: 'numeric' }),
      high: previous.high,
      low: previous.low,
      rainChance: nextRainChance,
      rainMm: nextRainMm,
      summary: 'Cloud synced trend from latest forecast',
      intensity: getRainIntensity(nextRainMm),
    });
  }

  return outlook;
};

const getForecastFallbackBundle = async (
  cacheKey: string,
): Promise<{
  forecast: ChartDataPoint[];
  dailyOutlook: DailyOutlook[];
  alerts: WeatherAlert[];
} | null> => {
  const staleBundle = getFallbackCached<{
    forecast: ChartDataPoint[];
    dailyOutlook: DailyOutlook[];
    alerts: WeatherAlert[];
  }>(cacheKey);

  if (staleBundle) return staleBundle;

  const syncedForecast = await tryGetLatestSyncedForecast();
  if (syncedForecast.length === 0) return null;

  const dailyOutlook = getDailyOutlookFromForecast(syncedForecast);
  return {
    forecast: syncedForecast,
    dailyOutlook,
    alerts: mapTagumAlerts(dailyOutlook, syncedForecast),
  };
};

const withOpenWeatherFallback = async <T>(
  error: unknown,
  endpoint: string,
  fallback: () => Promise<T | null> | T | null,
): Promise<T> => {
  const fallbackValue = await fallback();
  if (fallbackValue) return fallbackValue;
  throw new Error(getAxiosErrorMessage(error, endpoint), { cause: error });
};

const isNonEmptyForecast = (forecast: ChartDataPoint[] | null): forecast is ChartDataPoint[] =>
  Array.isArray(forecast) && forecast.length > 0;

const getForecastFallback = async (cacheKey: string) => {
  const staleForecast = getFallbackCached<ChartDataPoint[]>(cacheKey);
  if (isNonEmptyForecast(staleForecast)) return staleForecast;

  const syncedForecast = await tryGetLatestSyncedForecast();
  return syncedForecast.length > 0 ? syncedForecast : null;
};

const getCurrentWeatherFallback = async (cacheKey: string) => {
  const staleWeather = getFallbackCached<CurrentWeather>(cacheKey);
  if (staleWeather) return staleWeather;

  return tryGetLatestSyncedCurrentWeather();
};

const assertUsableForecast = (forecast: ChartDataPoint[], endpoint: string) => {
  if (forecast.length === 0) {
    throw new Error(`OpenWeather request failed (${endpoint}): provider returned no usable forecast data`);
  }
};

const setCached = (key: string, value: unknown) => {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + WEATHER_CACHE_TTL_MS,
  });
};

const getAxiosErrorMessage = (error: unknown, endpoint: string) => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const statusText = error.response?.statusText;
    const apiMessage =
      (error.response?.data as { message?: string })?.message || error.message;
    return `OpenWeather request failed (${endpoint}): ${status ?? 'unknown'} ${statusText ?? ''} ${apiMessage}`.trim();
  }
  return `OpenWeather request failed (${endpoint}): ${String(error)}`;
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const calculateDewPoint = (temperature: unknown, humidity: unknown) => {
  if (!isFiniteNumber(temperature) || !isFiniteNumber(humidity) || humidity <= 0) {
    return undefined;
  }

  const boundedHumidity = Math.min(100, Math.max(1, humidity));
  const magnusA = 17.27;
  const magnusB = 237.7;
  const gamma =
    Math.log(boundedHumidity / 100) + (magnusA * temperature) / (magnusB + temperature);

  return Number(((magnusB * gamma) / (magnusA - gamma)).toFixed(1));
};

const mapOpenWeatherCurrent = (
  data: OpenWeatherCurrentPayload,
  uvIndex?: number,
): CurrentWeather => {
  const windSpeedKmH = data.wind?.speed ? data.wind.speed * 3.6 : 0;
  const cloudCover = typeof data.clouds?.all === 'number' ? data.clouds.all : 0;

  return {
    temperature: data.main?.temp ?? 0,
    rainChance: cloudCover,
    humidity: data.main?.humidity ?? 0,
    windSpeed: Number(windSpeedKmH.toFixed(1)),
    feelsLike: data.main?.feels_like,
    condition: data.weather?.[0]?.description,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined,
    pressure: data.main?.pressure,
    uvIndex,
    dewPoint: calculateDewPoint(data.main?.temp, data.main?.humidity),
    weatherId: data.weather?.[0]?.id,
  };
};

const getUvLocationParams = (
  data: OpenWeatherCurrentPayload,
  params: OpenWeatherParams,
): { lat: number; lon: number } | null => {
  if (isFiniteNumber(data.coord?.lat) && isFiniteNumber(data.coord?.lon)) {
    return { lat: data.coord.lat, lon: data.coord.lon };
  }

  const lat = Number(params.lat);
  const lon = Number(params.lon);
  if (Number.isFinite(lat) && Number.isFinite(lon)) {
    return { lat, lon };
  }

  return null;
};

const fetchOpenWeatherUvIndex = async (
  locationParams: { lat: number; lon: number },
  apiKey: string,
) => {
  try {
    const response = await axios.get(OPENWEATHER_ONE_CALL_URL, {
      params: {
        ...locationParams,
        exclude: 'minutely,hourly,daily,alerts',
        units: 'metric',
        appid: apiKey,
      },
    });
    const data = response.data as OpenWeatherOneCallPayload;
    return isFiniteNumber(data.current?.uvi) ? data.current.uvi : undefined;
  } catch {
    return undefined;
  }
};

const hasUsableForecastTimestamp = (
  entry: OpenWeatherForecastEntry,
): entry is OpenWeatherForecastEntryWithTimestamp => isFiniteNumber(entry.dt);

const interpolate = (left: number, right: number, ratio: number) => left + (right - left) * ratio;

const mapForecastEntryToSourcePoint = (
  entry: OpenWeatherForecastEntryWithTimestamp,
): ForecastSourcePoint => {
  const rainProbability = Math.round(Math.max(0, Math.min(1, entry.pop ?? 0)) * 100);
  const rainMm3h = entry.rain?.['3h'] ?? Math.max(0, Math.min(1, entry.pop ?? 0)) * 3;

  return {
    timestamp: entry.dt * 1000,
    temperature: isFiniteNumber(entry.main?.temp) ? entry.main.temp : 0,
    rainProbability,
    rainMmPerHour: rainMm3h / 3,
  };
};

const interpolateForecastPoint = (
  sourcePoints: ForecastSourcePoint[],
  timestamp: number,
): ChartDataPoint => {
  const nextIndex = sourcePoints.findIndex((point) => point.timestamp >= timestamp);
  const next = nextIndex >= 0 ? sourcePoints[nextIndex] : sourcePoints[sourcePoints.length - 1];
  const previous = nextIndex > 0 ? sourcePoints[nextIndex - 1] : next;

  if (!previous || !next || previous.timestamp === next.timestamp) {
    return {
      time: formatTime(new Date(timestamp)),
      temperature: Number((next?.temperature ?? 0).toFixed(1)),
      rainProbability: next?.rainProbability ?? 0,
      rainMm: Number((next?.rainMmPerHour ?? 0).toFixed(1)),
    };
  }

  const ratio = (timestamp - previous.timestamp) / (next.timestamp - previous.timestamp);

  return {
    time: formatTime(new Date(timestamp)),
    temperature: Number(interpolate(previous.temperature, next.temperature, ratio).toFixed(1)),
    rainProbability: Math.round(
      Math.max(0, Math.min(100, interpolate(previous.rainProbability, next.rainProbability, ratio))),
    ),
    rainMm: Number(Math.max(0, interpolate(previous.rainMmPerHour, next.rainMmPerHour, ratio)).toFixed(1)),
  };
};

const mapOpenWeatherForecast = (data: OpenWeatherForecastPayload): ChartDataPoint[] => {
  const now = Date.now();
  const end = now + 24 * 60 * 60 * 1000;
  const firstHour = new Date(now);
  firstHour.setMinutes(0, 0, 0);
  if (firstHour.getTime() < now) {
    firstHour.setHours(firstHour.getHours() + 1);
  }

  const sourcePoints = (data.list || [])
    .filter(hasUsableForecastTimestamp)
    .map(mapForecastEntryToSourcePoint)
    .filter((point) => point.timestamp >= now && point.timestamp <= end + 3 * 60 * 60 * 1000)
    .sort((left, right) => left.timestamp - right.timestamp);

  if (sourcePoints.length === 0) return [];

  return Array.from({ length: 24 }, (_, hourOffset) => {
    const timestamp = firstHour.getTime() + hourOffset * 60 * 60 * 1000;
    return interpolateForecastPoint(sourcePoints, timestamp);
  });
};

const mapDailyOutlook = (data: OpenWeatherForecastPayload): DailyOutlook[] => {
  const grouped = new Map<
    string,
    { timestamps: number[]; temps: number[]; rainChances: number[]; rainMm: number }
  >();

  (data.list || []).filter(hasUsableForecastTimestamp).forEach((entry) => {
    const timestamp = entry.dt * 1000;
    const key = getTagumDateKey(timestamp);
    const group = grouped.get(key) || {
      timestamps: [],
      temps: [],
      rainChances: [],
      rainMm: 0,
    };

    group.timestamps.push(timestamp);
    if (isFiniteNumber(entry.main?.temp)) group.temps.push(entry.main.temp);
    group.rainChances.push(Math.round(Math.max(0, Math.min(1, entry.pop ?? 0)) * 100));
    group.rainMm += entry.rain?.['3h'] ?? Math.max(0, Math.min(1, entry.pop ?? 0)) * 3;
    grouped.set(key, group);
  });

  const outlook = Array.from(grouped.values())
    .filter((group) => group.temps.length > 0)
    .slice(0, 7)
    .map((group) => {
      const timestamp = group.timestamps[0] ?? Date.now();
      const high = Math.round(Math.max(...group.temps));
      const low = Math.round(Math.min(...group.temps));
      const rainChance = Math.max(...group.rainChances, 0);
      const rainMm = Number(group.rainMm.toFixed(1));

      return {
        day: formatTagumDate(timestamp, { weekday: 'short' }),
        date: formatTagumDate(timestamp, { month: 'short', day: 'numeric' }),
        high,
        low,
        rainChance,
        rainMm,
        summary: getDailySummary(rainMm, rainChance, high),
        intensity: getRainIntensity(rainMm),
      };
    });

  while (outlook.length > 0 && outlook.length < 7) {
    const previous = outlook[outlook.length - 1];
    const nextDate = new Date(Date.now() + outlook.length * 24 * 60 * 60 * 1000);
    outlook.push({
      day: formatTagumDate(nextDate.getTime(), { weekday: 'short' }),
      date: formatTagumDate(nextDate.getTime(), { month: 'short', day: 'numeric' }),
      high: previous.high,
      low: previous.low,
      rainChance: Math.max(15, Math.round(previous.rainChance * 0.88)),
      rainMm: Number(Math.max(0.2, previous.rainMm * 0.76).toFixed(1)),
      summary: 'Extended trend from latest forecast',
      intensity: getRainIntensity(previous.rainMm * 0.76),
    });
  }

  return outlook;
};

const mapTagumAlerts = (dailyOutlook: DailyOutlook[], forecast: ChartDataPoint[]): WeatherAlert[] => {
  void dailyOutlook;
  const totalForecastRain = Number(
    forecast.reduce((sum, point) => sum + (point.rainMm ?? 0), 0).toFixed(1),
  );
  const peakHourlyRain = Math.max(...forecast.map((point) => point.rainMm ?? 0), 0);
  const peakRainChance = Math.max(...forecast.map((point) => point.rainProbability), 0);
  const hasSevereAdvisorySignal =
    totalForecastRain >= 10 ||
    peakHourlyRain >= 2.5 ||
    (peakRainChance >= 90 && peakHourlyRain >= 1.5);
  const hasMinorAdvisorySignal =
    totalForecastRain >= 5 ||
    peakHourlyRain >= 1.2 ||
    (peakRainChance >= 85 && peakHourlyRain >= 1);

  if (hasSevereAdvisorySignal) {
    return [
      {
        title: 'Afternoon Thunderstorm Advisory',
        urgency: 'Moderate',
        tone: 'moderate',
        barangays: 'Apokon, Mankilam, Canocotan',
        guidance:
          'Plan school pickups before 3 PM where possible. Low-lying streets near drainage canals may pond quickly during short heavy bursts.',
      },
      {
        title: 'Evening Commuter Shower Watch',
        urgency: 'Advisory',
        tone: 'advisory',
        barangays: 'Magugpo Poblacion, Visayan Village, Madaum',
        guidance:
          'Carry rain cover for tricycles and motorcycles. Give extra time along the national highway after sunset.',
      },
    ];
  }

  if (hasMinorAdvisorySignal) {
    return [
      {
        title: 'Localized Shower Watch',
        urgency: 'Advisory',
        tone: 'advisory',
        barangays: 'Apokon, Mankilam, Canocotan',
        guidance:
          'Keep rain cover nearby for short barangay trips. Watch shaded side streets where drizzle can leave slick pavement.',
      },
    ];
  }

  return [];
};

const requestOpenWeather = async ({
  endpoint,
  params,
}: {
  endpoint: OpenWeatherEndpoint;
  params: OpenWeatherParams;
}): Promise<OpenWeatherCurrentPayload | OpenWeatherForecastPayload> => {
  const response = await axios.get(`${OPENWEATHER_BASE_URL}/${endpoint}`, { params });
  return response.data;
};

const CircuitBreaker = nodeRequire('opossum') as CircuitBreakerConstructor;
const weatherBreaker = new CircuitBreaker(requestOpenWeather, {
  timeout: Number(process.env.OPENWEATHER_TIMEOUT_MS || 8000),
  errorThresholdPercentage: Number(process.env.OPENWEATHER_CIRCUIT_ERROR_THRESHOLD || 50),
  resetTimeout: Number(process.env.OPENWEATHER_CIRCUIT_RESET_MS || 30_000),
});

export async function getCurrentWeatherResult(
  location?: LocationQuery,
): Promise<CurrentWeatherResult> {
  let cacheKey: string | undefined;
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const params = {
      ...getOpenWeatherLocationParams(location),
      units: 'metric',
      appid: apiKey,
    };
    cacheKey = getCacheKey('weather', params);
    const cached = getCached<CurrentWeather>(cacheKey);
    if (cached) {
      return {
        weather: cached,
        providerStatus: 'live',
      };
    }

    const data = (await weatherBreaker.fire({ endpoint: 'weather', params })) as OpenWeatherCurrentPayload;
    const uvLocationParams = getUvLocationParams(data, params);
    const uvIndex = uvLocationParams
      ? await fetchOpenWeatherUvIndex(uvLocationParams, apiKey)
      : undefined;
    const weather = mapOpenWeatherCurrent(data, uvIndex);
    setCached(cacheKey, weather);
    return {
      weather,
      providerStatus: 'live',
    };
  } catch (error) {
    const weather = await withOpenWeatherFallback(error, 'current', () =>
      cacheKey ? getCurrentWeatherFallback(cacheKey) : tryGetLatestSyncedCurrentWeather(),
    );
    return {
      weather,
      providerStatus: 'synced',
    };
  }
}

export async function getCurrentWeather(location?: LocationQuery): Promise<CurrentWeather> {
  const result = await getCurrentWeatherResult(location);
  return result.weather;
}

export async function getForecastResult(
  location?: LocationQuery,
): Promise<{ forecast: ChartDataPoint[]; providerStatus: ProviderStatus }> {
  let cacheKey: string | undefined;
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const params = {
      ...getOpenWeatherLocationParams(location),
      units: 'metric',
      appid: apiKey,
    };
    cacheKey = `${getCacheKey('forecast', params)}:${FORECAST_CACHE_VERSION}`;
    const cached = getCached<ChartDataPoint[]>(cacheKey);
    if (cached) {
      return {
        forecast: cached,
        providerStatus: 'live',
      };
    }

    const data = (await weatherBreaker.fire({ endpoint: 'forecast', params })) as OpenWeatherForecastPayload;
    const forecast = mapOpenWeatherForecast(data);
    assertUsableForecast(forecast, 'forecast');
    setCached(cacheKey, forecast);
    return {
      forecast,
      providerStatus: 'live',
    };
  } catch (error) {
    const forecast = await withOpenWeatherFallback(error, 'forecast', () =>
      cacheKey
        ? getForecastFallback(cacheKey)
        : tryGetLatestSyncedForecast().then((forecast) =>
            forecast.length > 0 ? forecast : null,
          ),
    );
    return {
      forecast,
      providerStatus: 'synced',
    };
  }
}

export async function getForecast(location?: LocationQuery): Promise<ChartDataPoint[]> {
  const result = await getForecastResult(location);
  return result.forecast;
}

export async function getForecastBundle(
  location?: LocationQuery,
  options: { bypassCache?: boolean } = {},
): Promise<ForecastBundleResult> {
  let cacheKey: string | undefined;
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const params = {
      ...getOpenWeatherLocationParams(location),
      units: 'metric',
      appid: apiKey,
    };
    cacheKey = `${getCacheKey('forecast', params)}:bundle:${FORECAST_CACHE_VERSION}`;
    if (!options.bypassCache) {
      const cached = getCached<{
        forecast: ChartDataPoint[];
        dailyOutlook: DailyOutlook[];
        alerts: WeatherAlert[];
        providerStatus: ProviderStatus;
      }>(cacheKey);
      if (cached) return cached;
    }

    const data = (await weatherBreaker.fire({ endpoint: 'forecast', params })) as OpenWeatherForecastPayload;
    const forecast = mapOpenWeatherForecast(data);
    assertUsableForecast(forecast, 'forecast bundle');
    const dailyOutlook = mapDailyOutlook(data);
    const resolvedDailyOutlook =
      dailyOutlook.length > 0 ? dailyOutlook : getDailyOutlookFromForecast(forecast);
    const bundle = {
      forecast,
      dailyOutlook: resolvedDailyOutlook,
      alerts: mapTagumAlerts(resolvedDailyOutlook, forecast),
      providerStatus: 'live' as const,
    };

    if (!options.bypassCache) {
      setCached(cacheKey, bundle);
    }
    return bundle;
  } catch (error) {
    const fallback = await withOpenWeatherFallback(error, 'forecast bundle', async () => {
      const fallbackBundle = cacheKey ? await getForecastFallbackBundle(cacheKey) : null;
      if (!fallbackBundle) return null;
      return {
        ...fallbackBundle,
        providerStatus: 'synced' as const,
      };
    });

    return fallback;
  }
}
