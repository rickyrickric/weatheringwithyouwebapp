export interface ChartDataPoint {
  time: string;
  temperature: number;
  rainProbability: number;
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

export type WindowBadge = 'OPTIMAL' | 'GOOD' | 'FAIR';

export interface WeatherWindow {
  label: string;
  time: string;
  activity: string;
  icon: string;
  temp: number;
  rain: number;
  badge: WindowBadge;
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
  optimalWindows: OptimalWindow[];
  sunshineWindows: WeatherWindow[];
  accuracy: AccuracySummary;
}
