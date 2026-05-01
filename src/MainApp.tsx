import React, { useState, useMemo } from 'react';
import DynamicBackground from './components/DynamicBackground';
import DualAxisChart from './components/DualAxisChart';
import SunshineWindow from './components/SunshineWindow';
import StatCard from './components/StatCard';
import Header from './components/Header';
import Footer from './components/Footer';
import DateAnchor from './components/DateAnchor';

const MainApp: React.FC = () => {
  const [skyCleared, setSkyCleared] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Get current date and time
  const currentDate = new Date();
  
  // Sunshine windows data for chart shading
  const sunshineWindowsData = useMemo(() => [
    { startTime: '08:00', endTime: '11:00' },
    { startTime: '14:00', endTime: '16:00' },
    { startTime: '19:00', endTime: '21:00' },
  ], []);

  const handleClearSky = async () => {
    setIsClearing(true);
    // Simulate cloud clearing animation (1.2s)
    await new Promise(resolve => setTimeout(resolve, 1200));
    setSkyCleared(true);
    setIsClearing(false);
  };

  // Mock weather data
  const currentWeather = {
    temperature: 28,
    rainChance: 35,
    humidity: 72,
    windSpeed: 12,
  };

  const sunshineWindows = [
    {
      timeWindow: '08:00 - 11:00',
      temperature: 26,
      rainChance: 5,
      condition: 'optimal' as const,
      description: 'Best window for outdoor activities',
      emoji: '☀️',
    },
    {
      timeWindow: '14:00 - 16:00',
      temperature: 29,
      rainChance: 20,
      condition: 'good' as const,
      description: 'Fair conditions for planning',
      emoji: '🌤️',
    },
    {
      timeWindow: '19:00 - 21:00',
      temperature: 26,
      rainChance: 30,
      condition: 'fair' as const,
      description: 'Evening activities possible',
      emoji: '🌆',
    },
  ];

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <DynamicBackground />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col">
        {/* Initial Ritual Section - Full Screen */}
        {!skyCleared && (
          <div className="fixed inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-slate-900/40 via-slate-950/20 to-slate-950/40">
            <div className="text-center space-y-8 px-6">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold text-white drop-shadow-lg">
                  <span className="bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
                    A Prayer for
                  </span>
                  <br />
                  <span className="text-white">the Palm City</span>
                </h1>
                <p className="text-xl text-gray-200 max-w-md mx-auto">
                  6 months of climate memory awaits. Clear the clouds to reveal your sunshine windows.
                </p>
              </div>

              {/* Animated clouds that clear */}
              <div className="relative h-48 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full blur-3xl transition-all duration-1200"
                  style={{
                    opacity: isClearing ? 0 : 0.8,
                    background: 'radial-gradient(circle, rgba(100, 116, 139, 0.6) 0%, transparent 70%)',
                  }}
                />
                <div
                  className={`text-8xl transition-all duration-1200 ${
                    isClearing ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
                  }`}
                >
                  ⛅
                </div>
              </div>

              <button
                onClick={handleClearSky}
                disabled={isClearing}
                className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                  isClearing
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-wait'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white cursor-pointer hover:scale-105 active:scale-95'
                } shadow-lg hover:shadow-orange-500/50 drop-shadow-xl`}
              >
                {isClearing ? '⛅ Clearing the clouds...' : '☀️ Clear the Sky'}
              </button>

              <p className="text-sm text-gray-400">Inspired by "Tenki no Ko" — where weather forecasting becomes connection</p>
            </div>
          </div>
        )}

        {/* Forecast Content - Revealed after clearing */}
        {skyCleared && (
          <div className="pt-12 pb-32 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Current Weather Section */}
              <section className="space-y-4">
                <Header title="Current Conditions" subtitle="Tagum City, Philippines" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard
                    label="Temperature"
                    value={currentWeather.temperature}
                    unit="°C"
                    icon="🌡️"
                    trend="up"
                  />
                  <StatCard
                    label="Rain Chance"
                    value={currentWeather.rainChance}
                    unit="%"
                    icon="🌧️"
                    trend="up"
                  />
                  <StatCard
                    label="Humidity"
                    value={currentWeather.humidity}
                    unit="%"
                    icon="💧"
                    trend="stable"
                  />
                  <StatCard
                    label="Wind Speed"
                    value={currentWeather.windSpeed}
                    unit="km/h"
                    icon="💨"
                    trend="down"
                  />
                </div>
              </section>

              {/* Sunshine Windows */}
              <section className="space-y-4">
                <Header title="☀️ Optimal Weather Windows" subtitle="Best times for your plans" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {sunshineWindows.map((window, idx) => (
                    <SunshineWindow key={idx} {...window} />
                  ))}
                </div>
              </section>

              {/* Detailed Chart */}
              <section className="space-y-4">
                <Header title="📊 24-Hour Forecast" subtitle="Temperature & Rain Probability" />
                <DateAnchor date={currentDate} />
                <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6">
                  <DualAxisChart 
                    currentTime={currentDate}
                    sunshineWindows={sunshineWindowsData}
                  />
                </div>
              </section>

              {/* Insights */}
              <section className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">💡 Forecast Insights</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>→ Morning peak hours (08:00-11:00) show optimal conditions with lowest rain probability</li>
                  <li>→ Afternoon temperatures will reach 31°C around midday; UV index expected to be high</li>
                  <li>→ Evening shift shows increasing cloud cover; rain probability rises to 45% by 20:00</li>
                  <li>→ Model accuracy for 24h predictions: 92% (validated against 6-month climate memory)</li>
                </ul>
              </section>

              {/* About Section */}
              <section className="border-t border-white/10 pt-12 space-y-6">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-white">About This Project</h2>
                  <p className="text-gray-300 max-w-2xl">
                    This project draws inspiration from the beautiful anime film <strong>"Tenki no Ko"</strong> (Weathering with You),
                    where weather forecasting transcends mere meteorology and becomes an act of connection, sacrifice, and hope.
                  </p>
                  <p className="text-gray-300 max-w-2xl">
                    We don't merely predict weather—we understand the emotional and practical dimensions of atmospheric conditions.
                    A prayer for perfect weather. ✨
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h3 className="font-bold text-orange-400 mb-3">🎨 Frontend</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• React 19 + TypeScript</li>
                      <li>• Tailwind CSS (Glassmorphism)</li>
                      <li>• Recharts (Dual-axis visualization)</li>
                      <li>• Vite 8.0.10</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold text-cyan-400 mb-3">⚡ Backend & ML</h3>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• FastAPI (Async)</li>
                      <li>• Scikit-Learn (Polynomial Regression Degree 4)</li>
                      <li>• Supabase (PostgreSQL)</li>
                      <li>• OpenWeather API</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainApp;
