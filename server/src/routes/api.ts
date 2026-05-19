import { Router } from 'express';
import {
  getAdvisories,
  getAccuracy,
  getCurrent,
  getForecastData,
  getSunshineWindows,
} from '../controllers/weatherController';
import { setCacheHeaders, setNoStoreHeaders } from '../middleware/cacheHeaders';
import { locationQuerySchema, validateQuery } from '../middleware/validateRequest';

const router = Router();

/**
 * @openapi
 * /weather/current:
 *   get:
 *     summary: Get current weather conditions.
 *     parameters:
 *       - $ref: '#/components/parameters/city'
 *       - $ref: '#/components/parameters/lat'
 *       - $ref: '#/components/parameters/lon'
 *     responses:
 *       200:
 *         description: Current weather payload.
 *       400:
 *         description: Invalid location query.
 */
router.get('/weather/current', validateQuery(locationQuerySchema), setCacheHeaders(60 * 60), getCurrent);

/**
 * @openapi
 * /weather/forecast:
 *   get:
 *     summary: Get a smoothed 24-hour forecast with sunshine windows.
 *     parameters:
 *       - $ref: '#/components/parameters/city'
 *       - $ref: '#/components/parameters/lat'
 *       - $ref: '#/components/parameters/lon'
 *     responses:
 *       200:
 *         description: Forecast response.
 */
router.get('/weather/forecast', validateQuery(locationQuerySchema), setCacheHeaders(60 * 60), getForecastData);
router.get('/weather/forecast/24h', validateQuery(locationQuerySchema), setCacheHeaders(60 * 60), getForecastData);
router.get('/weather/advisories', validateQuery(locationQuerySchema), setNoStoreHeaders, getAdvisories);
router.get(
  '/weather/sunshine-windows',
  validateQuery(locationQuerySchema),
  setCacheHeaders(60 * 60),
  getSunshineWindows,
);
router.get('/weather/accuracy', setCacheHeaders(5 * 60), getAccuracy);

export default router;
