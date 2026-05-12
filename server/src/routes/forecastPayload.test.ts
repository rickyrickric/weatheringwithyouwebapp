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
  });

  it('returns the revised source label and Working Advisory title for elevated rain risk', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        list: [
          forecastEntry(1, 0.72, 12, 30),
          forecastEntry(4, 0.65, 8, 29),
          forecastEntry(7, 0.35, 1, 28),
        ],
      },
    });

    const response = await request(createApp()).get('/api/v1/weather/forecast/24h?city=Tagum%20Risk');

    expect(response.status).toBe(200);
    expect(response.body.accuracy.label).toBe(FORECAST_SOURCE_LABEL);
    expect(response.body.sourceConfidence.label).toBe(FORECAST_SOURCE_LABEL);
    expect(response.body.alerts[0]).toMatchObject({
      title: 'Afternoon Thunderstorm Working Advisory',
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
          forecastEntry(1, 0.2, 0.4, 29),
          forecastEntry(4, 0.24, 0.3, 30),
          forecastEntry(7, 0.18, 0.2, 29),
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
  });
});
