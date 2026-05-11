// Shared weather data types used across the app

export interface ChartDataPoint {
  time: string;
  temperature: number;
  rainProbability: number;
  rainMm?: number;
}

export interface HourlyClimatologyPoint {
  hourOfDay: number;
  avgTemperature: number;
  stdTemperature: number | null;
  temperatureCount: number;
  avgRainProbability: number;
  stdRainProbability: number | null;
  rainProbabilityCount: number;
  avgRainMm?: number | null;
}

export interface ForecastBlendInfo {
  method: 'polynomial' | 'climatology-residual-blend';
  degree: number;
  alpha: number;
  climatologyUsed: boolean;
  confidence: number;
}

export type RainIntensity = 'none' | 'light' | 'moderate' | 'heavy';

export interface DailyOutlook {
  day: string;
  date: string;
  high: number;
  low: number;
  rainChance: number;
  rainMm: number;
  summary: string;
  intensity?: RainIntensity;
}

export interface WeatherAlert {
  title: string;
  urgency: 'Moderate' | 'Advisory';
  tone: 'moderate' | 'advisory';
  barangays: string;
  guidance: string;
}

export interface SunshineWindow {
  startTime: string;
  endTime: string;
}

export interface CurrentWeather {
  temperature: number;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  feelsLike?: number;
  condition?: string;
  visibility?: number;
  pressure?: number;
  uvIndex?: number;
  dewPoint?: number;
  weatherId?: number;
}

export interface OptimalWindow {
  start: number;
  end: number;
}

export interface WeatherWindow {
  label: string;
  time: string;
  activity: string;
  icon: string;
  temp: number;
  rain: number;
  badge: 'OPTIMAL' | 'GOOD' | 'FAIR';
  badgeColor: string;
  rating: number;
  confidence: number;
  start: number;
  end: number;
}

export interface AccuracySummary {
  value: number | null;
  label: string;
  sampleSize: number;
  status: 'pending-dataset' | 'measured';
}

export interface ForecastResponse {
  generatedAt: string;
  source: 'openweather';
  forecast: ChartDataPoint[];
  climatology?: {
    hourly: HourlyClimatologyPoint[];
  };
  blendInfo?: ForecastBlendInfo;
  optimalWindows: OptimalWindow[];
  sunshineWindows: WeatherWindow[];
  accuracy: AccuracySummary;
  dailyOutlook?: DailyOutlook[];
  alerts?: WeatherAlert[];
  sourceConfidence?: {
    label: string;
    value: 'High' | 'Medium' | 'Low';
  };
}

// Shared optimal time windows used by Forecast and other pages
export const OPTIMAL_WINDOWS: OptimalWindow[] = [
  { start: 8, end: 11 },   // 08:00 – 11:00
  { start: 14, end: 16 },  // 14:00 – 16:00
  { start: 19, end: 21 },  // 19:00 – 21:00
];

// Derive a time-of-day label from an hour (0–23)
export function getTimeOfDay(
  hour: number,
): 'morning' | 'afternoon' | 'evening' | 'night' | 'sunset' {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 19) return 'sunset';
  if (hour >= 19 && hour < 22) return 'evening';
  return 'night';
}

// Default 24-hour mock chart data (used until API is connected)
export const DEFAULT_CHART_DATA: ChartDataPoint[] = [
  { time: '00:00', temperature: 23, rainProbability: 10 },
  { time: '04:00', temperature: 21, rainProbability: 15 },
  { time: '08:00', temperature: 26, rainProbability: 5 },
  { time: '12:00', temperature: 31, rainProbability: 20 },
  { time: '16:00', temperature: 29, rainProbability: 35 },
  { time: '20:00', temperature: 27, rainProbability: 45 },
  { time: '23:00', temperature: 24, rainProbability: 25 },
];

// Centralised mock weather (used until API is connected)
export const MOCK_WEATHER: CurrentWeather = {
  temperature: 28,
  rainChance: 35,
  humidity: 72,
  windSpeed: 12,
  feelsLike: 26,
  condition: 'partly cloudy',
  visibility: 10,
  pressure: 101325,
  uvIndex: 6,
  dewPoint: 20,
  weatherId: 800,
};
