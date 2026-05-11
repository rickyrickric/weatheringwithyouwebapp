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
  intensity: RainIntensity;
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
  climatology?: {
    hourly: HourlyClimatologyPoint[];
  };
  blendInfo?: ForecastBlendInfo;
  optimalWindows: OptimalWindow[];
  sunshineWindows: WeatherWindow[];
  accuracy: AccuracySummary;
  dailyOutlook: DailyOutlook[];
  alerts: WeatherAlert[];
  sourceConfidence: {
    label: string;
    value: 'High' | 'Medium' | 'Low';
  };
}
