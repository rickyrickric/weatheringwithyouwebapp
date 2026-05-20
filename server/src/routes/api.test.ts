import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApp } from '../app';

describe('weather API validation', () => {
  afterEach(() => {
    delete process.env.HEALTH_RATE_LIMIT_MAX;
    delete process.env.HEALTH_RATE_LIMIT_WINDOW_MS;
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
