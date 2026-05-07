import bgCloudy from '../assets/forecast_cloudy.png';
import bgNighttime from '../assets/forecast_nighttime.png';
import bgRaining from '../assets/forecast_raining.png';
import bgStorm from '../assets/forecast_storm.png';
import bgSunshine from '../assets/forecast_sunshine.png';

export type WeatherHeroKind = 'clear' | 'cloudy' | 'rain' | 'storm' | 'night';

export interface WeatherHeroImage {
  kind: WeatherHeroKind;
  src: string;
}

const normalizeCondition = (condition?: string) =>
  condition?.trim().toLowerCase() ?? '';

export function getWeatherHeroImage(
  condition?: string,
  weatherId?: number,
  hour = new Date().getHours(),
): WeatherHeroImage {
  const normalized = normalizeCondition(condition);
  const isNight = hour >= 18 || hour < 5;

  if (
    normalized.includes('thunder') ||
    normalized.includes('storm') ||
    (weatherId !== undefined && weatherId >= 200 && weatherId < 300)
  ) {
    return { kind: 'storm', src: bgStorm };
  }

  if (
    normalized.includes('rain') ||
    normalized.includes('drizzle') ||
    normalized.includes('shower') ||
    (weatherId !== undefined && weatherId >= 300 && weatherId < 600)
  ) {
    return { kind: 'rain', src: bgRaining };
  }

  if (
    normalized.includes('cloud') ||
    normalized.includes('overcast') ||
    normalized.includes('mist') ||
    normalized.includes('fog') ||
    (weatherId !== undefined && weatherId >= 801 && weatherId <= 804)
  ) {
    return { kind: 'cloudy', src: bgCloudy };
  }

  if (isNight) {
    return { kind: 'night', src: bgNighttime };
  }

  if (
    normalized.includes('clear') ||
    normalized.includes('sun') ||
    weatherId === 800
  ) {
    return { kind: 'clear', src: bgSunshine };
  }

  return { kind: isNight ? 'night' : 'clear', src: isNight ? bgNighttime : bgSunshine };
}
