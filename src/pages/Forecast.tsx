<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from 'react';
import DualAxisChart from '../components/DualAxisChart';
import DynamicBackground from '../components/DynamicBackground';
import DateAnchor from '../components/DateAnchor';
import KPIGrid from '../components/KPIGrid';
import SunshineWindow from '../components/SunshineWindow';
import { ChartSkeleton, KPISkeleton } from '../components/Skeleton';
import ErrorBanner from '../components/ErrorBanner';
import { useBackgroundState } from '../hooks/useBackgroundState';
import {
  OPTIMAL_WINDOWS,
  DEFAULT_CHART_DATA,
  MOCK_WEATHER,
  getTimeOfDay,
} from '../types/weather';
import type { ChartDataPoint, CurrentWeather } from '../types/weather';
=======
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MOCK_WEATHER } from "../types/weather";
import type { CurrentWeather } from "../types/weather";
import { getWeatherHeroImage } from "../utils/weatherHeroImage";
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e

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

export default function WeatherDashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Forecast");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentWeather, setCurrentWeather] = useState<CurrentWeather>(MOCK_WEATHER);
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
    fetch('/api/weather/current')
      .then(res => res.json())
      .then(data => setCurrentWeather(data))
      .catch(err => console.error('Error fetching current weather:', err));
  }, []);

  useEffect(() => {
    if (weatherHeroImage.src === visibleHeroImage) return;

    setPreviousHeroImage(visibleHeroImage);
    setVisibleHeroImage(weatherHeroImage.src);

    const timeout = window.setTimeout(() => {
      setPreviousHeroImage(null);
    }, 650);

    return () => window.clearTimeout(timeout);
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

  // Get dynamic text color based on background state
  const { textColorClass } = useBackgroundState(currentWeather.weatherId, lastUpdated.getHours());

  return (
<<<<<<< HEAD
    <div className="relative min-h-screen page-enter tab-container">
      <DynamicBackground
        temperature={currentTemp}
        rainProbability={currentRain}
        timeOfDay={timeOfDay}
        isOptimalWindow={isOptimalWindow}
        weatherId={currentWeather.weatherId}
        currentHour={lastUpdated.getHours()}
      />

      {/* Error toast: never let fallback data dominate the hero */}
      {hasError && showErrorToast && (
        <ErrorBanner
          variant="toast"
          onRetry={fetchForecastData}
          onDismiss={() => setShowErrorToast(false)}
          className="error-banner-toast"
=======
    <div className="forecast-scroll-root forecast-page">
      {previousHeroImage && (
        <div
          key={`previous-${previousHeroImage}`}
          className="forecast-weather-image forecast-weather-image-out"
          style={{ backgroundImage: `url(${previousHeroImage})` }}
          aria-hidden="true"
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e
        />
      )}
      <div
        key={visibleHeroImage}
        className={`forecast-weather-image forecast-weather-image-in forecast-weather-${weatherHeroImage.kind}`}
        style={{ backgroundImage: `url(${visibleHeroImage})` }}
        aria-hidden="true"
      />
      <div className="forecast-weather-scrim" aria-hidden="true" />

<<<<<<< HEAD
      <div className={`relative z-10 h-full overflow-hidden forecast-page ${textColorClass}`}>
        {/* Header */}
        <div className="text-center py-1 px-4 prayer-header header-section">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <h1 className="page-title forecast-heading forecast-title text-gray-100">
              <span className="mr-2 text-lg md:text-xl">{getGreeting(forecastDate).emoji}</span>
              {getGreeting(forecastDate).text}, Tagum City
=======
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
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e
            </h1>
          </div>
<<<<<<< HEAD
          <p className="forecast-subtitle text-tertiary-contrast mt-1 text-[11px] md:text-sm">
            24-hour forecast with 92% accuracy • 6-month climate baseline
=======

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
            {isMobile ? "24h forecast" : "24-hour forecast with 92% accuracy · 6-month climate baseline"}
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e
          </p>
        </header>

<<<<<<< HEAD
        {/* Main container */}
          <div className="relative page-container pb-[100px] pt-1 prayer-cleared flex-1 overflow-y-auto main-content forecast-content">
          
          {/* Feature: Rain Alert Banner */}
          {!isLoading && currentRain > 60 && !hasError && (
            <div className="bg-orange-500/10 border border-orange-500/25 text-orange-200 p-3 rounded-xl flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌧️</span>
                <p className="text-sm"><strong>High Rain Alert:</strong> {currentRain}% chance of precipitation. Carry an umbrella.</p>
=======
        <section className="forecast-conditions">
          <label className="section-label">
            <span>🔶</span> Current Conditions
          </label>
          <div className="conditions-grid">
            {[
              { icon: "💨", label: "Wind Speed", val: "12", unit: "km/h" },
              { icon: "💧", label: "Humidity", val: "72", unit: "%" },
              { icon: "👁️", label: "Visibility", val: "10", unit: "km" },
              { icon: "🌡️", label: "Pressure", val: "1013", unit: "hPa" },
              { icon: "☀️", label: "UV Index", val: "6", unit: "UV" },
              { icon: "❄️", label: "Dew Point", val: "20", unit: "°C" },
            ].map((item) => (
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
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e
              </div>
            </div>
          </aside>

<<<<<<< HEAD
          {/* Current Conditions */}
          <div className="space-y-3 mb-2">
            <h3 className="section-label text-base font-bold text-gray-200 uppercase tracking-widest">
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
=======
          <section className="chart-card">
          <div className="chart-card-header" style={{ flexDirection: isMobile ? "column" : "row" }}>
            <span style={{ fontSize: isMobile ? 11 : 13, color: "#d4ccc0" }}>Temperature &amp; Rain Probability {isMobile ? "" : "· 24hr Forecast"}</span>
            <span className="chart-now-label" style={{ fontSize: isMobile ? 10 : 12 }}>Now: {timeStr}</span>
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e
          </div>
          <ResponsiveContainer width="100%" height={isMobile ? 140 : 180}>
            <LineChart data={forecastData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="time" tick={{ fontSize: isMobile ? 8 : 10, fill: "rgba(200,190,175,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="temp" tick={{ fontSize: isMobile ? 8 : 10, fill: "rgba(200,190,175,0.5)" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: isMobile ? 8 : 10, fill: "rgba(200,190,175,0.5)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(20,25,35,0.95)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: isMobile ? 10 : 12 }} />
              <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="#e07b39" strokeWidth={2} dot={false} name="Temperature (°C)" />
              <Line yAxisId="rain" type="monotone" dataKey="rain" stroke="#5bb8d4" strokeWidth={2} dot={false} name="Rain (%)" />
              <Legend wrapperStyle={{ fontSize: isMobile ? 11 : 13, color: "rgba(255,255,255,0.86)", paddingTop: 12, fontWeight: 600 }} />
            </LineChart>
          </ResponsiveContainer>
        </section>
        </section>

        <section className="forecast-windows">
          <label className="section-label">
            <span>🔶</span> Optimal Weather Windows
          </label>
          <div className="weather-windows-grid">
            {windows.map((w) => (
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
<<<<<<< HEAD

          {/* Feature: Hourly Breakdown Row */}
          {!isLoading && !hasError && (
            <section className="space-y-2 mb-2 animate-[pageEnter_0.3s_ease-out]">
              <h3 className="section-label text-base font-bold text-gray-200 uppercase tracking-widest">
                ⏱️ Hourly Breakdown
              </h3>
              <div className="flex overflow-x-auto pb-4 gap-3 snap-x scroll-smooth no-scrollbar">
                {(chartData.length > 0 ? chartData : DEFAULT_CHART_DATA).map((point, idx) => (
                  <div key={idx} className="glass-card min-w-[80px] p-3 flex flex-col items-center justify-center snap-center hover:bg-white/10 transition-colors">
                    <span className="text-xs text-label-contrast font-mono mb-2">{point.time}</span>
                    <span className="text-xl mb-2">{point.rainProbability > 50 ? '🌧️' : point.temperature > 28 ? '☀️' : '⛅'}</span>
                    <span className="text-sm font-bold text-gray-200">{Math.round(point.temperature)}°</span>
                    <span className="text-[10px] text-label-contrast">{point.rainProbability}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bottom row: Optimal Weather Windows */}
          <section className="space-y-2">
            <h3 className="section-label text-base font-bold text-gray-200 uppercase tracking-widest">
              ☀️ Optimal Weather Windows
            </h3>
            <div className="weather-windows-grid">
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

          {/* Subtle fade indicator for clipped content */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">⌄</div>
        </div>
=======
        </section>
>>>>>>> dbb9c69fe3ea9eba8470a967838a1c3fa0e2553e
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
