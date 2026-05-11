import { AccuracySummary } from '../types';

export function getAccuracySummary(): AccuracySummary {
  return {
    value: null,
    label: 'Forecast powered by 90-day climate data',
    sampleSize: 0,
    status: 'pending-dataset',
  };
}
