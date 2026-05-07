import { AccuracySummary } from '../types';

export function getAccuracySummary(): AccuracySummary {
  return {
    value: null,
    label: 'Pending historical dataset',
    sampleSize: 0,
    status: 'pending-dataset',
  };
}
