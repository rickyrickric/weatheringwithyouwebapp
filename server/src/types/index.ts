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
}

export interface OptimalWindow {
  start: number;
  end: number;
}
