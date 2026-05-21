const resolveWeatherApiBase = () => {
  const configuredBase = import.meta.env.VITE_WEATHER_API_BASE?.trim();
  if (!configuredBase) return "/api/v1/weather";

  return configuredBase.endsWith("/")
    ? configuredBase.slice(0, -1)
    : configuredBase;
};

export const WEATHER_API_BASE = resolveWeatherApiBase();
