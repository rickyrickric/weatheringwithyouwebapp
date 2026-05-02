import { Router } from 'express';
import { getCurrent, getForecastData } from '../controllers/weatherController';

const router = Router();

router.get('/weather/current', getCurrent);
router.get('/weather/forecast', getForecastData);

export default router;
