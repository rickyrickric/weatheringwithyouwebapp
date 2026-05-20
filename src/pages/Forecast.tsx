import { useState, useEffect } from "react";
import HourlyForecastStrip from "../components/HourlyForecastStrip";
import { MOCK_WEATHER } from "../types/weather";
import type { AccuracySummary, CurrentWeather, DailyOutlook, ForecastResponse, WeatherAlert } from "../types/weather";
import { WEATHER_API_BASE } from "../utils/api";
import { getWeatherHeroImage } from "../utils/weatherHeroImage";

const CURRENT_WEATHER_REFRESH_MS = 5 * 60 * 1000;
const FORECAST_REFRESH_MS = 10 * 60 * 1000;
const ADVISORY_REFRESH_MS = 60 * 1000;

const getResponseErrorMessage = async (response: Response, fallbackLabel: string) => {
  try {
    const payload = await response.json() as {
      error?: { message?: string; details?: string };
    };
    const message = payload.error?.details || payload.error?.message;
    return message
      ? `${fallbackLabel}: ${response.status} ${message}`
      : `${fallbackLabel}: ${response.status}`;
  } catch {
    return `${fallbackLabel}: ${response.status}`;
  }
};

type TemperatureUnit = "c" | "f";
type WindUnit = "kmh" | "mph";
type TimeFormat = "12h" | "24h";
type RainIntensity = "none" | "light" | "moderate" | "heavy";

interface ForecastHour {
  time: string;
  temp: number;
  rain: number;
  rainMm: number;
}

interface AdvisoryResponse {
  generatedAt: string;
  source: "openweather" | "supabase-sync";
  alerts: WeatherAlert[];
}

const forecastData: ForecastHour[] = Array.from({ length: 24 }, (_, hour) => {
  const afternoonStormCurve = Math.exp(-((hour - 15) ** 2) / 18);
  const rain = Math.round(18 + afternoonStormCurve * 56 + Math.max(0, hour - 18) * 2);

  return {
    time: `${hour.toString().padStart(2, "0")}:00`,
    temp: Math.round(24 + Math.sin(((hour - 7) / 24) * Math.PI * 2) * 4),
    rain,
    rainMm: Number(Math.max(0.2, rain / 28).toFixed(1)),
  };
});

const fallbackTagumAlerts: WeatherAlert[] = [];

const fallbackSevenDayOutlook: DailyOutlook[] = [
  { day: "Mon", date: "May 11", high: 31, low: 24, rainChance: 68, rainMm: 8.8, summary: "PM storms near Apokon" },
  { day: "Tue", date: "May 12", high: 32, low: 24, rainChance: 46, rainMm: 3.4, summary: "Humid, scattered rain" },
  { day: "Wed", date: "May 13", high: 31, low: 23, rainChance: 28, rainMm: 1.2, summary: "Mostly cloudy breaks" },
  { day: "Thu", date: "May 14", high: 33, low: 24, rainChance: 22, rainMm: 0.4, summary: "Warmer midday" },
  { day: "Fri", date: "May 15", high: 32, low: 24, rainChance: 57, rainMm: 5.9, summary: "Late-day showers" },
  { day: "Sat", date: "May 16", high: 30, low: 23, rainChance: 74, rainMm: 12.6, summary: "Heavy rain bands expected" },
  { day: "Sun", date: "May 17", high: 31, low: 24, rainChance: 39, rainMm: 2.1, summary: "Light passing rain" },
];

const windows = [
  { label: "Morning", time: "06:00–09:00", activity: "Outdoor exercise", icon: "☀️", temp: 26, rain: 5, badge: "OPTIMAL", badgeColor: "#e07b39" },
  { label: "Midday", time: "11:00–13:00", activity: "Outdoor planning", icon: "🌤️", temp: 29, rain: 20, badge: "GOOD", badgeColor: "#4a9a6a" },
  { label: "Afternoon", time: "15:00–17:00", activity: "Possible showers", icon: "🌦️", temp: 26, rain: 30, badge: "FAIR", badgeColor: "#7a6ab0" },
];

const fallbackAccuracy: AccuracySummary = {
  value: null,
  label: "Forecast powered by OpenWeather and PAGASA",
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

const toFahrenheit = (temperature: number) => Math.round((temperature * 9) / 5 + 32);
const formatTemperature = (temperature: number, unit: TemperatureUnit) =>
  `${unit === "f" ? toFahrenheit(temperature) : Math.round(temperature)}°${unit.toUpperCase()}`;
const formatTemperatureNumber = (temperature: number, unit: TemperatureUnit) =>
  unit === "f" ? toFahrenheit(temperature) : Math.round(temperature);
const formatWind = (speed: number | null | undefined, unit: WindUnit) => {
  if (typeof speed !== "number" || !Number.isFinite(speed)) return { value: "--", unit: unit === "mph" ? "mph" : "km/h" };
  if (speed > 0 && speed < 1) return { value: "<1", unit: unit === "mph" ? "mph" : "km/h" };

  const convertedSpeed = unit === "mph" ? speed * 0.621371 : speed;
  if (convertedSpeed > 0 && convertedSpeed < 1) return { value: "<1", unit: unit === "mph" ? "mph" : "km/h" };
  if (convertedSpeed === 0) return { value: "Calm", unit: "" };

  return {
    value: Math.round(convertedSpeed).toString(),
    unit: unit === "mph" ? "mph" : "km/h",
  };
};

const getRainIntensity = (rainMm: number): RainIntensity => {
  if (rainMm <= 0) return "none";
  if (rainMm < 2.5) return "light";
  if (rainMm < 7.6) return "moderate";
  return "heavy";
};

const formatElapsed = (seconds: number) => {
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
};

const formatClock = (time: string, format: TimeFormat) => {
  const [hourPart, minute = "00"] = time.split(":");
  const hour = Number(hourPart);
  if (Number.isNaN(hour) || format === "24h") return `${hourPart.padStart(2, "0")}:${minute}`;
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${hour < 12 ? "AM" : "PM"}`;
};

const formatTimeRange = (range: string, format: TimeFormat) => {
  const [start, end] = range.split(/\s*[–-]\s*/);
  if (!start || !end) return range;
  return `${formatClock(start, format)}–${formatClock(end, format)}`;
};

const isNightNow = (date: Date) => {
  const minutes = date.getHours() * 60 + date.getMinutes();
  const sunrise = 5 * 60 + 41;
  const sunset = 17 * 60 + 57;
  return minutes < sunrise || minutes > sunset;
};

const getUvMetric = (
  now: Date,
  hasLiveCurrentWeather: boolean,
  uvIndex: number | undefined,
) => {
  if (isNightNow(now)) {
    return {
      val: "Night - no UV exposure right now",
      unit: "",
      longText: true,
    };
  }

  if (hasLiveCurrentWeather && typeof uvIndex === "number" && Number.isFinite(uvIndex)) {
    return {
      val: Math.round(uvIndex).toString(),
      unit: "UV",
      longText: false,
    };
  }

  const isMorning = now.getHours() < 12;
  return {
    val: isMorning ? "Morning UV unavailable" : "UV unavailable",
    unit: "",
    longText: true,
  };
};

const getAlertIcon = (tone: WeatherAlert["tone"]) => {
  if (tone === "moderate") return <i className="bi bi-lightning-fill" aria-hidden="true"></i>;
  return <i className="bi bi-info-circle-fill" aria-hidden="true"></i>;
};

const getWindowInsight = (label: string) => {
  if (label.toLowerCase().includes("morning")) {
    return { metric: "UV risk", value: "Low", note: "Best for exercise and errands" };
  }

  if (label.toLowerCase().includes("midday")) {
    return { metric: "Heat comfort", value: "Watch", note: "Use shade and short exposure" };
  }

  return { metric: "Wind comfort", value: "Variable", note: "Keep plans flexible near showers" };
};

export default function WeatherDashboard() {
  const [now, setNow] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(MOCK_WEATHER);
  const [hasLiveCurrentWeather, setHasLiveCurrentWeather] = useState(false);
  const [isCurrentWeatherLoading, setIsCurrentWeatherLoading] = useState(true);
  const [lastKnownDewPoint, setLastKnownDewPoint] = useState<{ value: number; observedAt: Date } | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(new Date());
  const [temperatureUnit, setTemperatureUnit] = useState<TemperatureUnit>("c");
  const [windUnit, setWindUnit] = useState<WindUnit>("kmh");
  const [timeFormat, setTimeFormat] = useState<TimeFormat>("12h");
  const [chartData, setChartData] = useState(forecastData);
  const [tagumAlerts, setTagumAlerts] = useState<WeatherAlert[]>(fallbackTagumAlerts);
  const [lastAdvisoryUpdatedAt, setLastAdvisoryUpdatedAt] = useState(new Date());
  const [isAdvisoryRefreshing, setIsAdvisoryRefreshing] = useState(true);
  const [sevenDayOutlook, setSevenDayOutlook] = useState<DailyOutlook[]>(fallbackSevenDayOutlook);
  const [sourceConfidence, setSourceConfidence] = useState({ label: "Forecast powered by OpenWeather and PAGASA", value: "High" });
  const [weatherWindows, setWeatherWindows] = useState(windows);
  const [accuracy, setAccuracy] = useState<AccuracySummary>(fallbackAccuracy);
  const [isForecastLoading, setIsForecastLoading] = useState(true);
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
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let inFlight = false;
    let activeController: AbortController | null = null;

    const fetchCurrentWeather = async () => {
      if (inFlight) return;

      inFlight = true;
      const controller = new AbortController();
      activeController = controller;

      try {
        const response = await fetch(`${WEATHER_API_BASE}/current`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "Current weather request failed"));
        }

        const weather = await response.json() as CurrentWeather;
        const observedAt = new Date();

        if (!isMounted) return;

        setCurrentWeather(weather);
        setLastUpdatedAt(observedAt);
        setHasLiveCurrentWeather(true);

        if (typeof weather.dewPoint === "number" && Number.isFinite(weather.dewPoint)) {
          setLastKnownDewPoint({ value: weather.dewPoint, observedAt });
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching current weather:', error);
        }
      } finally {
        if (activeController === controller) {
          activeController = null;
        }
        inFlight = false;
        if (isMounted) {
          setIsCurrentWeatherLoading(false);
        }
      }
    };

    void fetchCurrentWeather();
    const timer = window.setInterval(fetchCurrentWeather, CURRENT_WEATHER_REFRESH_MS);

    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let inFlight = false;
    let activeController: AbortController | null = null;

    const fetchForecast = async () => {
      if (inFlight) return;

      inFlight = true;
      const controller = new AbortController();
      activeController = controller;

      try {
        const response = await fetch(`${WEATHER_API_BASE}/forecast/24h`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "Forecast request failed"));
        }

        const data = await response.json() as ForecastResponse;
        if (!isMounted) return;

        if (data.forecast.length > 0) {
          setChartData(data.forecast.map((point) => ({
            time: point.time,
            temp: point.temperature,
            rain: point.rainProbability,
            rainMm: Number((point.rainMm ?? point.rainProbability / 18).toFixed(1)),
          })));
        }

        if (data.alerts) {
          setTagumAlerts(data.alerts);
          setLastAdvisoryUpdatedAt(new Date(data.generatedAt || Date.now()));
        }

        if (data.dailyOutlook && data.dailyOutlook.length > 0) {
          setSevenDayOutlook(data.dailyOutlook);
        }

        if (data.sourceConfidence) {
          setSourceConfidence(data.sourceConfidence);
        }

        if (data.sunshineWindows.length > 0) {
          setWeatherWindows(data.sunshineWindows);
        }

        setAccuracy(data.accuracy);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching forecast data:', error);
        }
      } finally {
        if (activeController === controller) {
          activeController = null;
        }
        inFlight = false;
        if (isMounted) {
          setIsForecastLoading(false);
        }
      }
    };

    void fetchForecast();
    const timer = window.setInterval(fetchForecast, FORECAST_REFRESH_MS);

    return () => {
      isMounted = false;
      activeController?.abort();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let inFlight = false;
    let activeController: AbortController | null = null;

    const fetchAdvisories = async () => {
      if (inFlight) return;

      inFlight = true;
      const controller = new AbortController();
      activeController = controller;
      if (isMounted) {
        setIsAdvisoryRefreshing(true);
      }

      try {
        const response = await fetch(`${WEATHER_API_BASE}/advisories?refresh=${Date.now()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(await getResponseErrorMessage(response, "Advisory request failed"));
        }

        const data = await response.json() as AdvisoryResponse;
        if (!isMounted) return;

        setTagumAlerts(data.alerts);
        setLastAdvisoryUpdatedAt(new Date(data.generatedAt || Date.now()));
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error fetching advisory data:', error);
        }
      } finally {
        if (activeController === controller) {
          activeController = null;
        }
        inFlight = false;
        if (isMounted) {
          setIsAdvisoryRefreshing(false);
        }
      }
    };

    void fetchAdvisories();
    const timer = window.setInterval(fetchAdvisories, ADVISORY_REFRESH_MS);

    return () => {
      isMounted = false;
      activeController?.abort();
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

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return { text: "Good Morning", icon: <i className="bi bi-sunrise-fill" aria-hidden="true"></i> };
    if (h < 18) return { text: "Good Afternoon", icon: <i className="bi bi-cloud-sun-fill" aria-hidden="true"></i> };
    return { text: "Good Evening", icon: <i className="bi bi-moon-stars-fill" aria-hidden="true"></i> };
  };

  const { text: greetText, icon: greetIcon } = greeting();

  const dateStr = now.toLocaleDateString("en-PH", {
    weekday: "long", month: "long", day: "numeric", year: "numeric"
  });

  const timeStr = now.toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: timeFormat === "12h",
  });
  const conditionLabel = currentWeather.condition
    ? currentWeather.condition.replace(/\b\w/g, (char) => char.toUpperCase())
    : weatherHeroImage.kind.replace(/\b\w/g, (char) => char.toUpperCase());
  const accuracyLabel =
    accuracy.status === "measured" && typeof accuracy.value === "number"
      ? `${accuracy.value}% accuracy`
      : accuracy.label;
  const pressureDivisor = typeof currentWeather.pressure === "number" && currentWeather.pressure > 2000 ? 100 : 1;
  const updatedSecondsAgo = Math.max(0, Math.floor((now.getTime() - lastUpdatedAt.getTime()) / 1000));
  const advisoryUpdatedSecondsAgo = Math.max(0, Math.floor((now.getTime() - lastAdvisoryUpdatedAt.getTime()) / 1000));
  const windMetric = formatWind(hasLiveCurrentWeather ? currentWeather.windSpeed : undefined, windUnit);
  const nightNow = isNightNow(now);
  const dewPointAgeSeconds = lastKnownDewPoint
    ? Math.max(0, Math.floor((now.getTime() - lastKnownDewPoint.observedAt.getTime()) / 1000))
    : 0;
  const weeklyRainScaleMax = Math.max(30, Math.ceil(Math.max(...sevenDayOutlook.map((day) => day.rainMm), 0) / 5) * 5);
  const daylightStatus = nightNow ? "Night now" : "Daylight now";
  const daylightRangeLabel = `${formatClock("05:41", timeFormat)} / ${formatClock("17:57", timeFormat)}`;
  const uvMetric = getUvMetric(now, hasLiveCurrentWeather, currentWeather.uvIndex);
  const conditionMetrics = [
    {
      icon: <i className="bi bi-wind" aria-hidden="true"></i>,
      label: "Wind Speed",
      val: windMetric.value,
      unit: windMetric.unit,
    },
    {
      icon: <i className="bi bi-droplet-fill" aria-hidden="true"></i>,
      label: "Humidity",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.humidity : undefined),
      unit: "%",
    },
    {
      icon: <i className="bi bi-eye-fill" aria-hidden="true"></i>,
      label: "Visibility",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.visibility : undefined),
      unit: "km",
    },
    {
      icon: <i className="bi bi-thermometer-half" aria-hidden="true"></i>,
      label: "Pressure",
      val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.pressure : undefined, { divisor: pressureDivisor }),
      unit: "hPa",
    },
    {
      icon: <i className="bi bi-sun-fill" aria-hidden="true"></i>,
      label: "UV Index",
      val: uvMetric.val,
      unit: uvMetric.unit,
      longText: uvMetric.longText,
    },
    ...(lastKnownDewPoint
      ? [{
          icon: <i className="bi bi-snow" aria-hidden="true"></i>,
          label: "Dew Point",
          val: formatTemperatureNumber(lastKnownDewPoint.value, temperatureUnit).toString(),
          unit: `°${temperatureUnit.toUpperCase()}`,
          badge: formatElapsed(dewPointAgeSeconds),
        }]
      : [{
          icon: <i className="bi bi-cloud-rain-fill" aria-hidden="true"></i>,
          label: "Rain Chance",
          val: formatMetricValue(hasLiveCurrentWeather ? currentWeather.rainChance : undefined, { fallback: "Checking" }),
          unit: "%",
        }]),
  ];
  const showCurrentSkeleton = isCurrentWeatherLoading && !hasLiveCurrentWeather;
  const showForecastSkeleton = isForecastLoading;

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
        <h2 className="sr-only">
          Tagum City forecast summary with active barangay alerts, hourly rainfall, seven day outlook, source confidence, and daylight timing.
        </h2>

        <header className="forecast-header">

          <div className="forecast-greeting">
            <span style={{ fontSize: isMobile ? 20 : 26, lineHeight: 1, display: 'flex', alignItems: 'center' }}>{greetIcon}</span>
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
            <span className="live-dot" aria-hidden="true" />
            <span className="forecast-live-copy">Updated {formatElapsed(updatedSecondsAgo)}</span>
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
            {isForecastLoading ? (
              <span className="forecast-subtitle-skeleton" aria-label="Loading forecast details" />
            ) : (
              isMobile ? "24h forecast" : `24-hour forecast · ${accuracyLabel}`
            )}
          </p>

          <div className="forecast-unit-toggles" aria-label="Forecast unit controls">
            <div className="unit-toggle-group unit-toggle-temperature" role="group" aria-label="Temperature unit">
              {(["c", "f"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  className={temperatureUnit === unit ? "unit-toggle active" : "unit-toggle"}
                  aria-pressed={temperatureUnit === unit}
                  onClick={() => setTemperatureUnit(unit)}
                >
                  °{unit.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="unit-toggle-group unit-toggle-wind" role="group" aria-label="Wind speed unit">
              {(["kmh", "mph"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  className={windUnit === unit ? "unit-toggle active" : "unit-toggle"}
                  aria-pressed={windUnit === unit}
                  onClick={() => setWindUnit(unit)}
                >
                  {unit === "kmh" ? "km/h" : "mph"}
                </button>
              ))}
            </div>
            <div className="unit-toggle-group unit-toggle-time" role="group" aria-label="Time format">
              {(["12h", "24h"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={timeFormat === format ? "unit-toggle active" : "unit-toggle"}
                  aria-pressed={timeFormat === format}
                  onClick={() => setTimeFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="forecast-alerts" aria-live="polite" aria-label="Realtime Tagum weather advisories">
          <div className="forecast-alerts-status">
            <span className={isAdvisoryRefreshing ? "live-dot advisory-dot-refreshing" : "live-dot"} aria-hidden="true" />
            <span>{isAdvisoryRefreshing ? "Fetching latest advisories" : `Advisories reported ${formatElapsed(advisoryUpdatedSecondsAgo)}`}</span>
          </div>
          {tagumAlerts.length === 0 ? (
            <article className="alert-card alert-advisory">
              <div className="alert-card-header">
                <div>
                  <h3>No Severe Weather Anomalies Present</h3>
                  <p>Tagum City monitoring</p>
                </div>
                <span className="alert-badge">
                  <span aria-hidden="true"><i className="bi bi-check-circle-fill" /></span>
                  Clear
                </span>
              </div>
              <p className="alert-guidance">
                No active severe-weather advisories are currently affecting the monitored areas.
              </p>
            </article>
          ) : tagumAlerts.map((alert) => (
            <article key={alert.title} className={`alert-card alert-${alert.tone}`}>
              <div className="alert-card-header">
                <div>
                  <h3>{alert.title}</h3>
                  <p>{alert.barangays}</p>
                </div>
                <span className="alert-badge">
                  <span aria-hidden="true">{getAlertIcon(alert.tone)}</span>
                  {alert.urgency}
                </span>
              </div>
              <p className="alert-guidance">{alert.guidance}</p>
            </article>
          ))}
        </section>

        <section className="forecast-conditions">
          <label className="section-label section-label-primary">
            <span>🔶</span> Current Conditions
          </label>
          <div className="source-confidence" aria-label={`Weather source confidence is ${sourceConfidence.value.toLowerCase()}`}>
            <span>{sourceConfidence.label}</span>
            <span className="source-confidence-badge">{sourceConfidence.value} confidence</span>
            <span className="source-confidence-info" tabIndex={0} aria-label="Forecast source combines OpenWeather forecast data with PAGASA advisory context. Confidence reflects current data availability.">
              ⓘ
            </span>
          </div>
          <div className="conditions-grid">
            {showCurrentSkeleton ? (
              Array.from({ length: 6 }, (_, index) => (
                <div key={index} className="condition-tile condition-tile-skeleton" aria-hidden="true">
                  <span className="skeleton-circle" />
                  <span className="skeleton-line skeleton-line-short" />
                  <span className="skeleton-line skeleton-line-value" />
                </div>
              ))
            ) : conditionMetrics.map((item) => (
              <div key={item.label} className="condition-tile">
                <div className="condition-tile-icon" style={{ fontSize: isMobile ? 16 : 18 }}>{item.icon}</div>
                <div className="condition-tile-label" style={{ fontSize: isMobile ? 9 : 10 }}>{item.label}</div>
                <div className={`condition-tile-value ${item.longText ? "condition-tile-value-long" : ""}`} style={{ fontSize: isMobile ? 19 : 22 }}>
                  {item.val}<sup className="condition-tile-unit" style={{ fontSize: isMobile ? 10 : 12 }}>{item.unit}</sup>
                </div>
                {"badge" in item && item.badge && <span className="condition-tile-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        </section>

        <section className="forecast-chart-layout">
          <div className="forecast-hero-stack">
          <aside
            className={`forecast-weather-card forecast-weather-card-${weatherHeroImage.kind} ${showCurrentSkeleton ? "forecast-weather-card-loading" : ""}`}
            style={{ backgroundImage: `url(${visibleHeroImage})` }}
          >
            {showCurrentSkeleton && (
              <div className="forecast-weather-card-skeleton" aria-hidden="true">
                <span className="skeleton-line skeleton-line-short" />
                <span className="skeleton-line skeleton-line-temp" />
                <span className="skeleton-line skeleton-line-title" />
                <span className="skeleton-line" />
              </div>
            )}
            <div className="forecast-weather-card-time">{timeStr}</div>
            <div className="forecast-weather-card-body">
              <div className="forecast-weather-card-temp">
                {formatTemperatureNumber(currentWeather.temperature, temperatureUnit)}<span>°</span>
              </div>
              <div className="forecast-weather-card-meta">
                <p>{conditionLabel}</p>
                <span>Feels like {formatTemperature(currentWeather.feelsLike ?? currentWeather.temperature, temperatureUnit)}</span>
              </div>
            </div>
          </aside>

            <aside className="daylight-card" aria-label={`Tagum daylight from ${formatClock("05:41", timeFormat)} to ${formatClock("17:57", timeFormat)}`}>
              <div className="daylight-card-header">
                <div>
                  <p className="daylight-eyebrow">Daylight</p>
                  <h3>{daylightRangeLabel}</h3>
                </div>
                <span>12h 16min</span>
              </div>
              <div className="daylight-status">{daylightStatus}</div>
              <div className="daylight-metrics">
                <div>
                  <span>Sunrise</span>
                  <strong>{formatClock("05:41", timeFormat)}</strong>
                </div>
                <div>
                  <span>Sunset</span>
                  <strong>{formatClock("17:57", timeFormat)}</strong>
                </div>
              </div>
            </aside>
          </div>

          <HourlyForecastStrip hourlyData={chartData} temperatureUnit={temperatureUnit} timeFormat={timeFormat} isLoading={showForecastSkeleton} />
        </section>

        <section className="weekly-outlook" aria-label="Seven day Tagum weather outlook">
          <div className="section-heading-row">
            <h2 className="section-label section-label-primary">
              <span>🔶</span> 7-Day Outlook
            </h2>
            <div className="weekly-heading-meta">
              <span className="weekly-range-note">Rainfall amount and intensity</span>
            </div>
          </div>
          <div
            className="weekly-column-headers weekly-grid-columns"
            aria-hidden="true"
          >
            <span>Day</span>
            <span>Outlook</span>
            <span>Rainfall</span>
            <span>Hi / Lo</span>
            <span>Rain</span>
            <span>Level</span>
          </div>
          <div className="weekly-rain-axis weekly-grid-columns" aria-hidden="true">
            <span>0 mm</span>
            <span>{weeklyRainScaleMax} mm</span>
          </div>
          <div className="weekly-outlook-list">
            {showForecastSkeleton ? (
              Array.from({ length: 7 }, (_, index) => (
                <article key={index} className="weekly-row weekly-grid-columns weekly-row-skeleton" aria-hidden="true">
                  <div className="weekly-day">
                    <span className="skeleton-line skeleton-line-short" />
                    <span className="skeleton-line skeleton-line-shorter" />
                  </div>
                  <span className="skeleton-line skeleton-line-title" />
                  <span className="skeleton-bar" />
                  <span className="skeleton-line skeleton-line-short" />
                  <span className="skeleton-line skeleton-line-short" />
                  <span className="skeleton-pill" />
                </article>
              ))
            ) : sevenDayOutlook.map((day) => {
              const intensity = day.intensity ?? getRainIntensity(day.rainMm);
              const rainWidth = Math.max(3, Math.min(100, (day.rainMm / weeklyRainScaleMax) * 100));

              return (
                <article
                  key={day.date}
                  className={`weekly-row weekly-grid-columns rain-${intensity}`}
                  aria-label={`${day.day} ${day.date}, high ${formatTemperature(day.high, temperatureUnit)}, low ${formatTemperature(day.low, temperatureUnit)}, ${day.rainChance}% rain, ${day.rainMm.toFixed(1)} millimeters, ${intensity} intensity`}
                >
                  <div className="weekly-day">
                    <strong>{day.day}</strong>
                    <span>{day.date}</span>
                  </div>
                  <div className="weekly-summary">{day.summary}</div>
                  <div className="weekly-temp-range" aria-hidden="true">
                    <span className="weekly-range-track" />
                    <span
                      className="weekly-range-fill"
                      style={{ width: `${rainWidth}%` }}
                    />
                  </div>
                  <div className="weekly-temps">
                    <strong>{formatTemperature(day.high, temperatureUnit)}</strong>
                    <span>{formatTemperature(day.low, temperatureUnit)}</span>
                  </div>
                  <div className="weekly-rain">
                    <strong>{day.rainChance}%</strong>
                    <span>{day.rainMm.toFixed(1)} mm</span>
                  </div>
                  <span className="intensity-badge">{intensity}</span>
                </article>
              );
            })}
          </div>
        </section>

        <section className="forecast-windows">
          <label className="section-label section-label-primary">
            <span>🔶</span> Optimal Weather Windows
          </label>
          <div className="weather-windows-grid">
            {showForecastSkeleton ? (
              Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="weather-window-card weather-window-card-skeleton" aria-hidden="true">
                  <div className="weather-window-header">
                    <div>
                      <span className="skeleton-circle" />
                      <span className="skeleton-line skeleton-line-short" />
                    </div>
                    <span className="skeleton-pill" />
                  </div>
                  <span className="skeleton-line skeleton-line-title" />
                  <span className="skeleton-line" />
                  <span className="skeleton-line skeleton-line-short" />
                  <span className="skeleton-line skeleton-line-title" />
                </div>
              ))
            ) : weatherWindows.map((w) => {
              const insight = getWindowInsight(w.label);

              return (
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
                <div className="weather-window-time" style={{ fontSize: isMobile ? 10 : 11 }}>{formatTimeRange(w.time, timeFormat)}</div>
                <div className="weather-window-activity" style={{ fontSize: isMobile ? 10 : 11 }}>{w.activity}</div>
                <div className="weather-window-insight">
                  <span>{insight.metric}</span>
                  <strong>{insight.value}</strong>
                </div>
                <div className="weather-window-note">{insight.note}</div>
                <div className="weather-window-stats" style={{ gap: isMobile ? 8 : 10, fontSize: isMobile ? 11 : 12 }}>
                  <span>🌡️ {formatTemperature(w.temp, temperatureUnit)}</span>
                  <span>💧 {w.rain}%</span>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        <section className="forecast-settings-panel" aria-label="Forecast display settings">
          <span className="settings-panel-icon" aria-hidden="true">&#9881;</span>
          <div className="forecast-unit-toggles" aria-label="Forecast unit controls">
            <div className="unit-toggle-group unit-toggle-temperature" role="group" aria-label="Temperature unit">
              {(["c", "f"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  className={temperatureUnit === unit ? "unit-toggle active" : "unit-toggle"}
                  aria-pressed={temperatureUnit === unit}
                  onClick={() => setTemperatureUnit(unit)}
                >
                  °{unit.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="unit-toggle-group unit-toggle-wind" role="group" aria-label="Wind speed unit">
              {(["kmh", "mph"] as const).map((unit) => (
                <button
                  key={unit}
                  type="button"
                  className={windUnit === unit ? "unit-toggle active" : "unit-toggle"}
                  aria-pressed={windUnit === unit}
                  onClick={() => setWindUnit(unit)}
                >
                  {unit === "kmh" ? "km/h" : "mph"}
                </button>
              ))}
            </div>
            <div className="unit-toggle-group unit-toggle-time" role="group" aria-label="Time format">
              {(["12h", "24h"] as const).map((format) => (
                <button
                  key={format}
                  type="button"
                  className={timeFormat === format ? "unit-toggle active" : "unit-toggle"}
                  aria-pressed={timeFormat === format}
                  onClick={() => setTimeFormat(format)}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
