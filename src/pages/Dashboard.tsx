import React, { useEffect, useState } from 'react';
import GlassCard from '../components/GlassCard';
import { useBackgroundState } from '../hooks/useBackgroundState';
import type { AccuracySummary } from '../types/weather';
import { WEATHER_API_BASE } from '../utils/api';

const Dashboard: React.FC = () => {
  const { textColorClass } = useBackgroundState(undefined, new Date().getHours());
  const [accuracy, setAccuracy] = useState<AccuracySummary | null>(null);
  const [accuracyError, setAccuracyError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAccuracy = async () => {
      try {
        const response = await fetch(`${WEATHER_API_BASE}/accuracy`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Accuracy request failed: ${response.status}`);
        }

        const data = (await response.json()) as AccuracySummary;
        setAccuracy(data);
        setAccuracyError(null);
      } catch (error) {
        if ((error as Error).name === 'AbortError') return;
        setAccuracyError('Accuracy telemetry is temporarily unavailable.');
      }
    };

    void fetchAccuracy();

    return () => {
      controller.abort();
    };
  }, []);

  const accuracyStatus =
    accuracy?.status === 'measured'
      ? `${accuracy.value ?? 0}% validated`
      : 'Dataset still warming up';
  const accuracyDetail =
    accuracy?.status === 'measured'
      ? `${accuracy.sampleSize} observations available for validation`
      : 'Historical observations are not populated enough yet for measured forecast accuracy.';

  return (
    <div className="relative min-h-screen page-enter bg-[#121826] technical-page tab-container">
      <div className={`relative z-10 ${textColorClass}`}>
        <div className="text-center py-2 px-4 header-section">
          <h1 className="page-title text-gray-100 mb-1">Technical Dashboard</h1>
          <div className="mt-3 h-1 w-24 bg-slate-600 mx-auto rounded-full opacity-60" />
        </div>

        <div className="page-container py-3 space-y-3 main-content dashboard-layout">
          <div className="dashboard-grid">
            <GlassCard className="dashboard-card" style={{ scrollSnapAlign: 'start' }}>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                <i className="bi bi-graph-up-arrow mr-2" aria-hidden="true"></i>
                Prediction Accuracy
              </h3>
              <p className="text-xs text-secondary-contrast mb-3">
                Live validation status from the backend accuracy endpoint.
              </p>

              <div className="accuracy-metrics">
                <div className="space-y-3">
                  <p className="accuracy-metric-label">Forecast Reliability</p>
                  <div className="text-4xl font-bold text-gray-200">{accuracyStatus}</div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div
                      className="bg-[#D4622A]/70 h-2.5 rounded-full"
                      style={{
                        width:
                          accuracy?.status === 'measured'
                            ? `${Math.max(8, Math.min(100, accuracy.value ?? 0))}%`
                            : '18%',
                      }}
                    />
                  </div>
                  <p className="accuracy-metric-stat">{accuracyError ?? accuracyDetail}</p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">Source Label</p>
                  <div className="text-sm font-semibold text-gray-200">
                    {accuracy?.label ?? 'Loading backend telemetry'}
                  </div>
                  <p className="accuracy-metric-stat">
                    Confidence reporting is live, but richer validation slices should wait until
                    the backend exposes them explicitly.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">Observation Coverage</p>
                  <div className="text-4xl font-bold text-gray-200">{accuracy?.sampleSize ?? 0}</div>
                  <p className="accuracy-metric-stat">
                    Stored observations supporting validation and fallback behavior.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">Model Configuration</p>
                  <div className="text-sm font-semibold text-gray-200">Polynomial Regression</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip">Degree 3</span>
                    <span className="chip">90-day climatology</span>
                  </div>
                  <p className="accuracy-metric-stat">
                    Blend source: latest synced forecast plus hourly climatology.
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="dashboard-card" style={{ scrollSnapAlign: 'start' }}>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                <i className="bi bi-arrow-repeat mr-2" aria-hidden="true"></i>
                Data Pipeline
              </h3>
              <p className="text-secondary-contrast mb-3 text-xs">
                Resilient data ingestion for Tagum City weather intelligence, with cached recovery
                when OpenWeather is unavailable.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                        <i className="bi bi-bar-chart-fill mr-1" aria-hidden="true"></i> Historical Archive
                      </p>
                      <p className="text-xs text-label-contrast">Open-Meteo backfill for climatology</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-600/20 text-blue-300 border border-blue-400/60 shadow-[0_0_8px_rgba(96,165,250,0.25)]">
                      Source
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                      <i className="bi bi-broadcast mr-1" aria-hidden="true"></i>Backfill: manual
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                      <i className="bi bi-calendar-range mr-1" aria-hidden="true"></i>Window: 90d
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-folder-fill mr-1" aria-hidden="true"></i>Hourly rows
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Hourly archive: temperature, rain probability, rain amount, weather code</li>
                      <li>Refresh command: `npm --prefix server run backfill:hourly`</li>
                      <li>Materialized view: hourly_climatology_90d</li>
                    </ul>
                  </details>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                        <i className="bi bi-globe2 mr-1" aria-hidden="true"></i> OpenWeather API
                      </p>
                      <p className="text-xs text-label-contrast">Live observations and forecast feed</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-400/60 shadow-[0_0_8px_rgba(52,211,153,0.25)]">
                      Live Feed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                      <i className="bi bi-clock-fill mr-1" aria-hidden="true"></i>Current: 5 min
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                      <i className="bi bi-lightning-fill mr-1" aria-hidden="true"></i>Latency: &lt;2s
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-cloud-rain-fill mr-1" aria-hidden="true"></i>Forecast: 10 min
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Current endpoint: temperature, humidity, pressure, wind, clouds</li>
                      <li>Forecast endpoint: 24-hour rain probability, rainfall, 7-day outlook</li>
                      <li>Circuit breaker: upstream timeout and reset protection</li>
                    </ul>
                  </details>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                        <i className="bi bi-lightning-fill mr-1" aria-hidden="true"></i> Node Weather API
                      </p>
                      <p className="text-xs text-label-contrast">Express API, regression smoothing, stale recovery</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-600/20 text-amber-300 border border-amber-400/60 shadow-[0_0_8px_rgba(217,119,6,0.25)]">
                      Processing
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-gear-fill mr-1" aria-hidden="true"></i>Cache: 1h TTL
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-shield-check mr-1" aria-hidden="true"></i>Fallback: stale
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-cpu-fill mr-1" aria-hidden="true"></i>Regression: degree 3
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Forecast endpoint: `/api/v1/weather/forecast/24h`</li>
                      <li>Fallback order: fresh OpenWeather, stale memory, Supabase cloud sync</li>
                      <li>Confidence drops to Medium when restored from synced data</li>
                    </ul>
                  </details>
                </div>

                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">
                        <i className="bi bi-server mr-1" aria-hidden="true"></i> Supabase PostgreSQL
                      </p>
                      <p className="text-xs text-label-contrast">Cloud sync, climatology, fallback recovery</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-600/20 text-violet-300 border border-violet-400/60 shadow-[0_0_8px_rgba(139,92,246,0.25)]">
                      Cloud Sync
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-table mr-1" aria-hidden="true"></i>Forecasts + observations
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-calendar-fill mr-1" aria-hidden="true"></i>Climatology: 90d
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-label-alt-contrast">
                      <i className="bi bi-cloud-check-fill mr-1" aria-hidden="true"></i>Latest synced
                    </span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-tertiary-contrast cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-secondary-contrast space-y-1">
                      <li>Stores current observations, hourly observations, and daily forecasts</li>
                      <li>Feeds 90-day hourly climatology into forecast blending</li>
                      <li>Restores current weather and forecast payloads during provider downtime</li>
                    </ul>
                  </details>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="text-center py-2 text-label-contrast text-xs">
          <p>Model validation: live status, cloud sync ready.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
