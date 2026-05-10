import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';

describe('weather API validation', () => {
  it('rejects coordinate requests missing lon', async () => {
    const response = await request(createApp()).get('/api/v1/weather/current?lat=7.4478');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('BAD_REQUEST');
  });

  it('serves OpenAPI documentation JSON', async () => {
    const response = await request(createApp()).get('/api/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe('3.0.0');
  });
});
