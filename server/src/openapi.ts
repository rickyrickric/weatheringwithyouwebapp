import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

export const openApiSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weathering With You API',
      version: '1.0.0',
      description: 'Versioned weather intelligence API for current conditions and forecast planning.',
    },
    servers: [{ url: '/api/v1' }],
    components: {
      schemas: {
        ApiError: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                requestId: { type: 'string' },
              },
            },
          },
        },
        CurrentWeather: {
          type: 'object',
          properties: {
            temperature: { type: 'number' },
            rainChance: { type: 'number' },
            humidity: { type: 'number' },
            windSpeed: { type: 'number' },
            condition: { type: 'string' },
          },
        },
      },
      parameters: {
        city: {
          in: 'query',
          name: 'city',
          schema: { type: 'string', example: 'Tagum City,PH' },
          required: false,
        },
        lat: {
          in: 'query',
          name: 'lat',
          schema: { type: 'number', minimum: -90, maximum: 90, example: 7.4478 },
          required: false,
        },
        lon: {
          in: 'query',
          name: 'lon',
          schema: { type: 'number', minimum: -180, maximum: 180, example: 125.8078 },
          required: false,
        },
      },
    },
  },
  apis: [path.join(__dirname, 'routes/*.{ts,js}')],
});
