import axios from 'axios';
import { CurrentWeather, ChartDataPoint } from '../types';

// Mocked response for current weather
export async function getCurrentWeather(): Promise<CurrentWeather> {
  // TODO: Replace with real OpenWeather API call
  // Example: 
  // const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=London&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`);
  // return mapOpenWeatherResponse(res.data);
  
  return {
    temperature: 28,
    rainChance: 35,
    humidity: 72,
    windSpeed: 12, // in km/h
    feelsLike: 26,
    condition: 'partly cloudy',
    visibility: 10,
    pressure: 101325,
    uvIndex: 6,
    dewPoint: 20,
  };
}

// Mocked response for 24-hour forecast
export async function getForecast(): Promise<ChartDataPoint[]> {
  // TODO: Replace with Visual Crossing or OpenWeather One Call API
  return [
    { time: '00:00', temperature: 23, rainProbability: 10 },
    { time: '04:00', temperature: 21, rainProbability: 15 },
    { time: '08:00', temperature: 26, rainProbability: 5 },
    { time: '12:00', temperature: 31, rainProbability: 20 },
    { time: '16:00', temperature: 29, rainProbability: 35 },
    { time: '20:00', temperature: 27, rainProbability: 45 },
    { time: '23:00', temperature: 24, rainProbability: 25 },
  ];
}
