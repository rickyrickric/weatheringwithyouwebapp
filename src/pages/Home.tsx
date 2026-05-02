import { useState, useCallback, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import DynamicBackground from "../components/DynamicBackground";
import GlassCard from "../components/GlassCard";
import { OPTIMAL_WINDOWS, getTimeOfDay, MOCK_WEATHER } from "../types/weather";
import type { CurrentWeather } from "../types/weather";

const Home: FC = () => {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(MOCK_WEATHER);

  const currentHour = new Date().getHours();
  const timeOfDay = getTimeOfDay(currentHour);

  useEffect(() => {
    fetch('/api/weather/current')
      .then(res => res.json())
      .then(data => setCurrentWeather(data))
      .catch(err => console.error('Error fetching current weather:', err));
  }, []);

  // Calculate sunshine probability from optimal windows
  const inOptimalWindow = OPTIMAL_WINDOWS.some(
    (w) => currentHour >= w.start && currentHour < w.end,
  );
  const sunshineProbability = inOptimalWindow ? 85 : 42;

  // Cloud-clearing animation → then navigate to forecast
  const handleClearSky = useCallback(async () => {
    setIsClearing(true);
    await new Promise((resolve) => setTimeout(resolve, 1400));
    navigate("/forecast");
  }, [navigate]);

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden page-enter">
      {/* Atmospheric background — weather-reactive */}
      <DynamicBackground
        temperature={currentWeather.temperature}
        rainProbability={currentWeather.rainChance}
        timeOfDay={timeOfDay}
        isOptimalWindow={inOptimalWindow}
      />

      {/* Cloud-clearing overlay */}
      <div
        className={`fixed inset-0 z-20 bg-[#121826] pointer-events-none transition-opacity duration-700 ${
          isClearing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Content — centered, floating above background */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-700 ${
          isClearing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Prayer hero text - Flat solid white text (QA Fix) */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 leading-tight">
            A Prayer for
            <br />
            the Palm City
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span>📍</span>
            <span>Current Location: <strong className="text-gray-200">Tagum City, Philippines</strong></span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Where weather forecasting transcends meteorology and becomes an act of connection, sacrifice, and hope.
          </p>
        </div>

        {/* Live micro-data teaser card */}
        <GlassCard className="px-8 py-5 mb-8 bg-white/5 backdrop-blur-xl border-white/10 max-w-xs">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Temperature</p>
              <p className="text-3xl font-bold text-openweather-primary">{Math.round(currentWeather.temperature)}°</p>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Sunshine</p>
              <p className="text-3xl font-bold text-gray-300">{sunshineProbability}%</p>
            </div>
          </div>
        </GlassCard>

        {/* CTA — muted orange without excessive drop-shadows (QA Fix) */}
        <button
          onClick={handleClearSky}
          disabled={isClearing}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
            isClearing
              ? "bg-[#D4622A] text-white cursor-wait scale-95 opacity-50"
              : "bg-[#D4622A] hover:bg-orange-700 text-white cursor-pointer hover:scale-105 active:scale-95 shadow-md"
          }`}
        >
          {isClearing ? "⛅ Clearing the clouds..." : "☀️ Clear the Sky"}
        </button>

        <p className="text-xs text-gray-500 mt-6">
          Inspired by "Tenki no Ko" — where weather forecasting becomes connection
        </p>
      </div>
    </div>
  );
};

export default Home;
