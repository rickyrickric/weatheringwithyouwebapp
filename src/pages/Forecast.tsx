import React, { useState, useEffect } from 'react';
import DualAxisChart from '../components/DualAxisChart';
import DynamicBackground from '../components/DynamicBackground';
import DateAnchor from '../components/DateAnchor';
import KPIGrid from '../components/KPIGrid';

interface ChartDataPoint {
  time: string;
  temperature: number;
  rainProbability: number;
}

const Forecast: React.FC = () => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isOptimalWindow, setIsOptimalWindow] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [forecastDate] = useState<Date>(new Date());
  const currentTemp = 28;
  const currentRain = 35;
  const currentHumidity = 72;
  const currentWindSpeed = 12;

  // Dynamic greeting based on time of day
  const getGreeting = (date: Date) => {
    const hour = date.getHours();
    if (hour < 12) return '🌅 Good Morning';
    if (hour < 17) return '🌤️ Good Afternoon';
    if (hour < 21) return '🌆 Good Evening';
    return '🌙 Good Night';
  };

  // Optimal windows configuration
  const optimalWindows = [
    { start: 8, end: 11 },   // 08:00 - 11:00
    { start: 14, end: 16 },  // 14:00 - 16:00
    { start: 19, end: 21 },  // 19:00 - 21:00
  ];

  useEffect(() => {
    // Record timestamp when data is loaded
    const dataLoadTime = new Date();
    setLastUpdated(dataLoadTime);

    const mockData: ChartDataPoint[] = [
      { time: '00:00', temperature: 24, rainProbability: 10 },
      { time: '04:00', temperature: 22, rainProbability: 15 },
      { time: '08:00', temperature: 26, rainProbability: 5 },
      { time: '12:00', temperature: 31, rainProbability: 20 },
      { time: '16:00', temperature: 29, rainProbability: 35 },
      { time: '20:00', temperature: 27, rainProbability: 45 },
      { time: 'Midnight', temperature: 25, rainProbability: 25 },
    ];
    setChartData(mockData);

    // Check if current time falls within an optimal window
    const currentHour = dataLoadTime.getHours();
    const inOptimalWindow = optimalWindows.some(
      (window) => currentHour >= window.start && currentHour < window.end
    );
    setIsOptimalWindow(inOptimalWindow);
  }, []);

  return (
    <div className="relative min-h-screen">
      <style>{`
        @keyframes prayerClear {
          0% {
            opacity: 0;
            filter: blur(20px);
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            filter: blur(10px);
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }
        
        @keyframes prayerGlow {
          0% {
            box-shadow: 0 0 0px rgba(249, 115, 22, 0);
          }
          50% {
            box-shadow: 0 0 40px rgba(249, 115, 22, 0.3);
          }
          100% {
            box-shadow: 0 0 0px rgba(249, 115, 22, 0);
          }
        }
        
        .prayer-cleared {
          animation: prayerClear 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        .prayer-header {
          animation: prayerGlow 3s ease-out;
        }
      `}</style>
      
      {/* Dynamic Background */}
      <DynamicBackground
        temperature={currentTemp}
        rainProbability={currentRain}
        timeOfDay="afternoon"
        isOptimalWindow={isOptimalWindow}
      />

      {/* Content */}
      <div className="relative z-10 h-full overflow-hidden">
        {/* Header */}
        <div className="text-center py-2 px-4 prayer-header">
          <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-cyan-300 mb-2">
            {getGreeting(forecastDate)}, Tagum City
          </h1>
          {/* Enhanced Date Anchor - Higher Visual Prominence */}
          <div className="bg-gradient-to-r from-orange-500/20 to-cyan-500/20 border border-orange-400/30 rounded-xl px-3 py-1.5 mb-2 inline-block backdrop-blur-sm">
            <DateAnchor date={forecastDate} />
          </div>
          <p className="text-gray-400 mt-1 text-[11px] md:text-sm">24-hour forecast with 92% accuracy • 6-month climate baseline</p>
        </div>

        {/* Main container - trimmed to fit within the fixed viewport */}
        <div className="max-w-7xl mx-auto px-4 pb-24 space-y-4 prayer-cleared h-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <div className="space-y-3" style={{ willChange: 'transform' }}>
              <h3 className="text-lg font-bold text-openweather-primary uppercase tracking-widest">
                ⚡ Current Conditions
              </h3>
              <KPIGrid
                windSpeed={currentWindSpeed}
                humidity={currentHumidity}
                visibility={10}
                pressure={101325}
                uvIndex={6}
                dewPoint={20}
              />
            </div>

            <div className="space-y-2" style={{ willChange: 'transform' }}>
              <div className="glass-card-light p-4">
                <DualAxisChart
                  data={chartData}
                  title="Temperature & Rain Probability - 24hr Forecast"
                  currentTime={lastUpdated}
                  height={160}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forecast;
