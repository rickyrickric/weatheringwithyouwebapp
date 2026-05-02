import React, { useState, useEffect, useMemo } from 'react';
import DualAxisChart from '../components/DualAxisChart';
import DynamicBackground from '../components/DynamicBackground';
import DateAnchor from '../components/DateAnchor';
import KPIGrid from '../components/KPIGrid';
import SunshineWindow from '../components/SunshineWindow';
import { ChartSkeleton, KPISkeleton } from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';
import {
  OPTIMAL_WINDOWS,
  DEFAULT_CHART_DATA,
  MOCK_WEATHER,
  getTimeOfDay,
} from '../types/weather';
import type { ChartDataPoint, CurrentWeather } from '../types/weather';

const Forecast: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(MOCK_WEATHER);
  const [isOptimalWindow, setIsOptimalWindow] = useState(false);
  const [activeWindowIndex, setActiveWindowIndex] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [forecastDate] = useState<Date>(new Date());
  
  // QA Added: Loading and Error states
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Destructure from state instead of shared mock constants
  const {
    temperature: currentTemp,
    rainChance: currentRain,
    humidity: currentHumidity,
    windSpeed: currentWindSpeed,
    visibility,
    pressure,
    uvIndex,
    dewPoint,
  } = currentWeather;

  const sunshineWindows = [
    {
      timeWindow: '08:00 – 11:00',
      temperature: 26,
      rainChance: 5,
      condition: 'optimal' as const,
      description: 'Best window for outdoor activities',
      emoji: '☀️',
    },
    {
      timeWindow: '14:00 – 16:00',
      temperature: 29,
      rainChance: 20,
      condition: 'good' as const,
      description: 'Fair conditions for planning',
      emoji: '🌤️',
    },
    {
      timeWindow: '19:00 – 21:00',
      temperature: 26,
      rainChance: 30,
      condition: 'fair' as const,
      description: 'Evening activities possible',
      emoji: '🌆',
    },
  ];

  const getGreeting = (date: Date) => {
    const hour = date.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '🌤️ Good Afternoon';
    if (hour < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
  };

  const timeOfDay = useMemo(
    () => getTimeOfDay(forecastDate.getHours()),
    [forecastDate],
  );

  const fetchForecastData = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Fetch both APIs in parallel
      const [currentRes, forecastRes] = await Promise.all([
        fetch('/api/weather/current'),
        fetch('/api/weather/forecast')
      ]);

      if (!currentRes.ok || !forecastRes.ok) {
        throw new Error("Failed to fetch weather data");
      }

      const currentData = await currentRes.json();
      const forecastJson = await forecastRes.json();

      setCurrentWeather(currentData);
      setChartData(forecastJson.forecast || DEFAULT_CHART_DATA);
      
      const dataLoadTime = new Date();
      setLastUpdated(dataLoadTime);

      const currentHour = dataLoadTime.getHours();
      // Use optimal windows from API if available, else fallback
      const optimalWindows = forecastJson.optimalWindows || OPTIMAL_WINDOWS;

      const inOptimalWindow = optimalWindows.some(
        (w: any) => currentHour >= w.start && currentHour < w.end,
      );
      setIsOptimalWindow(inOptimalWindow);

      const activeIdx = optimalWindows.findIndex(
        (w: any) => currentHour >= w.start && currentHour < w.end,
      );
      setActiveWindowIndex(activeIdx >= 0 ? activeIdx : null);
      
    } catch (err) {
      console.error(err);
      setHasError(true);
      // Fallback data
      setChartData(DEFAULT_CHART_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecastData();
  }, []);

  return (
    <div className="relative min-h-screen page-enter">
      <DynamicBackground
        temperature={currentTemp}
        rainProbability={currentRain}
        timeOfDay={timeOfDay}
        isOptimalWindow={isOptimalWindow}
      />

      <div className="relative z-10 h-full overflow-hidden">
        {/* Header */}
        <div className="text-center py-2 px-4 prayer-header mt-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">
            {getGreeting(forecastDate)}, Tagum City
          </h1>
          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 mb-2 inline-block backdrop-blur-sm">
            <DateAnchor date={forecastDate} />
          </div>
          <p className="text-gray-400 mt-1 text-[11px] md:text-sm">
            24-hour forecast with 92% accuracy • 6-month climate baseline
          </p>
        </div>

        {/* Main container */}
        <div className="max-w-7xl mx-auto px-4 pb-24 prayer-cleared h-full overflow-hidden">
          
          {/* Feature: Rain Alert Banner */}
          {!isLoading && currentRain > 60 && !hasError && (
            <div className="bg-blue-500/20 border border-blue-500/30 text-blue-200 p-3 rounded-xl flex items-center justify-between gap-4 mb-6 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌧️</span>
                <p className="text-sm"><strong>High Rain Alert:</strong> {currentRain}% chance of precipitation. Carry an umbrella.</p>
              </div>
            </div>
          )}

          {/* Error State Banner */}
          {hasError && (
            <ErrorBanner onRetry={fetchForecastData} />
          )}

          {/* Top row: KPIs + Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start mb-6">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gray-200 uppercase tracking-widest ml-1">
                ⚡ Current Conditions
              </h3>
              {isLoading ? (
                <KPISkeleton />
              ) : (
                <KPIGrid
                  windSpeed={currentWindSpeed}
                  humidity={currentHumidity}
                  visibility={visibility ?? 10}
                  pressure={pressure ?? 101325}
                  uvIndex={uvIndex ?? 6}
                  dewPoint={dewPoint ?? 20}
                />
              )}
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <div className="glass-card-light p-4 animate-[pageEnter_0.3s_ease-out]">
                  <DualAxisChart
                    data={chartData}
                    title="Temperature & Rain Probability - 24hr Forecast"
                    currentTime={lastUpdated}
                    height={180}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Feature: Hourly Breakdown Row */}
          {!isLoading && !hasError && (
            <section className="space-y-3 mb-6 animate-[pageEnter_0.3s_ease-out]">
              <h3 className="text-base font-bold text-gray-200 uppercase tracking-widest ml-1">
                ⏱️ Hourly Breakdown
              </h3>
              <div className="flex overflow-x-auto pb-4 gap-3 snap-x scroll-smooth no-scrollbar">
                {(chartData.length > 0 ? chartData : DEFAULT_CHART_DATA).map((point, idx) => (
                  <div key={idx} className="glass-card min-w-[80px] p-3 flex flex-col items-center justify-center snap-center hover:bg-white/10 transition-colors">
                    <span className="text-xs text-gray-400 font-mono mb-2">{point.time}</span>
                    <span className="text-xl mb-2">{point.rainProbability > 50 ? '🌧️' : point.temperature > 28 ? '☀️' : '⛅'}</span>
                    <span className="text-sm font-bold text-gray-200">{Math.round(point.temperature)}°</span>
                    <span className="text-[10px] text-slate-400">{point.rainProbability}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom row: Optimal Weather Windows */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-gray-200 uppercase tracking-widest ml-1">
              ☀️ Optimal Weather Windows
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {isLoading ? (
                <>
                  <div className="glass-card h-28 animate-pulse bg-slate-700/50" />
                  <div className="glass-card h-28 animate-pulse bg-slate-700/50" />
                  <div className="glass-card h-28 animate-pulse bg-slate-700/50" />
                </>
              ) : (
                sunshineWindows.map((window, idx) => (
                  <div key={idx} className="animate-[pageEnter_0.4s_ease-out]" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <SunshineWindow
                      {...window}
                      isActive={activeWindowIndex === idx}
                    />
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
