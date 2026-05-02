import { useState, useCallback, type FC } from "react";
import { useNavigate } from "react-router-dom";
import DynamicBackground from "../components/DynamicBackground";
import GlassCard from "../components/GlassCard";
import { MOCK_WEATHER, OPTIMAL_WINDOWS, getTimeOfDay } from "../types/weather";

const Home: FC = () => {
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const currentHour = new Date().getHours();
  const timeOfDay = getTimeOfDay(currentHour);

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
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden">
      {/* Atmospheric background — weather-reactive */}
      <DynamicBackground
        temperature={MOCK_WEATHER.temperature}
        rainProbability={MOCK_WEATHER.rainChance}
        timeOfDay={timeOfDay}
        isOptimalWindow={inOptimalWindow}
      />

      {/* Cloud-clearing overlay */}
      <div
        className={`fixed inset-0 z-20 bg-white pointer-events-none transition-opacity duration-700 ${
          isClearing ? "opacity-60" : "opacity-0"
        }`}
      />

      {/* Content — centered, floating above background */}
      <div
        className={`relative z-10 flex flex-col items-center text-center px-6 transition-all duration-700 ${
          isClearing ? "scale-95 opacity-0 blur-lg" : "scale-100 opacity-100 blur-0"
        }`}
      >
        {/* Prayer hero text */}
        <div className="space-y-4 mb-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg leading-tight">
            <span className="bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              A Prayer for
            </span>
            <br />
            <span className="text-white">the Palm City</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-300 text-base">
            <span className="text-orange-400">📍</span>
            <span>Current Location: <strong className="text-white">Tagum City, Philippines</strong></span>
          </div>
          <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
            Where weather forecasting transcends meteorology and becomes an act of connection, sacrifice, and hope.
          </p>
        </div>

        {/* Live micro-data teaser card */}
        <GlassCard className="px-8 py-5 mb-8 bg-white/5 backdrop-blur-xl border-white/15 max-w-xs">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Temperature</p>
              <p className="text-3xl font-bold text-orange-300">{MOCK_WEATHER.temperature}°</p>
            </div>
            <div className="w-px h-12 bg-white/15" />
            <div className="text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-1">Sunshine</p>
              <p className="text-3xl font-bold text-yellow-300">{sunshineProbability}%</p>
            </div>
          </div>
        </GlassCard>

        {/* CTA — sunset orange with cloud-clearing animation */}
        <button
          onClick={handleClearSky}
          disabled={isClearing}
          className={`px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
            isClearing
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white cursor-wait scale-95"
              : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white cursor-pointer hover:scale-105 active:scale-95"
          } shadow-lg hover:shadow-orange-500/40 drop-shadow-xl`}
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
