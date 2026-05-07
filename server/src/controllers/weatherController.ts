import { Request, Response } from 'express';
import { getAccuracySummary } from '../services/accuracyService';
import { applyRegression } from '../services/mlService';
import { computeOptimalWindows, computeSunshineWindows } from '../services/sunshineWindowService';
import { tryStoreDailyForecast, tryStoreDailyObservation } from '../services/supabaseService';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { ForecastResponse } from '../types';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const sendWeatherError = (res: Response, error: unknown, publicMessage: string) => {
  const payload: { error: string; details?: string } = { error: publicMessage };

  if (process.env.NODE_ENV !== 'production') {
    payload.details = getErrorMessage(error);
  }

  res.status(500).json(payload);
};

export async function getCurrent(req: Request, res: Response) {
  try {
    const weather = await getCurrentWeather();
    await tryStoreDailyObservation(weather);
    res.json(weather);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    sendWeatherError(res, error, 'Failed to fetch current weather');
  }
}

export async function getForecastData(req: Request, res: Response) {
  try {
    const rawData = await getForecast();
    const smoothedData = applyRegression(rawData, 3);
    const sunshineWindows = computeSunshineWindows(smoothedData);

    const response: ForecastResponse = {
      generatedAt: new Date().toISOString(),
      source: 'openweather',
      forecast: smoothedData,
      optimalWindows: computeOptimalWindows(sunshineWindows),
      sunshineWindows,
      accuracy: getAccuracySummary(),
    };

    await tryStoreDailyForecast(response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching forecast:', error);
    sendWeatherError(res, error, 'Failed to fetch forecast data');
  }
}

export async function getSunshineWindows(req: Request, res: Response) {
  try {
    const rawData = await getForecast();
    const smoothedData = applyRegression(rawData, 3);

    res.json({
      generatedAt: new Date().toISOString(),
      sunshineWindows: computeSunshineWindows(smoothedData),
    });
  } catch (error) {
    console.error('Error computing sunshine windows:', error);
    sendWeatherError(res, error, 'Failed to compute sunshine windows');
  }
}

export function getAccuracy(req: Request, res: Response) {
  res.json(getAccuracySummary());
}
