import regression from 'regression';
import { ChartDataPoint, ForecastBlendInfo, HourlyClimatologyPoint } from '../types';

type BlendedRegressionOptions = {
  degree?: number;
  blendAlpha?: number;
  minClimatologyCount?: number;
};

type BlendedRegressionResult = {
  forecast: ChartDataPoint[];
  blendInfo: ForecastBlendInfo;
};

type RegressionEntry = {
  point: ChartDataPoint;
  index: number;
  climate?: HourlyClimatologyPoint;
};

type UsableRegressionEntry = {
  point: ChartDataPoint;
  index: number;
  climate: HourlyClimatologyPoint;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const roundTo = (value: number, precision: number) => {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const mapTimeToHour = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

const mapTimeToHourOfDay = (timeStr: string) => {
  const [hours] = timeStr.split(':').map(Number);
  return Number.isFinite(hours) ? clamp(Math.trunc(hours), 0, 23) : 0;
};

const fitPolynomial = (points: [number, number][], degree: number) => {
  const order = clamp(Math.trunc(degree), 1, Math.max(1, points.length - 1));
  return regression.polynomial(points, { order, precision: 3 });
};

const sigmoid = (value: number) => 1 / (1 + Math.exp(-value));

/**
 * Apply polynomial regression to smooth out the temperature and rain probability forecast.
 * This simulates a machine learning pipeline for advanced forecasting.
 * @param data Array of forecast data points
 * @param degree Polynomial degree (e.g., 3 or 4)
 */
export function applyRegression(data: ChartDataPoint[], degree: number = 3): ChartDataPoint[] {
  if (data.length === 0) return data;

  // Prepare data for regression: [x, y]
  const tempData: [number, number][] = data.map(d => [mapTimeToHour(d.time), d.temperature]);
  const rainData: [number, number][] = data.map(d => [mapTimeToHour(d.time), d.rainProbability]);

  // Apply polynomial regression
  const tempResult = fitPolynomial(tempData, degree);
  const rainResult = fitPolynomial(rainData, degree);

  // Map back to ChartDataPoint
  return data.map((d) => {
    const x = mapTimeToHour(d.time);
    // Predict y given x
    const predictedTemp = tempResult.predict(x)[1];
    const predictedRain = rainResult.predict(x)[1];

    return {
      ...d,
      // We can blend the original and predicted values or just use predicted for smoothing
      temperature: Math.round(predictedTemp * 10) / 10,
      // Ensure rain probability is between 0 and 100
      rainProbability: Math.max(0, Math.min(100, Math.round(predictedRain)))
    };
  });
}

export function blendedRegression(
  data: ChartDataPoint[],
  climatology: HourlyClimatologyPoint[] | null | undefined,
  options: BlendedRegressionOptions = {},
): BlendedRegressionResult {
  const degree = clamp(Math.trunc(options.degree ?? 3), 1, 4);
  const minClimatologyCount = options.minClimatologyCount ?? 12;
  const fallbackForecast = applyRegression(data, degree);

  if (data.length === 0 || !climatology || climatology.length === 0) {
    return {
      forecast: fallbackForecast,
      blendInfo: {
        method: 'polynomial',
        degree,
        alpha: 1,
        climatologyUsed: false,
        confidence: data.length > 0 ? 68 : 0,
      },
    };
  }

  const climatologyByHour = new Map(climatology.map((point) => [point.hourOfDay, point]));
  const hasUsableClimate = (entry: RegressionEntry): entry is UsableRegressionEntry => {
    const climate = entry.climate;
    return (
      climate !== undefined &&
      climate.temperatureCount >= minClimatologyCount &&
      climate.rainProbabilityCount >= minClimatologyCount
    );
  };

  const usable = data
    .map((point, index) => ({
      point,
      index,
      climate: climatologyByHour.get(mapTimeToHourOfDay(point.time)),
    }))
    .filter(hasUsableClimate);

  if (usable.length < Math.max(3, degree + 1)) {
    return {
      forecast: fallbackForecast,
      blendInfo: {
        method: 'polynomial',
        degree,
        alpha: 1,
        climatologyUsed: false,
        confidence: 68,
      },
    };
  }

  const tempResidualData: [number, number][] = usable.map(({ point, index, climate }) => [
    index,
    point.temperature - climate.avgTemperature,
  ]);
  const rainResidualData: [number, number][] = usable.map(({ point, index, climate }) => [
    index,
    point.rainProbability - climate.avgRainProbability,
  ]);

  const tempResidualFit = fitPolynomial(tempResidualData, degree);
  const rainResidualFit = fitPolynomial(rainResidualData, degree);
  const anomalyScores: number[] = [];
  const confidenceScores: number[] = [];
  const alphas: number[] = [];

  const forecast = data.map((point, index) => {
    const climate = climatologyByHour.get(mapTimeToHourOfDay(point.time));
    if (!climate) return fallbackForecast[index] ?? point;

    const tempStd = Math.max(climate.stdTemperature ?? 1.5, 0.5);
    const rainStd = Math.max(climate.stdRainProbability ?? 18, 5);
    const tempAnomaly = Math.abs(point.temperature - climate.avgTemperature) / tempStd;
    const rainAnomaly = Math.abs(point.rainProbability - climate.avgRainProbability) / rainStd;
    const anomaly = (tempAnomaly + rainAnomaly) / 2;
    const sampleCount = Math.min(climate.temperatureCount, climate.rainProbabilityCount);
    const countConfidence = clamp(sampleCount / 90, 0.2, 1);
    const variancePenalty = clamp((tempStd / 8 + rainStd / 60) / 2, 0, 1);
    const climatologySkill = clamp(countConfidence * (1 - variancePenalty), 0.15, 0.85);
    const sourceSkill = 0.72;
    const adaptiveAlpha =
      options.blendAlpha ??
      clamp(sigmoid(3 * (sourceSkill - climatologySkill + anomaly * 0.25)), 0.35, 0.9);

    const predictedTemp = climate.avgTemperature + adaptiveAlpha * tempResidualFit.predict(index)[1];
    const predictedRain =
      climate.avgRainProbability + adaptiveAlpha * rainResidualFit.predict(index)[1];

    anomalyScores.push(anomaly);
    confidenceScores.push(clamp(100 - variancePenalty * 35 - anomaly * 8 + countConfidence * 10, 35, 95));
    alphas.push(adaptiveAlpha);

    return {
      ...point,
      temperature: roundTo(predictedTemp, 1),
      rainProbability: Math.round(clamp(predictedRain, 0, 100)),
    };
  });

  const mean = (values: number[]) =>
    values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    forecast,
    blendInfo: {
      method: 'climatology-residual-blend',
      degree,
      alpha: roundTo(mean(alphas), 2),
      climatologyUsed: true,
      confidence: Math.round(clamp(mean(confidenceScores) - mean(anomalyScores) * 4, 35, 95)),
    },
  };
}
