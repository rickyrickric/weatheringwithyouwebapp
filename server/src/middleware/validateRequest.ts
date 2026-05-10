import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

const optionalQueryNumber = (min: number, max: number) =>
  z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().min(min).max(max).optional(),
  );

export const locationQuerySchema = z
  .object({
    city: z.string().trim().min(2).max(120).optional(),
    lat: optionalQueryNumber(-90, 90),
    lon: optionalQueryNumber(-180, 180),
  })
  .superRefine((value, context) => {
    const hasCity = Boolean(value.city);
    const hasLat = typeof value.lat === 'number';
    const hasLon = typeof value.lon === 'number';

    if ((hasLat && !hasLon) || (!hasLat && hasLon)) {
      context.addIssue({
        code: 'custom',
        message: 'lat and lon must be provided together',
        path: hasLat ? ['lon'] : ['lat'],
      });
    }

    if (hasCity && (hasLat || hasLon)) {
      context.addIssue({
        code: 'custom',
        message: 'Use city or coordinates, not both',
        path: ['city'],
      });
    }
  });

export type LocationQuery = z.infer<typeof locationQuerySchema>;

export const validateQuery =
  (schema: z.ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    req.query = schema.parse(req.query) as Request['query'];
    next();
  };
