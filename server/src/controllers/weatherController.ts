import { NextFunction, Request, Response } from 'express';
import { LocationQuery } from '../middleware/validateRequest';
import { getAccuracySummary } from '../services/accuracyService';
import { applyRegression, blendedRegression } from '../services/mlService';
import { computeOptimalWindows, computeSunshineWindows } from '../services/sunshineWindowService';
import {
  tryGetClimatology90d,
  tryStoreDailyForecast,
  tryStoreDailyObservation,
} from '../services/supabaseService';
import { getCurrentWeather, getForecast, getForecastBundle } from '../services/weatherService';
import { ForecastResponse } from '../types';

const getLocationQuery = (req: Request) => req.query as LocationQuery;

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    const weather = await getCurrentWeather(getLocationQuery(req));
    await tryStoreDailyObservation(weather);
    res.json(weather);
  } catch (error) {
    next(error);
  }
}

export async function getForecastData(req: Request, res: Response, next: NextFunction) {
  try {
    const forecastBundle = await getForecastBundle(getLocationQuery(req));
    const rawData = forecastBundle.forecast;
    const climatology = await tryGetClimatology90d();
    const regression = blendedRegression(rawData, climatology, { degree: 3 });
    const smoothedData = regression.forecast;
    const sunshineWindows = computeSunshineWindows(smoothedData);

    const response: ForecastResponse = {
      generatedAt: new Date().toISOString(),
      source: 'openweather',
      forecast: smoothedData,
      climatology: regression.blendInfo.climatologyUsed ? { hourly: climatology } : undefined,
      blendInfo: regression.blendInfo,
      optimalWindows: computeOptimalWindows(sunshineWindows),
      sunshineWindows,
      accuracy: getAccuracySummary(),
      dailyOutlook: forecastBundle.dailyOutlook,
      alerts: forecastBundle.alerts,
      sourceConfidence: {
        label: 'PAGASA · Open-Meteo',
        value: 'High',
      },
    };

    await tryStoreDailyForecast(response);
    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function getSunshineWindows(req: Request, res: Response, next: NextFunction) {
  try {
    const rawData = await getForecast(getLocationQuery(req));
    const smoothedData = applyRegression(rawData, 3);

    res.json({
      generatedAt: new Date().toISOString(),
      sunshineWindows: computeSunshineWindows(smoothedData),
    });
  } catch (error) {
    next(error);
  }
}

export function getAccuracy(req: Request, res: Response) {
  res.json(getAccuracySummary());
}
