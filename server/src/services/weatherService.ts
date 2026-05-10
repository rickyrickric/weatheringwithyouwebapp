import axios from 'axios';
import CircuitBreaker from 'opossum';
import { LocationQuery } from '../middleware/validateRequest';
import { ChartDataPoint, CurrentWeather } from '../types';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const WEATHER_CACHE_TTL_MS = Number(process.env.WEATHER_CACHE_TTL_MS || 60 * 60 * 1000);

type OpenWeatherEndpoint = 'weather' | 'forecast';
type OpenWeatherParams = Record<string, string | number>;
type OpenWeatherCurrentPayload = {
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
};
type OpenWeatherForecastPayload = {
  list?: OpenWeatherForecastEntry[];
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

const getCached = <T>(key: string) => {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    responseCache.delete(key);
    return null;
  }
  return entry.value as T;
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

const mapOpenWeatherCurrent = (data: OpenWeatherCurrentPayload): CurrentWeather => {
  const windSpeedKmH = data.wind?.speed ? data.wind.speed * 3.6 : 0;
  const cloudCover = typeof data.clouds?.all === 'number' ? data.clouds.all : 0;

  return {
    temperature: data.main?.temp ?? 0,
    rainChance: cloudCover,
    humidity: data.main?.humidity ?? 0,
    windSpeed: Math.round(windSpeedKmH),
    feelsLike: data.main?.feels_like,
    condition: data.weather?.[0]?.description,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : undefined,
    pressure: data.main?.pressure,
    uvIndex: undefined,
    dewPoint: undefined,
    weatherId: data.weather?.[0]?.id,
  };
};

const mapOpenWeatherForecast = (data: OpenWeatherForecastPayload): ChartDataPoint[] => {
  const now = Date.now();
  const end = now + 24 * 60 * 60 * 1000;

  return (data.list || [])
    .filter((entry) => {
      const timestamp = (entry.dt || 0) * 1000;
      return timestamp >= now && timestamp <= end;
    })
    .map((entry) => ({
      time: formatTime(new Date(entry.dt * 1000)),
      temperature: entry.main?.temp ?? 0,
      rainProbability: Math.round(((entry.pop ?? 0) as number) * 100),
    }));
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

const weatherBreaker = new CircuitBreaker(requestOpenWeather, {
  timeout: Number(process.env.OPENWEATHER_TIMEOUT_MS || 8000),
  errorThresholdPercentage: Number(process.env.OPENWEATHER_CIRCUIT_ERROR_THRESHOLD || 50),
  resetTimeout: Number(process.env.OPENWEATHER_CIRCUIT_RESET_MS || 30_000),
});

export async function getCurrentWeather(location?: LocationQuery): Promise<CurrentWeather> {
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const params = {
      ...getOpenWeatherLocationParams(location),
      units: 'metric',
      appid: apiKey,
    };
    const cacheKey = getCacheKey('weather', params);
    const cached = getCached<CurrentWeather>(cacheKey);
    if (cached) return cached;

    const data = (await weatherBreaker.fire({ endpoint: 'weather', params })) as OpenWeatherCurrentPayload;
    const weather = mapOpenWeatherCurrent(data);
    setCached(cacheKey, weather);
    return weather;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'current'), { cause: error });
  }
}

export async function getForecast(location?: LocationQuery): Promise<ChartDataPoint[]> {
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const params = {
      ...getOpenWeatherLocationParams(location),
      units: 'metric',
      appid: apiKey,
    };
    const cacheKey = getCacheKey('forecast', params);
    const cached = getCached<ChartDataPoint[]>(cacheKey);
    if (cached) return cached;

    const data = (await weatherBreaker.fire({ endpoint: 'forecast', params })) as OpenWeatherForecastPayload;
    const forecast = mapOpenWeatherForecast(data);
    setCached(cacheKey, forecast);
    return forecast;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'forecast'), { cause: error });
  }
}
