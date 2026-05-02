import regression from 'regression';
import { ChartDataPoint } from '../types';

/**
 * Apply polynomial regression to smooth out the temperature and rain probability forecast.
 * This simulates a machine learning pipeline for advanced forecasting.
 * @param data Array of forecast data points
 * @param degree Polynomial degree (e.g., 3 or 4)
 */
export function applyRegression(data: ChartDataPoint[], degree: number = 3): ChartDataPoint[] {
  if (data.length === 0) return data;

  // Convert time to numeric hours for regression (e.g., "14:00" -> 14)
  const mapTimeToNumber = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
  };

  // Prepare data for regression: [x, y]
  const tempData: [number, number][] = data.map(d => [mapTimeToNumber(d.time), d.temperature]);
  const rainData: [number, number][] = data.map(d => [mapTimeToNumber(d.time), d.rainProbability]);

  // Apply polynomial regression
  const tempResult = regression.polynomial(tempData, { order: degree, precision: 3 });
  const rainResult = regression.polynomial(rainData, { order: degree, precision: 3 });

  // Map back to ChartDataPoint
  return data.map((d, index) => {
    const x = mapTimeToNumber(d.time);
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
