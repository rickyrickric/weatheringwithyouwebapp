import axios from 'axios';
import { ChartDataPoint, CurrentWeather } from '../types';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

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

const getOpenWeatherLocationParams = () => {
  const lat = process.env.OPENWEATHER_LAT;
  const lon = process.env.OPENWEATHER_LON;
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

const mapOpenWeatherCurrent = (data: any): CurrentWeather => {
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

const mapOpenWeatherForecast = (data: any): ChartDataPoint[] => {
  const now = Date.now();
  const end = now + 24 * 60 * 60 * 1000;

  return (data.list || [])
    .filter((entry: any) => {
      const timestamp = (entry.dt || 0) * 1000;
      return timestamp >= now && timestamp <= end;
    })
    .map((entry: any) => ({
      time: formatTime(new Date(entry.dt * 1000)),
      temperature: entry.main?.temp ?? 0,
      rainProbability: Math.round(((entry.pop ?? 0) as number) * 100),
    }));
};

// Real response for current weather
export async function getCurrentWeather(): Promise<CurrentWeather> {
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const locationParams = getOpenWeatherLocationParams();
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
      params: {
        ...locationParams,
        units: 'metric',
        appid: apiKey,
      },
    });

    return mapOpenWeatherCurrent(response.data);
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'current'));
  }
}

// Real response for 24-hour forecast
export async function getForecast(): Promise<ChartDataPoint[]> {
  try {
    const apiKey = requireEnv('OPENWEATHER_API_KEY');
    const locationParams = getOpenWeatherLocationParams();
    const response = await axios.get(`${OPENWEATHER_BASE_URL}/forecast`, {
      params: {
        ...locationParams,
        units: 'metric',
        appid: apiKey,
      },
    });

    return mapOpenWeatherForecast(response.data);
  } catch (error) {
    throw new Error(getAxiosErrorMessage(error, 'forecast'));
  }
}
