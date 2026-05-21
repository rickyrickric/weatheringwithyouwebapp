import type { CurrentWeather } from "../types/weather";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const pickFiniteNumber = (value: unknown, fallback: number) =>
  isFiniteNumber(value) ? value : fallback;

const pickOptionalFiniteNumber = (value: unknown, fallback?: number) =>
  isFiniteNumber(value) ? value : fallback;

export const sanitizeCurrentWeather = (
  candidate: unknown,
  fallback: CurrentWeather,
): CurrentWeather => {
  const weather = (candidate ?? {}) as Partial<CurrentWeather>;

  return {
    temperature: pickFiniteNumber(weather.temperature, fallback.temperature),
    rainChance: pickFiniteNumber(weather.rainChance, fallback.rainChance),
    humidity: pickFiniteNumber(weather.humidity, fallback.humidity),
    windSpeed: pickFiniteNumber(weather.windSpeed, fallback.windSpeed),
    feelsLike: pickOptionalFiniteNumber(weather.feelsLike, fallback.feelsLike),
    condition:
      typeof weather.condition === "string" && weather.condition.trim().length > 0
        ? weather.condition
        : fallback.condition,
    visibility: pickOptionalFiniteNumber(weather.visibility, fallback.visibility),
    pressure: pickOptionalFiniteNumber(weather.pressure, fallback.pressure),
    uvIndex: pickOptionalFiniteNumber(weather.uvIndex, fallback.uvIndex),
    dewPoint: pickOptionalFiniteNumber(weather.dewPoint, fallback.dewPoint),
    weatherId: pickOptionalFiniteNumber(weather.weatherId, fallback.weatherId),
  };
};
