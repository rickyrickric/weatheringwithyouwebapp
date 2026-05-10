import { useState, useCallback, useEffect, type FC } from "react";
import { useNavigate } from "react-router-dom";
import DynamicBackground from "../components/DynamicBackground";
import { useBackgroundState } from "../hooks/useBackgroundState";
import { OPTIMAL_WINDOWS, getTimeOfDay, MOCK_WEATHER } from "../types/weather";
import type { CurrentWeather } from "../types/weather";
import { WEATHER_API_BASE } from "../utils/api";
import backgroundHome from "../assets/background_home.png";

const CURRENT_WEATHER_REFRESH_MS = 5 * 60 * 1000;

const Home: FC = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [isClearing, setIsClearing] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(MOCK_WEATHER);

  const currentHour = now.getHours();
  const timeOfDay = getTimeOfDay(currentHour);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let controller = new AbortController();

    const fetchCurrentWeather = async () => {
      controller.abort();
      controller = new AbortController();

      try {
        const response = await fetch(`${WEATHER_API_BASE}/current`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Current weather request failed: ${response.status}`);
        }

        setCurrentWeather(await response.json() as CurrentWeather);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching current weather:', error);
        }
      }
    };

    void fetchCurrentWeather();
    const timer = window.setInterval(fetchCurrentWeather, CURRENT_WEATHER_REFRESH_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
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

  const handleNavigation = (label: string) => {
    setActiveTab(label);
    switch(label) {
      case "Home":
        navigate("/");
        break;
      case "Forecast":
        navigate("/forecast");
        break;
      case "Dashboard":
        navigate("/dashboard");
        break;
      case "About":
        navigate("/about");
        break;
      default:
        break;
    }
  };

  // Get dynamic text color based on background state
  const { textColorClass } = useBackgroundState(currentWeather.weatherId, currentHour);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto page-enter bg-[#121826] pb-[100px] flex flex-col items-center">
      {/* Restored background image with soft blur and dimming */}
      <div
        className="absolute inset-0 z-0 bg-center bg-cover"
        style={{
          backgroundImage: `url(${backgroundHome})`,
          filter: "brightness(0.35) blur(4px)",
          transform: "scale(1.02)",
        }}
      />

      {/* Atmospheric background — weather-reactive */}
      <DynamicBackground
        temperature={currentWeather.temperature}
        rainProbability={currentWeather.rainChance}
        timeOfDay={timeOfDay}
        isOptimalWindow={inOptimalWindow}
        transparentBase={true}
        weatherId={currentWeather.weatherId}
      />

      {/* Cloud-clearing overlay */}
      <div
        className={`fixed inset-0 z-20 bg-[#121826] pointer-events-none transition-opacity duration-700 ${
          isClearing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Content — centered, floating above background */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center py-8 transition-all duration-700 w-full flex-1 ${
          isClearing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        } ${textColorClass}`}
      >
        {/* Main Glassmorphism Dashboard Container */}
        <div
          className="home-hero-card flex flex-col items-center text-center overflow-y-auto"
          style={{
            padding: 'clamp(20px, 3.6vh, 40px) clamp(18px, 3vw, 34px)',
            maxHeight: 'calc(100vh - 120px)',
          }}
        >
          {/* Prayer hero text - Flat solid white text */}
          <div className="space-y-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-wide">
              A Prayer for
              <br />
              the Palm City
            </h1>
            <div className="location-label flex items-center justify-center gap-2 text-base md:text-lg font-normal">
              {/* Lightened pin icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Current Location: <strong className="font-semibold">Tagum City, Philippines</strong></span>
            </div>
            {/* Tagline: Single impactful line */}
            <p className="tagline max-w-lg mx-auto text-sm md:text-base font-light">
              Where weather forecasting becomes an act of connection.
            </p>
          </div>

          {/* Live micro-data teaser: Visual hierarchy — Temperature dominant, Sunshine supporting */}
          <div className="home-stat-panel flex items-center justify-center gap-8 mb-7 w-full max-w-md mx-auto">
            <div className="text-center flex-1">
              <p className="home-stat-label text-[10px] md:text-xs mb-3">Temperature</p>
              <p className="home-stat-value home-stat-value-large">
                {Math.round(currentWeather.temperature)}
                <span className="home-stat-unit text-base align-super">°C</span>
              </p>
            </div>
            <div className="home-stat-divider" />
            <div className="text-center flex-1">
              <p className="home-stat-label text-[10px] md:text-xs mb-3">Sunshine</p>
              <p className="home-stat-value home-stat-value-support">
                {sunshineProbability}
                <span className="home-stat-unit text-lg">%</span>
              </p>
              <p className="home-stat-sub text-xs mt-1">Probability</p>
            </div>
          </div>

          {/* CTA — muted orange with supporting micro-copy */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleClearSky}
              disabled={isClearing}
              className={`cta-button transition-all duration-300 ${
                isClearing
                  ? "cursor-wait scale-95 opacity-70"
                  : "hover:scale-105 active:scale-95"
              }`}
            >
              {isClearing ? "⛅ Clearing the clouds..." : "☀️ Clear the Sky"}
            </button>
            <p className="cta-hint text-xs font-medium">
              Find the next sunshine window →
            </p>
          </div>
        </div>
      </div>

      {/* Footer - Bottom of scrollable area */}
      <div className="relative z-10 text-center py-6 px-4">
        <p className="text-xs text-white font-medium tracking-wide">
          Inspired by "Tenki no Ko" — where weather forecasting becomes connection
        </p>
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {[
          { label: "Home", icon: "🏠" },
          { label: "Forecast", icon: "☁️" },
          { label: "Dashboard", icon: "📊" },
          { label: "About", icon: "ℹ️" },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={() => handleNavigation(tab.label)}
            className={`nav-tab ${activeTab === tab.label ? 'active' : ''}`}
          >
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Home;
