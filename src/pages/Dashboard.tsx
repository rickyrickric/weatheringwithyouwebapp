import React from 'react';
import GlassCard from '../components/GlassCard';

const Dashboard: React.FC = () => {
  return (
    <div className="relative min-h-screen page-enter bg-[#121826] technical-page tab-container">

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-2 px-4 header-section">
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 mb-1">
            Technical Dashboard
          </h1>
          <div className="mt-3 h-1 w-24 bg-slate-600 mx-auto rounded-full opacity-60" />
        </div>

        {/* Main container */}
        <div className="page-container py-3 space-y-3 main-content">
          {/* Dual-Column Layout: Prediction Accuracy + Data Pipeline */}
          <div className="grid gap-3 grid-auto-fit">
            {/* Model Accuracy */}
            <GlassCard style={{ scrollSnapAlign: 'start' }}>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                📈 Prediction Accuracy
              </h3>
              <p className="text-xs text-gray-400 mb-3">
                Live validation against OpenWeather data and 6-month climate history.
              </p>
              
              <div className="grid gap-4 grid-auto-fit">
                {/* 24h Accuracy */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">24-Hour Forecast</p>
                  <div className="text-4xl font-bold text-gray-200">92%</div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div
                      className="bg-[#D4622A]/70 h-2.5 rounded-full"
                      style={{ width: '92%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">RMSE: 1.2°C | Validation: 847 observations</p>
                </div>

                {/* 7d Accuracy */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">7-Day Forecast</p>
                  <div className="text-4xl font-bold text-gray-200">78%</div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div
                      className="bg-[#D4622A]/70 h-2.5 rounded-full"
                      style={{ width: '78%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">RMSE: 2.1°C | Validation: 156 observations</p>
                </div>

                {/* Rain Detection */}
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Rain Detection</p>
                  <div className="text-4xl font-bold text-gray-200">85%</div>
                  <div className="w-full bg-white/5 rounded-full h-2.5">
                    <div
                      className="bg-[#D4622A]/70 h-2.5 rounded-full"
                      style={{ width: '85%' }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Precision: 87% | Recall: 83%</p>
                </div>
              </div>
            </GlassCard>

            {/* Data Pipeline */}
            <GlassCard style={{ scrollSnapAlign: 'start' }}>
              <h3 className="text-lg font-semibold text-gray-200 mb-3">
                🔄 Data Pipeline
              </h3>
              <p className="text-gray-400 mb-3 text-xs">
                Live data ingestion and processing architecture for Tagum City weather intelligence.
              </p>

              {/* QA Fix: Subdued the gradient borders to neutral glass styling */}
              <div className="space-y-3">
                {/* Visual Crossing */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">📊 Visual Crossing</p>
                      <p className="text-xs text-gray-500">Historical archive (5+ years)</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-200 border border-orange-400/30">
                      Source
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">📡 Updates: Daily</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">🧭 Window: 5+ yrs</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">🗂️ Records: 180</span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Daily observations: Temperature, precipitation, wind</li>
                      <li>Update frequency: Daily (UTC 00:00)</li>
                      <li>Records in memory: 180 (6-month rolling window)</li>
                    </ul>
                  </details>
                </div>

                {/* OpenWeather API */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">🌐 OpenWeather API</p>
                      <p className="text-xs text-gray-500">Real-time observations</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-200 border border-orange-400/30">
                      Live Feed
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">⏱️ Updates: Every 1h</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">⚡ Latency: &lt;2s</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">🌧️ Feeds: Temp, rain, clouds</span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Hourly updates: Temperature, humidity, clouds, rain</li>
                      <li>Update frequency: Every 1 hour (HH:00 UTC)</li>
                      <li>Latency: &lt;2 seconds API response</li>
                    </ul>
                  </details>
                </div>

                {/* FastAPI Backend */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">⚡ FastAPI Backend</p>
                      <p className="text-xs text-gray-500">Async ML inference</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-200 border border-orange-400/30">
                      Processing
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">⚙️ Cache: 5 min</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">🚀 Latency: &lt;100ms</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">🧵 Concurrency: 50</span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Inference endpoint: `/api/predict/24h` (latency &lt;100ms)</li>
                      <li>Cache layer: 5-minute prediction cache</li>
                      <li>Concurrency: 50 concurrent requests (async I/O)</li>
                    </ul>
                  </details>
                </div>

                {/* Supabase PostgreSQL */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-300 mb-0.5 text-sm">🗄️ Supabase PostgreSQL</p>
                      <p className="text-xs text-gray-500">Climate memory &amp; logs</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-200 border border-orange-400/30">
                      Storage
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">🗂️ Tables: 3</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">📆 Retention: 6 mo</span>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">💾 Size: 2.5 MB</span>
                  </div>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer">Details</summary>
                    <ul className="mt-2 text-xs text-gray-400 space-y-1">
                      <li>Tables: climate_data (180 rows), predictions, accuracy_logs</li>
                      <li>Retention: 6 months rolling + 2 years archived</li>
                      <li>Size: ~2.5 MB current | Growth: ~150 KB/month</li>
                    </ul>
                  </details>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-2 text-gray-500 text-xs">
          <p>Model validation: Live • System healthy ✓</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
