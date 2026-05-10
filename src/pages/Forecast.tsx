import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HourlyForecastStrip from "../components/HourlyForecastStrip";
import { MOCK_WEATHER } from "../types/weather";
import type { AccuracySummary, CurrentWeather, ForecastResponse } from "../types/weather";
import { WEATHER_API_BASE } from "../utils/api";
import { getWeatherHeroImage } from "../utils/weatherHeroImage";

const CURRENT_WEATHER_REFRESH_MS = 5 * 60 * 1000;
const FORECAST_REFRESH_MS = 10 * 60 * 1000;

const forecastData = [
  { time: "00:00", temp: 24, rain: 3 },
  { time: "02:00", temp: 23, rain: 4 },
  { time: "04:00", temp: 22, rain: 5 },
  { time: "06:00", temp: 23, rain: 6 },
  { time: "08:00", temp: 25, rain: 8 },
  { time: "10:00", temp: 27, rain: 12 },
  { time: "12:00", temp: 29, rain: 18 },
  { time: "14:00", temp: 29, rain: 22 },
  { time: "16:00", temp: 28, rain: 25 },
  { time: "18:00", temp: 27, rain: 28 },
  { time: "20:00", temp: 26, rain: 30 },
  { time: "23:00", temp: 25, rain: 25 },
];

const windows = [
  { label: "Morning", time: "06:00–09:00", activity: "Outdoor exercise", icon: "☀️", temp: 26, rain: 5, badge: "OPTIMAL", badgeColor: "#e07b39" },
  { label: "Midday", time: "11:00–13:00", activity: "Outdoor planning", icon: "🌤️", temp: 29, rain: 20, badge: "GOOD", badgeColor: "#4a9a6a" },
  { label: "Afternoon", time: "15:00–17:00", activity: "Possible showers", icon: "🌦️", temp: 26, rain: 30, badge: "FAIR", badgeColor: "#7a6ab0" },
];

const fallbackAccuracy: AccuracySummary = {
  value: null,
  label: "Pending historical dataset",
  sampleSize: 0,
  status: "pending-dataset",
};

const formatMetricValue = (
  value: number | null | undefined,
  options: { divisor?: number; fallback?: string } = {},
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return options.fallback ?? "NaN";
  }

  const normalizedValue = value / (options.divisor ?? 1);
  return Math.round(normalizedValue).toString();
};

export default function WeatherDashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Forecast");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(MOCK_WEATHER);
  const [hasLiveCurrentWeather, setHasLiveCurrentWeather] = useState(false);
  const [chartData, setChartData] = useState(forecastData);
  const [weatherWindows, setWeatherWindows] = useState(windows);
  const [accuracy, setAccuracy] = useState<AccuracySummary>(fallbackAccuracy);
  const [visibleHeroImage, setVisibleHeroImage] = useState(() =>
    getWeatherHeroImage(MOCK_WEATHER.condition, MOCK_WEATHER.weatherId).src,
  );
  const [previousHeroImage, setPreviousHeroImage] = useState<string | null>(null);

  const weatherHeroImage = getWeatherHeroImage(
    currentWeather.condition,
    currentWeather.weatherId,
    now.getHours(),
  );

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
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
        setHasLiveCurrentWeather(true);
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

  useEffect(() => {
    let controller = new AbortController();

    const fetchForecast = async () => {
      controller.abort();
      controller = new AbortController();

      try {
        const response = await fetch(`${WEATHER_API_BASE}/forecast/24h`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Forecast request failed: ${response.status}`);
        }

        const data = await response.json() as ForecastResponse;
        if (data.forecast.length > 0) {
          setChartData(data.forecast.map((point) => ({
            time: point.time,
            temp: point.temperature,
            rain: point.rainProbability,
          })));
        }

        if (data.sunshineWindows.length > 0) {
          setWeatherWindows(data.sunshineWindows);
        }

        setAccuracy(data.accuracy);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching forecast data:', error);
        }
      }
    };

    void fetchForecast();
    const timer = window.setInterval(fetchForecast, FORECAST_REFRESH_MS);

    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (weatherHeroImage.src === visibleHeroImage) return;

    const transitionStart = window.setTimeout(() => {
      setPreviousHeroImage(visibleHeroImage);
      setVisibleHeroImage(weatherHeroImage.src);
    }, 0);

    const transitionEnd = window.setTimeout(() => {
      setPreviousHeroImage(null);
    }, 650);

    return () => {
      window.clearTimeout(transitionStart);
      window.clearTimeout(transitionEnd);
    };
  }, [visibleHeroImage, weatherHeroImage.src]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return { text: "Good Morning", icon: "🌅" };
    if (h < 18) return { text: "Good Afternoon", icon: "🌤️" };
    return { text: "Good Evening", icon: "🌙" };
  };

  const { text: greetText, icon: greetIcon } = greeting();

  const dateStr = now.toLocaleDateString("en-PH", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  const timeStr = now.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" });
  const conditionLabel = currentWeather.condition
    ? currentWeather.condition.replace(/\b\w/g, (char) => char.toUpperCase())
    : weatherHeroImage.kind.replace(/\b\w/g, (char) => char.toUpperCase());
  const accuracyLabel = accuracy.value === null
    ? accuracy.label
    : `${accuracy.value}% accuracy`;
  const pressureDivisor = typeof currentWeather.pressure === "number" && currentWeather.pressure > 2000 ? 100 : 1;
  const conditionMetrics = [
    {
      icon: "💨",
      label: "Wind Speed",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.windSpeed : undefined),
      unit: "km/h",
    },
    {
      icon: "💧",
      label: "Humidity",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.humidity : undefined),
      unit: "%",
    },
    {
      icon: "👁️",
      label: "Visibility",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.visibility : undefined),
      unit: "km",
    },
    {
      icon: "🌡️",
      label: "Pressure",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.pressure : undefined, { divisor: pressureDivisor }),
      unit: "hPa",
    },
    {
      icon: "☀️",
      label: "UV Index",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.uvIndex : undefined),
      unit: "UV",
    },
    {
      icon: "❄️",
      label: "Dew Point",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.dewPoint : undefined),
      unit: "°C",
    },
  ];

  return (
    <div className="forecast-scroll-root forecast-page">
      {previousHeroImage && (
        <div
          key={`previous-${previousHeroImage}`}
          className="forecast-weather-image forecast-weather-image-out"
          style={{ backgroundImage: `url(${previousHeroImage})` }}
          aria-hidden="true"
        />
      )}
      <div
        key={visibleHeroImage}
        className={`forecast-weather-image forecast-weather-image-in forecast-weather-${weatherHeroImage.kind}`}
        style={{ backgroundImage: `url(${visibleHeroImage})` }}
        aria-hidden="true"
      />
      <div className="forecast-weather-scrim" aria-hidden="true" />

      {/* Background overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "linear-gradient(160deg, rgba(26,28,46,0.75) 0%, rgba(45,58,46,0.75) 40%, rgba(61,74,42,0.75) 70%, rgba(74,58,32,0.75) 100%)",
        pointerEvents: "none",
      }} />

      {/* Atmospheric background layers */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(180,130,60,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "38%", zIndex: 1,
        background: "linear-gradient(to top, rgba(30,40,20,0.85) 0%, transparent 100%)",
        pointerEvents: "none",
      }} />

      <div className="forecast-content">

        <header className="forecast-header">

          <div className="forecast-greeting">
            <span style={{ fontSize: isMobile ? 20 : 26, lineHeight: 1 }}>{greetIcon}</span>
            <h1 style={{
              margin: 0,
              fontSize: isMobile ? "clamp(18px, 4.5vw, 24px)" : "clamp(28px, 3vw, 36px)",
              fontWeight: 700,
              letterSpacing: "-0.5px",
              color: "#f5ede0",
              textShadow: "0 2px 16px rgba(0,0,0,0.5)",
              lineHeight: 1.15,
              wordBreak: "break-word",
            }}>
              {greetText}, <span style={{ color: "#f0c87a" }}>Tagum City</span>
            </h1>
          </div>

          <div className="forecast-date-pill">
            <span style={{ fontSize: isMobile ? 11 : 13 }}>📅</span>
            <span style={{ fontSize: isMobile ? 10 : 13, color: "#d4ccc0", letterSpacing: "0.4px", fontFamily: "monospace" }}>
              {isMobile ? now.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) : dateStr}
            </span>
            <span style={{
              width: 1, height: 12,
              background: "rgba(255,255,255,0.25)",
              display: "inline-block",
              margin: "0 2px",
            }} />
            <span style={{ fontSize: isMobile ? 10 : 13, color: "#f0c87a", fontFamily: "monospace" }}>{timeStr}</span>
          </div>

          {/* Row 3: Subtitle — one consistent gap below date pill */}
          <p style={{
            margin: 0,
            fontSize: isMobile ? 11 : 13,
            color: "rgba(200,190,175,0.75)",
            letterSpacing: "0.6px",
            textAlign: "center",
            maxWidth: "100%",
          }}>
            {isMobile ? "24h forecast" : `24-hour forecast · ${accuracyLabel}`}
          </p>
        </header>

        <section className="forecast-conditions">
          <label className="section-label">
            <span>🔶</span> Current Conditions
          </label>
          <div className="conditions-grid">
            {conditionMetrics.map((item) => (
              <div key={item.label} className="condition-tile">
                <div className="condition-tile-icon" style={{ fontSize: isMobile ? 16 : 18 }}>{item.icon}</div>
                <div className="condition-tile-label" style={{ fontSize: isMobile ? 9 : 10 }}>{item.label}</div>
                <div className="condition-tile-value" style={{ fontSize: isMobile ? 19 : 22 }}>
                  {item.val}<sup className="condition-tile-unit" style={{ fontSize: isMobile ? 10 : 12 }}>{item.unit}</sup>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="forecast-chart-layout">
          <aside
            className={`forecast-weather-card forecast-weather-card-${weatherHeroImage.kind}`}
            style={{ backgroundImage: `url(${visibleHeroImage})` }}
          >
            <div className="forecast-weather-card-time">{timeStr}</div>
            <div className="forecast-weather-card-body">
              <div className="forecast-weather-card-temp">
                {Math.round(currentWeather.temperature)}<span>°</span>
              </div>
              <div className="forecast-weather-card-meta">
                <p>{conditionLabel}</p>
                <span>Feels like {Math.round(currentWeather.feelsLike ?? currentWeather.temperature)}°</span>
              </div>
            </div>
          </aside>

          <HourlyForecastStrip hourlyData={chartData} />
        </section>

        <section className="forecast-windows">
          <label className="section-label">
            <span>🔶</span> Optimal Weather Windows
          </label>
          <div className="weather-windows-grid">
            {weatherWindows.map((w) => (
              <div key={w.label} className="weather-window-card">
                <div className="weather-window-header">
                  <div>
                    <div className="weather-window-icon" style={{ fontSize: isMobile ? 18 : 22 }}>{w.icon}</div>
                    <div className="weather-window-title" style={{ fontSize: isMobile ? 12 : 13 }}>{w.label}</div>
                  </div>
                  <div className="weather-window-badge" style={{
                    background: w.badgeColor,
                    fontSize: isMobile ? 8 : 9,
                  }}>{w.badge}</div>
                </div>
                <div className="weather-window-time" style={{ fontSize: isMobile ? 10 : 11 }}>{w.time}</div>
                <div className="weather-window-activity" style={{ fontSize: isMobile ? 10 : 11 }}>{w.activity}</div>
                <div className="weather-window-stats" style={{ gap: isMobile ? 8 : 10, fontSize: isMobile ? 11 : 12 }}>
                  <span>🌡️ {w.temp}°C</span>
                  <span>💧 {w.rain}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

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
            <span>{tab.icon}</span> {isMobile ? "" : tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
