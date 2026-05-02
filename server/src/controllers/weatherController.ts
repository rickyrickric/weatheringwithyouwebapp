import { Request, Response } from 'express';
import { getCurrentWeather, getForecast } from '../services/weatherService';
import { applyRegression } from '../services/mlService';
import { OptimalWindow } from '../types';

export async function getCurrent(req: Request, res: Response) {
  try {
    const weather = await getCurrentWeather();
    res.json(weather);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ error: 'Failed to fetch current weather' });
  }
}

export async function getForecastData(req: Request, res: Response) {
  try {
    const rawData = await getForecast();
    // Apply degree-3 polynomial regression to smooth data
    const smoothedData = applyRegression(rawData, 3);
    
    // Shared optimal time windows used by Forecast and other pages
    const OPTIMAL_WINDOWS: OptimalWindow[] = [
      { start: 8, end: 11 },   // 08:00 – 11:00
      { start: 14, end: 16 },  // 14:00 – 16:00
      { start: 19, end: 21 },  // 19:00 – 21:00
    ];

    res.json({
      forecast: smoothedData,
      optimalWindows: OPTIMAL_WINDOWS
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
}
