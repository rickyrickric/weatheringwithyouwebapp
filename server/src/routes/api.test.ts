import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';

describe('weather API validation', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    delete process.env.HEALTH_RATE_LIMIT_MAX;
    delete process.env.HEALTH_RATE_LIMIT_WINDOW_MS;
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('rejects coordinate requests missing lon', async () => {
    const response = await request(createApp()).get('/api/v1/weather/current?lat=7.4478');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('does not coerce empty coordinates to zero', async () => {
    const previousApiKey = process.env.OPENWEATHER_API_KEY;
    delete process.env.OPENWEATHER_API_KEY;

    const response = await request(createApp()).get('/api/v1/weather/current?lat=&lon=');

    if (previousApiKey === undefined) {
      delete process.env.OPENWEATHER_API_KEY;
    } else {
      process.env.OPENWEATHER_API_KEY = previousApiKey;
    }

    expect(response.status).toBe(502);
    expect(response.body.error.code).toBe('UPSTREAM_UNAVAILABLE');
  });

  it('serves the latest synced current weather from Supabase when OpenWeather is unavailable', async () => {
    const previousApiKey = process.env.OPENWEATHER_API_KEY;
    delete process.env.OPENWEATHER_API_KEY;
    process.env.SUPABASE_URL = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          temperature: 29,
          rain_probability: 40,
          humidity: 81,
          wind_speed: 12,
          weather_id: 500,
          raw_payload: {
            temperature: 29,
            rainChance: 40,
            humidity: 81,
            windSpeed: 12,
            weatherId: 500,
          },
        },
      ],
    } as Response);

    const response = await request(createApp()).get('/api/v1/weather/current');

    if (previousApiKey === undefined) {
      delete process.env.OPENWEATHER_API_KEY;
    } else {
      process.env.OPENWEATHER_API_KEY = previousApiKey;
    }

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      temperature: 29,
      rainChance: 40,
      humidity: 81,
      windSpeed: 12,
      weatherId: 500,
    });
  });

  it('serves OpenAPI documentation JSON', async () => {
    const response = await request(createApp()).get('/api/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.0');
  });

  it('rate limits health checks separately from API traffic', async () => {
    process.env.HEALTH_RATE_LIMIT_MAX = '1';
    process.env.HEALTH_RATE_LIMIT_WINDOW_MS = '60000';
    const app = createApp();

    const first = await request(app).get('/health');
    const second = await request(app).get('/health');

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(second.body.error.code).toBe('RATE_LIMITED');
  });
});
