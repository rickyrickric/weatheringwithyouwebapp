import { useState, useCallback, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import DynamicBackground from "../components/DynamicBackground";
import GlassCard from "../components/GlassCard";
import { OPTIMAL_WINDOWS, getTimeOfDay, MOCK_WEATHER } from "../types/weather";
import type { CurrentWeather } from "../types/weather";
import backgroundHome from "../assets/background_home.png";

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
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden page-enter bg-[#121826]">
      {/* Home Image Background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundHome})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom', // ensures bottom watermark is visible
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Vignette effect: Dark gradient overlay to ground the footer and ensure text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#0a0f18] via-[#121826]/50 to-transparent pointer-events-none" />

      {/* Atmospheric background — weather-reactive */}
      <DynamicBackground
        temperature={currentWeather.temperature}
        rainProbability={currentWeather.rainChance}
        timeOfDay={timeOfDay}
        isOptimalWindow={inOptimalWindow}
        transparentBase={true}
      />

      {/* Cloud-clearing overlay */}
      <div
        className={`fixed inset-0 z-20 bg-[#121826] pointer-events-none transition-opacity duration-700 ${
          isClearing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Content — centered, floating above background */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-4xl transition-all duration-700 h-full ${
          isClearing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Main Glassmorphism Dashboard Container */}
        <div className="flex flex-col items-center text-center p-8 md:p-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl w-full shadow-2xl">
          {/* Prayer hero text - Flat solid white text */}
          <div className="space-y-4 mb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-wide">
              A Prayer for
              <br />
              the Palm City
            </h1>
            <div className="flex items-center justify-center gap-2 text-gray-300 text-sm md:text-base font-light">
              {/* Lightened pin icon */}
              <svg className="w-4 h-4 text-gray-400 stroke-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Current Location: <strong className="text-white font-medium">Tagum City, Philippines</strong></span>
            </div>
            {/* Shortened concise description */}
            <p className="text-gray-300 max-w-lg mx-auto text-sm md:text-base font-light leading-relaxed mt-2">
              Where weather forecasting becomes an act of connection, sacrifice, and hope.
            </p>
          </div>

          {/* Live micro-data teaser card (flattened inside the main container) */}
          <div className="flex items-center justify-center gap-10 mb-10 w-full max-w-md mx-auto py-6 bg-white/5 rounded-2xl border border-white/5">
            <div className="text-center w-1/2">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold mb-2">Temperature</p>
              <p className="text-4xl font-bold text-white">{Math.round(currentWeather.temperature)}°C</p>
            </div>
            <div className="w-px h-16 bg-white/10" />
            <div className="text-center w-1/2">
              <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.2em] font-semibold mb-2">Sunshine</p>
              <p className="text-4xl font-bold text-white">{sunshineProbability}%</p>
            </div>
          </div>

          {/* CTA — muted orange */}
          <button
            onClick={handleClearSky}
            disabled={isClearing}
            className={`px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
              isClearing
                ? "bg-[#D4622A] text-white cursor-wait scale-95 opacity-50"
                : "bg-[#D4622A] hover:bg-[#b05223] text-white shadow-lg shadow-orange-900/20 hover:scale-105 active:scale-95"
            }`}
          >
            {isClearing ? "⛅ Clearing the clouds..." : "☀️ Clear the Sky"}
          </button>
        </div>

        {/* Footer - Moved outside the glass container, positioned against the vignette */}
        <div className="absolute bottom-6 left-0 w-full text-center">
          <p className="text-xs text-white font-medium tracking-wide">
            Inspired by "Tenki no Ko" — where weather forecasting becomes connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
