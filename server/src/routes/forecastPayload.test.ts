import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import { createApp } from '../app';
import { FORECAST_SOURCE_LABEL } from '../services/accuracyService';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    isAxiosError: vi.fn(() => false),
  },
}));

const forecastEntry = (hourOffset: number, pop: number, rainMm: number, temp = 29) => ({
  dt: Math.floor(new Date('2026-05-12T00:00:00.000Z').getTime() / 1000) + hourOffset * 60 * 60,
  main: { temp },
  pop,
  rain: { '3h': rainMm },
  weather: [{ description: 'light rain', id: 500, main: 'Rain' }],
});

describe('forecast payload copy', () => {
  const previousApiKey = process.env.OPENWEATHER_API_KEY;
  const previousCity = process.env.OPENWEATHER_CITY;
  const previousSupabaseUrl = process.env.SUPABASE_URL;
  const previousSupabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.setSystemTime(new Date('2026-05-12T00:00:00.000Z'));
    process.env.OPENWEATHER_API_KEY = 'test-key';
    process.env.OPENWEATHER_CITY = 'Tagum Test City';
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    vi.mocked(axios.get).mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (previousApiKey === undefined) {
      delete process.env.OPENWEATHER_API_KEY;
    } else {
      process.env.OPENWEATHER_API_KEY = previousApiKey;
    }
    if (previousCity === undefined) {
      delete process.env.OPENWEATHER_CITY;
    } else {
      process.env.OPENWEATHER_CITY = previousCity;
    }
    if (previousSupabaseUrl === undefined) {
      delete process.env.SUPABASE_URL;
    } else {
      process.env.SUPABASE_URL = previousSupabaseUrl;
    }
    if (previousSupabaseKey === undefined) {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    } else {
      process.env.SUPABASE_SERVICE_ROLE_KEY = previousSupabaseKey;
    }
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns the revised source label and Working Advisory title for elevated rain risk', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        list: [
          forecastEntry(1, 0.96, 8, 30),
          forecastEntry(4, 0.93, 7, 29),
          forecastEntry(7, 0.72, 5, 28),
        ],
      },
    });

    const response = await request(createApp()).get('/api/v1/weather/forecast/24h?city=Tagum%20Risk');

    expect(response.status).toBe(200);
    expect(response.body.accuracy.label).toBe(FORECAST_SOURCE_LABEL);
    expect(response.body.sourceConfidence.label).toBe(FORECAST_SOURCE_LABEL);
    expect(response.body.alerts[0]).toMatchObject({
      title: 'Afternoon Thunderstorm Advisory',
      urgency: 'Moderate',
      tone: 'moderate',
    });
    expect(response.body.alerts[1]).toMatchObject({
      title: 'Evening Commuter Shower Watch',
      urgency: 'Advisory',
      tone: 'advisory',
    });
  });

  it('returns the Shower Watch title while preserving advisory severity and tone', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        list: [
          forecastEntry(1, 0.86, 2.7, 29),
          forecastEntry(4, 0.78, 1.5, 30),
          forecastEntry(7, 0.68, 0.9, 29),
        ],
      },
    });

    const response = await request(createApp()).get('/api/v1/weather/forecast/24h?city=Tagum%20Calm');

    expect(response.status).toBe(200);
    expect(response.body.alerts[0]).toMatchObject({
      title: 'Localized Shower Watch',
      urgency: 'Advisory',
      tone: 'advisory',
    });
    expect(response.body.alerts).toHaveLength(1);
  });

  it('returns no advisories when no severe anomaly signal is present', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        list: [
          forecastEntry(1, 0.12, 0.1, 29),
          forecastEntry(4, 0.16, 0.1, 30),
          forecastEntry(7, 0.1, 0.1, 29),
        ],
      },
    });

    const response = await request(createApp()).get('/api/v1/weather/forecast/24h?city=Tagum%20Clear');

    expect(response.status).toBe(200);
    expect(response.body.alerts).toEqual([]);
  });

  it('returns realtime advisories with no-store cache headers', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        list: [
          forecastEntry(1, 0.7, 10, 30),
          forecastEntry(4, 0.62, 7, 29),
          forecastEntry(7, 0.42, 1, 28),
        ],
      },
    });

    const response = await request(createApp()).get('/api/v1/weather/advisories?city=Tagum%20Live');

    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body.generatedAt).toBeTruthy();
    expect(response.body.alerts[0]).toMatchObject({
      title: 'Afternoon Thunderstorm Advisory',
      urgency: 'Moderate',
      tone: 'moderate',
    });
  });

  it('restores the forecast from Supabase sync when OpenWeather fails', async () => {
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('provider offline'));
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            target_time: '01:00',
            predicted_temperature: 29,
            predicted_rain_probability: 45,
            raw_payload: {
              point: {
                time: '01:00',
                temperature: 29,
                rainProbability: 45,
              },
            },
          },
          {
            target_time: '02:00',
            predicted_temperature: 28,
            predicted_rain_probability: 50,
            raw_payload: {
              point: {
                time: '02:00',
                temperature: 28,
                rainProbability: 50,
              },
            },
          },
          {
            target_time: '03:00',
            predicted_temperature: 28,
            predicted_rain_probability: 42,
            raw_payload: {
              point: {
                time: '03:00',
                temperature: 28,
                rainProbability: 42,
              },
            },
          },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response);

    const response = await request(createApp()).get('/api/v1/weather/forecast/24h?city=Tagum%20Fallback');

    expect(response.status).toBe(200);
    expect(response.body.source).toBe('supabase-sync');
    expect(response.body.sourceConfidence).toMatchObject({
      value: 'Medium',
    });
    expect(response.body.forecast).toHaveLength(3);
  });
});
