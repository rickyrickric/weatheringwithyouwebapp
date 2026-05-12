import { describe, expect, it } from 'vitest';
import { FORECAST_SOURCE_LABEL, getAccuracySummary } from './accuracyService';

describe('accuracy summary', () => {
  it('uses the OpenWeather and PAGASA source label while the dataset is pending', () => {
    expect(getAccuracySummary()).toMatchObject({
      label: FORECAST_SOURCE_LABEL,
      status: 'pending-dataset',
    });
  });
});
