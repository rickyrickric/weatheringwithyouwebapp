import { ChartDataPoint, OptimalWindow, WeatherWindow, WindowBadge } from '../types';

const WINDOW_BUCKETS = [
  { label: 'Morning', start: 6, end: 11, icon: '☀️' },
  { label: 'Midday', start: 11, end: 15, icon: '🌤️' },
  { label: 'Afternoon', start: 15, end: 19, icon: '🌦️' },
];

const BADGE_COLORS: Record<WindowBadge, string> = {
  OPTIMAL: '#e07b39',
  GOOD: '#4a9a6a',
  FAIR: '#7a6ab0',
};

const parseHour = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(hours) + Number(minutes) / 60;
};

const formatHour = (hour: number) => `${String(Math.floor(hour)).padStart(2, '0')}:00`;

const scorePoint = (point: ChartDataPoint) => {
  const rainPenalty = point.rainProbability * 0.55;
  const heatPenalty = Math.max(0, point.temperature - 30) * 6;
  const coolPenalty = Math.max(0, 23 - point.temperature) * 4;
  return Math.max(0, Math.min(100, Math.round(100 - rainPenalty - heatPenalty - coolPenalty)));
};

const getBadge = (rating: number): WindowBadge => {
  if (rating >= 78) return 'OPTIMAL';
  if (rating >= 60) return 'GOOD';
  return 'FAIR';
};

const getActivity = (rating: number, rain: number, temperature: number) => {
  if (rating >= 78 && rain <= 20) return 'Outdoor exercise';
  if (temperature >= 31) return 'Short outdoor errands';
  if (rain >= 45) return 'Carry rain backup';
  return 'Outdoor planning';
};

export function computeOptimalWindows(windows: WeatherWindow[]): OptimalWindow[] {
  return windows.map((window) => ({
    start: window.start,
    end: window.end,
  }));
}

export function computeSunshineWindows(forecast: ChartDataPoint[]): WeatherWindow[] {
  if (forecast.length === 0) return [];

  return WINDOW_BUCKETS.map((bucket) => {
    const bucketPoints = forecast.filter((point) => {
      const hour = parseHour(point.time);
      return hour >= bucket.start && hour < bucket.end;
    });

    const candidates = bucketPoints.length > 0 ? bucketPoints : forecast;
    const best = candidates.reduce((currentBest, point) =>
      scorePoint(point) > scorePoint(currentBest) ? point : currentBest,
    );

    const start = Math.floor(parseHour(best.time));
    const end = Math.min(start + 2, 24);
    const rating = scorePoint(best);
    const badge = getBadge(rating);

    return {
      label: bucket.label,
      time: `${formatHour(start)}-${formatHour(end)}`,
      activity: getActivity(rating, best.rainProbability, best.temperature),
      icon: bucket.icon,
      temp: Math.round(best.temperature),
      rain: Math.round(best.rainProbability),
      badge,
      badgeColor: BADGE_COLORS[badge],
      rating,
      confidence: Math.max(35, Math.min(95, rating - Math.round(best.rainProbability / 4))),
      start,
      end,
    };
  });
}
