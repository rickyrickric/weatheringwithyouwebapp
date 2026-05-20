import { NextFunction, Request, Response } from 'express';
import { LocationQuery } from '../middleware/validateRequest';
import { FORECAST_SOURCE_LABEL, getAccuracySummary } from '../services/accuracyService';
import { applyRegression, blendedRegression } from '../services/mlService';
import { computeOptimalWindows, computeSunshineWindows } from '../services/sunshineWindowService';
import {
  tryGetClimatology90d,
  tryStoreDailyForecast,
  tryStoreDailyObservation,
} from '../services/supabaseService';
import {
  getCurrentWeatherResult,
  getForecastBundle,
  getForecastResult,
} from '../services/weatherService';
import { ForecastResponse } from '../types';

const getLocationQuery = (req: Request) => req.query as LocationQuery;

export async function getCurrent(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getCurrentWeatherResult(getLocationQuery(req));
    if (result.providerStatus === 'live') {
      await tryStoreDailyObservation(result.weather);
    }
    res.json(result.weather);
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
      source: forecastBundle.providerStatus === 'synced' ? 'supabase-sync' : 'openweather',
      forecast: smoothedData,
      climatology: regression.blendInfo.climatologyUsed ? { hourly: climatology } : undefined,
      blendInfo: regression.blendInfo,
      optimalWindows: computeOptimalWindows(sunshineWindows),
      sunshineWindows,
      accuracy: getAccuracySummary(),
      dailyOutlook: forecastBundle.dailyOutlook,
      alerts: forecastBundle.alerts,
      sourceConfidence: {
        label:
          forecastBundle.providerStatus === 'synced'
            ? 'Forecast restored from cloud sync while OpenWeather is unavailable'
            : FORECAST_SOURCE_LABEL,
        value: forecastBundle.providerStatus === 'synced' ? 'Medium' : 'High',
      },
    };

    if (forecastBundle.providerStatus === 'live') {
      await tryStoreDailyForecast(response);
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
}

export async function getAdvisories(req: Request, res: Response, next: NextFunction) {
  try {
    const forecastBundle = await getForecastBundle(getLocationQuery(req), { bypassCache: true });

    res.json({
      generatedAt: new Date().toISOString(),
      source: forecastBundle.providerStatus === 'synced' ? 'supabase-sync' : 'openweather',
      alerts: forecastBundle.alerts,
    });
  } catch (error) {
    next(error);
  }
}

export async function getSunshineWindows(req: Request, res: Response, next: NextFunction) {
  try {
    const forecastResult = await getForecastResult(getLocationQuery(req));
    const rawData = forecastResult.forecast;
    const smoothedData = applyRegression(rawData, 3);

    res.json({
      generatedAt: new Date().toISOString(),
      source: forecastResult.providerStatus === 'synced' ? 'supabase-sync' : 'openweather',
      sunshineWindows: computeSunshineWindows(smoothedData),
    });
  } catch (error) {
    next(error);
  }
}

export function getAccuracy(req: Request, res: Response) {
  res.json(getAccuracySummary());
}
