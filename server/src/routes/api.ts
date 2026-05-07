import { Router } from 'express';
import {
  getAccuracy,
  getCurrent,
  getForecastData,
  getSunshineWindows,
} from '../controllers/weatherController';

const router = Router();

router.get('/weather/current', getCurrent);
router.get('/weather/forecast', getForecastData);
router.get('/weather/forecast/24h', getForecastData);
router.get('/weather/sunshine-windows', getSunshineWindows);
router.get('/weather/accuracy', getAccuracy);

export default router;
