import { describe, expect, it } from 'vitest';
import { applyRegression, blendedRegression } from './mlService';
import { computeSunshineWindows } from './sunshineWindowService';

const forecast = [
  { time: '06:00', temperature: 25, rainProbability: 10 },
  { time: '09:00', temperature: 27, rainProbability: 15 },
  { time: '12:00', temperature: 31, rainProbability: 20 },
  { time: '15:00', temperature: 29, rainProbability: 35 },
  { time: '18:00', temperature: 27, rainProbability: 45 },
];

describe('sunshine window scoring', () => {
  it('returns practical windows for the planning buckets', () => {
    const windows = computeSunshineWindows(forecast);

    expect(windows).toHaveLength(3);
    expect(windows[0]).toMatchObject({
      label: 'Morning',
      badge: 'OPTIMAL',
      activity: 'Outdoor exercise',
    });
  });
});

describe('forecast regression smoothing', () => {
  it('keeps rain probabilities bounded after smoothing', () => {
    const smoothed = applyRegression(forecast, 2);

    expect(smoothed).toHaveLength(forecast.length);
    expect(smoothed.every((point) => point.rainProbability >= 0 && point.rainProbability <= 100)).toBe(
      true,
    );
  });

  it('uses climatology residual blending when hourly priors are available', () => {
    const climatology = Array.from({ length: 24 }, (_, hourOfDay) => ({
      hourOfDay,
      avgTemperature: hourOfDay < 12 ? 26 : 30,
      stdTemperature: 1.4,
      temperatureCount: 90,
      avgRainProbability: hourOfDay < 12 ? 18 : 42,
      stdRainProbability: 12,
      rainProbabilityCount: 90,
      avgRainMm: 1,
    }));

    const result = blendedRegression(forecast, climatology, { degree: 2 });

    expect(result.forecast).toHaveLength(forecast.length);
    expect(result.blendInfo.climatologyUsed).toBe(true);
    expect(result.blendInfo.confidence).toBeGreaterThan(35);
    expect(result.forecast.every((point) => point.rainProbability >= 0 && point.rainProbability <= 100)).toBe(
      true,
    );
  });
});
