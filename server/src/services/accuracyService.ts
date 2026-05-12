import { AccuracySummary } from '../types';

export const FORECAST_SOURCE_LABEL = 'Forecast powered by OpenWeather and PAGASA';

export function getAccuracySummary(): AccuracySummary {
  return {
    value: null,
    label: FORECAST_SOURCE_LABEL,
    sampleSize: 0,
    status: 'pending-dataset',
  };
}
