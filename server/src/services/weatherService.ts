import axios from 'axios';
import { createRequire } from 'module';
import { LocationQuery } from '../middleware/validateRequest';
import { ChartDataPoint, CurrentWeather, DailyOutlook, RainIntensity, WeatherAlert } from '../types';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
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
type OpenWeatherForecastEntryWithTimestamp = OpenWeatherForecastEntry & {
  dt: number;
};
type ForecastSourcePoint = {
  timestamp: number;
  temperature: number;
  rainProbability: number;
  rainMmPerHour: number;
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

const mapOpenWeatherCurrent = (data: OpenWeatherCurrentPayload): CurrentWeather => {
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
    uvIndex: undefined,
    dewPoint: calculateDewPoint(data.main?.temp, data.main?.humidity),
    weatherId: data.weather?.[0]?.id,
  };
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
  const peakDailyRain = Math.max(...dailyOutlook.map((day) => day.rainMm), 0);
  const peakHourlyRain = Math.max(...forecast.map((point) => point.rainMm ?? 0), 0);
  const peakRainChance = Math.max(...dailyOutlook.map((day) => day.rainChance), 0);

  const primary: WeatherAlert =
    peakDailyRain >= 7.6 || peakHourlyRain >= 7.6 || peakRainChance >= 65
      ? {
          title: 'Afternoon Thunderstorm Advisory',
          urgency: 'Moderate',
          tone: 'moderate',
          barangays: 'Apokon, Mankilam, Canocotan',
          guidance:
            'Plan school pickups before 3 PM where possible. Low-lying streets near drainage canals may pond quickly during short heavy bursts.',
        }
      : {
          title: 'Localized Shower Watch',
          urgency: 'Advisory',
          tone: 'advisory',
          barangays: 'Apokon, Mankilam, Canocotan',
          guidance:
            'Keep rain cover nearby for short barangay trips. Watch shaded side streets where drizzle can leave slick pavement.',
        };

  const secondary: WeatherAlert = {
    title: 'Evening Commuter Shower Watch',
    urgency: 'Advisory',
    tone: 'advisory',
    barangays: 'Magugpo Poblacion, Visayan Village, Madaum',
    guidance:
      'Carry rain cover for tricycles and motorcycles. Give extra time along the national highway after sunset.',
  };

  return [primary, secondary];
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
    const cacheKey = `${getCacheKey('forecast', params)}:${FORECAST_CACHE_VERSION}`;
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

export async function getForecastBundle(location?: LocationQuery): Promise<{
  forecast: ChartDataPoint[];
  dailyOutlook: DailyOutlook[];
  alerts: WeatherAlert[];
}> {
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const params = {
      ...getOpenWeatherLocationParams(location),
      units: 'metric',
      appid: apiKey,
    };
    const cacheKey = `${getCacheKey('forecast', params)}:bundle:${FORECAST_CACHE_VERSION}`;
    const cached = getCached<{
      forecast: ChartDataPoint[];
      dailyOutlook: DailyOutlook[];
      alerts: WeatherAlert[];
    }>(cacheKey);
    if (cached) return cached;

    const data = (await weatherBreaker.fire({ endpoint: 'forecast', params })) as OpenWeatherForecastPayload;
    const forecast = mapOpenWeatherForecast(data);
    const dailyOutlook = mapDailyOutlook(data);
    const bundle = {
      forecast,
      dailyOutlook,
      alerts: mapTagumAlerts(dailyOutlook, forecast),
    };

    setCached(cacheKey, bundle);
    return bundle;
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'forecast bundle'), { cause: error });
  }
}
