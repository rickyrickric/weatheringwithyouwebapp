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
          <h1 className="page-title text-gray-100 mb-1">System Dashboard</h1>
          <div className="mt-3 h-1 w-24 bg-slate-600 mx-auto rounded-full opacity-60" />
        </div>

        <div className="page-container py-3 space-y-3 main-content dashboard-layout">
          <div className="dashboard-grid">
            <GlassCard className="dashboard-card" style={{ scrollSnapAlign: 'start' }}>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                <i className="bi bi-phone mr-2" aria-hidden="true"></i>
                App Usage
              </h3>
              <p className="text-xs text-secondary-contrast mb-3">
                The dashboard summarizes how users interact with the weather system and what each
                screen is intended to support.
              </p>

              <div className="accuracy-metrics">
                <div className="space-y-3">
                  <p className="accuracy-metric-label">Primary User Goal</p>
                  <div className="text-sm font-semibold text-gray-200">Daily weather decision support</div>
                  <p className="accuracy-metric-stat">
                    Users open the app to check current conditions, rainfall risk, and the best
                    time for outdoor or travel activity in Tagum City.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">Home Screen Usage</p>
                  <div className="text-sm font-semibold text-gray-200">Quick glance entry point</div>
                  <p className="accuracy-metric-stat">
                    The Home tab gives a fast summary of live weather so a user can immediately
                    decide whether to continue into deeper forecast analysis.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">Forecast Screen Usage</p>
                  <div className="text-sm font-semibold text-gray-200">Operational weather view</div>
                  <p className="accuracy-metric-stat">
                    The Forecast tab is the main working screen for hourly outlook, advisories,
                    7-day trend review, and sunshine-window recommendations.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">System Benefit</p>
                  <div className="text-sm font-semibold text-gray-200">Readable weather intelligence</div>
                  <p className="accuracy-metric-stat">
                    The app reduces the need to interpret raw weather data manually by converting
                    forecast values into understandable planning guidance.
                  </p>
                </div>
              </div>
            </GlassCard>

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
                    Stored observations currently available to support model validation.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="accuracy-metric-label">Current Method</p>
                  <div className="text-sm font-semibold text-gray-200">Polynomial Regression</div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="chip">Degree 3</span>
                    <span className="chip">24h forecast</span>
                    <span className="chip">90-day climatology</span>
                  </div>
                  <p className="accuracy-metric-stat">
                    Short-term forecasts are smoothed and can blend with climatology once enough
                    historical observations are available.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="text-center py-2 text-label-contrast text-xs">
          <p>Dashboard focus: user-facing app usage and forecast accuracy status.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
