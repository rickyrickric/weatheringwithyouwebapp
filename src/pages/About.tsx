import React from 'react';
import GlassCard from '../components/GlassCard';

const About: React.FC = () => {
  return (
    <div className="relative min-h-screen page-enter bg-[#121826] technical-page tab-container">

      <div className="relative z-10">
        {/* Header - QA Fix: Removed gradient text */}
        <div className="text-center py-2 px-4 header-section">
          <h1 className="text-2xl md:text-2.5xl font-bold text-gray-100 mb-1">
            About This Project
          </h1>
          <div className="mt-3 h-1 w-24 bg-slate-600 mx-auto rounded-full opacity-60" />
        </div>

        {/* Main container */}
        <div className="page-container py-3 space-y-2 main-content">
          <div className="grid gap-2 grid-auto-fit">
            <GlassCard>
              <h2 className="text-lg font-bold text-gray-100 mb-3">
                🎬 Inspiration: "Tenki no Ko" (Weathering with You)
              </h2>
              <div className="space-y-3 text-gray-400 text-sm">
                <p className="leading-relaxed text-xs">
                  This project draws inspiration from the beautiful anime film <strong>"Tenki no Ko"</strong> (Weathering with You), where weather forecasting transcends mere meteorology and becomes an act of connection, sacrifice, and hope.
                </p>
                <details className="text-gray-400">
                  <summary className="text-xs text-gray-300 cursor-pointer">Read more</summary>
                  <div className="mt-2 space-y-3">
                    <p className="leading-relaxed text-xs">
                      In the film, the protagonist Hodaka discovers that the heroine Hina possesses the ability to influence weather—a power tied to the climate itself. Their journey explores themes of destiny, love, and the intersection between human choice and natural phenomena.
                    </p>
                    <p className="leading-relaxed italic text-gray-500 text-xs">
                      "A prayer for the palm city" encapsulates this philosophy: we don't merely predict weather—we understand the emotional and practical dimensions of atmospheric conditions. We recognize that sunshine and rain carry meaning beyond data points.
                    </p>
                  </div>
                </details>
              </div>
            </GlassCard>

            <GlassCard>
              <h2 className="text-lg font-bold text-gray-100 mb-3">
                ⚙️ Technology Stack
              </h2>
              <div className="grid gap-3 grid-auto-fit">
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-100 flex items-center gap-1">
                    🎨 Frontend
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-white/5 rounded border-l-4 border-emerald-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">React 19</p>
                      <p className="text-[10px] text-gray-500">Component-based UI with hooks</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-sky-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Tailwind CSS</p>
                      <p className="text-[10px] text-gray-500">Glassmorphic design system</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                      <div className="p-1.5 bg-white/5 rounded border border-white/10">
                        <p className="font-semibold text-gray-200 text-xs">React Router v7</p>
                        <p className="text-[10px] text-gray-500">Seamless navigation between tabs</p>
                      </div>
                      <div className="p-1.5 bg-white/5 rounded border border-white/10">
                        <p className="font-semibold text-gray-200 text-xs">Recharts</p>
                        <p className="text-[10px] text-gray-500">Dual-axis data visualization</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-100 flex items-center gap-1">
                    ⚡ Backend & ML
                  </h3>
                  <div className="space-y-2">
                    <div className="p-2 bg-white/5 rounded border-l-4 border-amber-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">FastAPI</p>
                      <p className="text-[10px] text-gray-500">Async Python web framework</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-fuchsia-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Scikit-Learn</p>
                      <p className="text-[10px] text-gray-500">Polynomial Regression (Degree 4)</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-violet-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Supabase</p>
                      <p className="text-[10px] text-gray-500">PostgreSQL + Auth + Real-time</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                      <div className="p-1.5 bg-white/5 rounded border border-white/10">
                        <p className="font-semibold text-gray-200 text-xs">OpenWeather API</p>
                        <p className="text-[10px] text-gray-500">Live weather data feed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <h2 className="text-lg font-bold text-gray-100 mb-3">
              🏗️ Architecture Overview
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              End-to-end weather intelligence pipeline for Tagum City.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs text-gray-300">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="font-semibold text-gray-200">CSV / APIs</p>
                <p className="text-[10px] text-gray-500 mt-1">OpenWeather + Visual Crossing</p>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-500">→</div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="font-semibold text-gray-200">ML Model</p>
                <p className="text-[10px] text-gray-500 mt-1">Scikit-Learn (Poly Reg)</p>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-500">→</div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="font-semibold text-gray-200">FastAPI</p>
                <p className="text-[10px] text-gray-500 mt-1">Prediction + Cache</p>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-500">→</div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="font-semibold text-gray-200">Supabase</p>
                <p className="text-[10px] text-gray-500 mt-1">Climate memory</p>
              </div>
              <div className="hidden md:flex items-center justify-center text-gray-500">→</div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                <p className="font-semibold text-gray-200">React UI</p>
                <p className="text-[10px] text-gray-500 mt-1">Forecast + Dashboard</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-lg font-bold text-gray-100 mb-3">
              ✨ Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Dual-Axis Chart:</strong> Temperature & rain probability side-by-side</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Sunshine Windows:</strong> Actionable weather recommendations</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Dynamic Background:</strong> Responds to real-time weather</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Climate Memory:</strong> 6-month historical baseline</span>
                </li>
              </ul>
              <ul className="space-y-2 text-xs text-gray-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Prayer System:</strong> Log sunshine wishes (future: gamification)</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Glassmorphic UI:</strong> Aesthetic consistency throughout</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Multi-Tab Navigation:</strong> Home, Forecast, Dashboard, About</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-slate-500">→</span>
                  <span><strong>Responsive Design:</strong> Mobile-first, works on all devices</span>
                </li>
              </ul>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center py-2 text-gray-500 text-xs">
          <p>Built with love, data, and a prayer for perfect weather ✨</p>
        </div>
      </div>
    </div>
  );
};

export default About;
