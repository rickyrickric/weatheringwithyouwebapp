import React, { useState, useEffect, useMemo } from 'react';
import DualAxisChart from '../components/DualAxisChart';
import DynamicBackground from '../components/DynamicBackground';
import DateAnchor from '../components/DateAnchor';
import KPIGrid from '../components/KPIGrid';
import SunshineWindow from '../components/SunshineWindow';
import {
  OPTIMAL_WINDOWS,
  DEFAULT_CHART_DATA,
  MOCK_WEATHER,
  getTimeOfDay,
} from '../types/weather';
import type { ChartDataPoint } from '../types/weather';

const Forecast: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isOptimalWindow, setIsOptimalWindow] = useState(false);
  const [activeWindowIndex, setActiveWindowIndex] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [forecastDate] = useState<Date>(new Date());

  // Destructure from shared mock constants
  const {
    temperature: currentTemp,
    rainChance: currentRain,
    humidity: currentHumidity,
    windSpeed: currentWindSpeed,
    visibility,
    pressure,
    uvIndex,
    dewPoint,
  } = MOCK_WEATHER;

  // Optimal sunshine windows data for the cards
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

  // Dynamic greeting based on time of day
  const getGreeting = (date: Date) => {
    const hour = date.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '🌤️ Good Afternoon';
    if (hour < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
  };

  // Derive time-of-day label from the real current hour
  const timeOfDay = useMemo(
    () => getTimeOfDay(forecastDate.getHours()),
    [forecastDate],
  );

  useEffect(() => {
    const dataLoadTime = new Date();
    setLastUpdated(dataLoadTime);
    setChartData(DEFAULT_CHART_DATA);

    // Check if current time falls within an optimal window
    const currentHour = dataLoadTime.getHours();
    const inOptimalWindow = OPTIMAL_WINDOWS.some(
      (w) => currentHour >= w.start && currentHour < w.end,
    );
    setIsOptimalWindow(inOptimalWindow);

    // Determine which window card is currently active
    const activeIdx = OPTIMAL_WINDOWS.findIndex(
      (w) => currentHour >= w.start && currentHour < w.end,
    );
    setActiveWindowIndex(activeIdx >= 0 ? activeIdx : null);
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <DynamicBackground
        temperature={currentTemp}
        rainProbability={currentRain}
        timeOfDay={timeOfDay}
        isOptimalWindow={isOptimalWindow}
      />

      {/* Content */}
      <div className="relative z-10 h-full overflow-hidden">
        {/* Header */}
        <div className="text-center py-2 px-4 prayer-header">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-cyan-300 mb-2">
            {getGreeting(forecastDate)}, Tagum City
          </h1>
          {/* Enhanced Date Anchor */}
          <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border border-orange-400/30 rounded-xl px-3 py-1.5 mb-2 inline-block backdrop-blur-sm">
            <DateAnchor date={forecastDate} />
          </div>
          <p className="text-gray-400 mt-1 text-[11px] md:text-sm">
            24-hour forecast with 92% accuracy • 6-month climate baseline
          </p>
        </div>

        {/* Main container */}
        <div className="max-w-7xl mx-auto px-4 pb-24 prayer-cleared h-full overflow-hidden">
          {/* Top row: KPIs + Chart — side-by-side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start mb-6">
            <div className="space-y-3" style={{ willChange: 'transform' }}>
              <h3 className="text-base font-bold text-openweather-primary uppercase tracking-widest ml-1">
                ⚡ Current Conditions
              </h3>
              <KPIGrid
                windSpeed={currentWindSpeed}
                humidity={currentHumidity}
                visibility={visibility ?? 10}
                pressure={pressure ?? 101325}
                uvIndex={uvIndex ?? 6}
                dewPoint={dewPoint ?? 20}
              />
            </div>

            <div className="space-y-2" style={{ willChange: 'transform' }}>
              <div className="glass-card-light p-4">
                <DualAxisChart
                  data={chartData}
                  title="Temperature & Rain Probability - 24hr Forecast"
                  currentTime={lastUpdated}
                  height={180}
                />
              </div>
            </div>
          </div>

          {/* Bottom row: Optimal Weather Windows — fills the dead zone */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 uppercase tracking-widest ml-1">
              ☀️ Optimal Weather Windows
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sunshineWindows.map((window, idx) => (
                <SunshineWindow
                  key={idx}
                  {...window}
                  isActive={activeWindowIndex === idx}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
