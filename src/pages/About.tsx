import React from 'react';
import GlassCard from '../components/GlassCard';
import { useBackgroundState } from '../hooks/useBackgroundState';

const About: React.FC = () => {
  const { textColorClass } = useBackgroundState(undefined, new Date().getHours());

  return (
    <div className="relative min-h-screen page-enter bg-[#121826] technical-page tab-container">
      <div className={`relative z-10 ${textColorClass}`}>
        <div className="text-center py-2 px-4 header-section">
          <h1 className="page-title text-gray-100 mb-1">About This Project</h1>
          <div className="mt-3 h-1 w-24 bg-slate-600 mx-auto rounded-full opacity-60" />
        </div>

        <div className="page-container py-3 space-y-2 main-content">
          <div className="about-top-grid">
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-100 mb-3">
                <i className="bi bi-film mr-2" aria-hidden="true"></i>
                Inspiration: "Tenki no Ko" (Weathering with You)
              </h2>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="leading-relaxed text-xs">
                  This project draws inspiration from the anime film <strong>"Tenki no Ko"</strong> (Weathering with You), where weather forecasting becomes an act of connection, sacrifice, and hope.
                </p>
                <details className="text-gray-400">
                  <summary className="text-xs text-gray-300 cursor-pointer">Read more</summary>
                  <div className="mt-2 space-y-3">
                    <p className="leading-relaxed text-xs">
                      In the film, Hodaka discovers that Hina can influence weather, a power tied to the climate itself. Their journey explores destiny, love, and the tension between human choice and natural forces.
                    </p>
                    <p className="leading-relaxed italic text-gray-500 text-xs">
                      "A prayer for the palm city" captures the spirit here: the app is not only about prediction, but about understanding the practical meaning of sunshine and rain for daily life.
                    </p>
                  </div>
                </details>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-bold text-gray-100 mb-3">
                <i className="bi bi-gear-fill mr-2" aria-hidden="true"></i>
                Technology Stack
              </h2>
              <div className="grid gap-3 grid-auto-fit">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-100 flex items-center gap-1">
                    <i className="bi bi-palette-fill" aria-hidden="true"></i> Frontend
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-secondary-contrast">
                    <div className="p-2 bg-white/5 rounded border-l-4 border-emerald-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">React 19</p>
                      <p className="text-[10px] text-label-contrast">Component-based UI with hooks</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-sky-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Tailwind CSS</p>
                      <p className="text-[10px] text-label-contrast">Glassmorphic design system</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="font-semibold text-gray-200 text-xs">React Router v7</p>
                      <p className="text-[10px] text-label-contrast">Navigation between tabs</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="font-semibold text-gray-200 text-xs">Recharts</p>
                      <p className="text-[10px] text-label-contrast">Chart rendering and overlays</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-100 flex items-center gap-1">
                    <i className="bi bi-lightning-fill" aria-hidden="true"></i> Backend & ML
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="p-2 bg-white/5 rounded border-l-4 border-amber-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Express API</p>
                      <p className="text-[10px] text-label-contrast">Node weather service with circuit breaker</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-fuchsia-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Regression.js</p>
                      <p className="text-[10px] text-label-contrast">Polynomial smoothing and climatology blend</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-violet-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Supabase</p>
                      <p className="text-[10px] text-label-contrast">Cloud sync and fallback storage</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="font-semibold text-gray-200 text-xs">OpenWeather API</p>
                      <p className="text-[10px] text-label-contrast">Live current weather and forecast feed</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <h2 className="text-lg font-bold text-gray-100 mb-3">
              <i className="bi bi-diagram-3-fill mr-2" aria-hidden="true"></i>
              Architecture Overview
            </h2>
            <p className="text-xs text-secondary-contrast mb-3">
              End-to-end weather intelligence pipeline for Tagum City with cloud-synced recovery when the live provider is unavailable.
            </p>
            <div className="grid gap-2 grid-auto-fit text-xs">
              <div className="arch-node">
                <p className="node-label">CSV / APIs</p>
                <p className="node-sub">OpenWeather live feed</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">-&gt;</span>
              </div>
              <div className="arch-node">
                <p className="node-label">Forecast Blend</p>
                <p className="node-sub">Regression + climatology</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">-&gt;</span>
              </div>
              <div className="arch-node">
                <p className="node-label">Express API</p>
                <p className="node-sub">Cache + circuit breaker</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">-&gt;</span>
              </div>
              <div className="arch-node">
                <p className="node-label">Supabase</p>
                <p className="node-sub">Cloud sync fallback</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">-&gt;</span>
              </div>
              <div className="arch-node">
                <p className="node-label">React UI</p>
                <p className="node-sub">Forecast + Dashboard</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="key-features-card">
            <h2 className="text-lg font-bold text-gray-100 mb-3">
              <i className="bi bi-stars mr-2" aria-hidden="true"></i>
              Key Features
            </h2>
            <div className="grid gap-2 grid-auto-fit">
              <ul className="space-y-2 text-xs">
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Dual-Axis Chart:</span> Temperature and rain probability side-by-side</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Sunshine Windows:</span> Actionable weather recommendations</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Dynamic Background:</span> Responds to real-time weather</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Climate Memory:</span> 90-day hourly baseline</span>
                </li>
              </ul>
              <ul className="space-y-2 text-xs">
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Cloud Sync Recovery:</span> Serves latest synced weather when OpenWeather is down</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Glassmorphic UI:</span> Aesthetic consistency throughout</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">-&gt;</span>
                  <span><span className="key-feature-label">Multi-Tab Navigation:</span> Home, Forecast, Dashboard, About</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">-&gt;</span>
                  <span><strong>Responsive Design:</strong> Mobile-first, works on all devices</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-bold text-gray-100 mb-3">
              <i className="bi bi-arrow-repeat mr-2" aria-hidden="true"></i>
              Data Pipeline
            </h2>
            <p className="text-secondary-contrast mb-3 text-xs">
              This section explains how weather data moves through the system, from live provider
              requests up to the app interface and cloud fallback storage.
            </p>

            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                      <i className="bi bi-globe2 mr-1" aria-hidden="true"></i> OpenWeather API
                    </p>
                    <p className="text-xs text-label-contrast">Live observations and forecast feed</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.25)]">
                    Source
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    Current weather
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    24h forecast
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    Rain probability
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                      <i className="bi bi-lightning-fill mr-1" aria-hidden="true"></i> Express Processing Layer
                    </p>
                    <p className="text-xs text-label-contrast">Validation, caching, smoothing, and advisory logic</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600/20 text-amber-300 border border-amber-400/60 shadow-[0_0_8px_rgba(217,119,6,0.25)]">
                    Processing
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                    Cache protection
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                    Regression smoothing
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                    Advisory generation
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                      <i className="bi bi-server mr-1" aria-hidden="true"></i> Supabase Cloud Sync
                    </p>
                    <p className="text-xs text-label-contrast">Fallback storage, forecast snapshots, and climatology</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-400/60 shadow-[0_0_8px_rgba(139,92,246,0.25)]">
                    Storage
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                    Observations
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                    Forecast rows
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                    90-day climatology
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                      <i className="bi bi-window mr-1" aria-hidden="true"></i> React App Interface
                    </p>
                    <p className="text-xs text-label-contrast">Delivers weather intelligence to the end user</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-600/20 text-sky-300 border border-sky-400/60 shadow-[0_0_8px_rgba(56,189,248,0.25)]">
                    Output
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    Home
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    Forecast
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                    Dashboard
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="text-center py-2 text-gray-500 text-xs">
          <p>Built with love, data, and a prayer for perfect weather.</p>
        </div>
      </div>
    </div>
  );
};

export default About;
