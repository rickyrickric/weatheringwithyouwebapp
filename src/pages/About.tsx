import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import { useBackgroundState } from '../hooks/useBackgroundState';

const About: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("About");
  // Get dynamic text color based on background state
  const { textColorClass } = useBackgroundState(undefined, new Date().getHours());

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

  return (
    <div className="relative min-h-screen page-enter bg-[#121826] technical-page tab-container">

      <div className={`relative z-10 ${textColorClass}`}>
        {/* Header - QA Fix: Removed gradient text */}
        <div className="text-center py-2 px-4 header-section">
          <h1 className="page-title text-gray-100 mb-1">
            About This Project
          </h1>
          <div className="mt-3 h-1 w-24 bg-slate-600 mx-auto rounded-full opacity-60" />
        </div>

        {/* Main container */}
        <div className="page-container py-3 space-y-2 main-content">
          <div className="about-top-grid">
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
                      <p className="text-[10px] text-label-contrast">Seamless navigation between tabs</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="font-semibold text-gray-200 text-xs">Recharts</p>
                      <p className="text-[10px] text-label-contrast">Dual-axis data visualization</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-gray-100 flex items-center gap-1">
                    ⚡ Backend & ML
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                    <div className="p-2 bg-white/5 rounded border-l-4 border-amber-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">FastAPI</p>
                      <p className="text-[10px] text-label-contrast">Async Python web framework</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-fuchsia-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Scikit-Learn</p>
                      <p className="text-[10px] text-label-contrast">Polynomial Regression (Degree 4)</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border-l-4 border-violet-400/70 border border-white/10">
                      <p className="font-semibold text-gray-200 text-sm">Supabase</p>
                      <p className="text-[10px] text-label-contrast">PostgreSQL + Auth + Real-time</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="font-semibold text-gray-200 text-xs">OpenWeather API</p>
                      <p className="text-[10px] text-label-contrast">Live weather data feed</p>
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
            <p className="text-xs text-secondary-contrast mb-3">
              End-to-end weather intelligence pipeline for Tagum City.
            </p>
            <div className="grid gap-2 grid-auto-fit text-xs">
              <div className="arch-node">
                <p className="node-label">CSV / APIs</p>
                <p className="node-sub">OpenWeather + Visual Crossing</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">➜</span>
              </div>
              <div className="arch-node">
                <p className="node-label">ML Model</p>
                <p className="node-sub">Scikit-Learn (Poly Reg)</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">➜</span>
              </div>
              <div className="arch-node">
                <p className="node-label">FastAPI</p>
                <p className="node-sub">Prediction + Cache</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">➜</span>
              </div>
              <div className="arch-node">
                <p className="node-label">Supabase</p>
                <p className="node-sub">Climate memory</p>
              </div>
              <div className="hidden md:flex items-center justify-center">
                <span className="text-[#E8541A] text-xl">➜</span>
              </div>
              <div className="arch-node">
                <p className="node-label">React UI</p>
                <p className="node-sub">Forecast + Dashboard</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="key-features-card">
            <h2 className="text-lg font-bold text-gray-100 mb-3">
              ✨ Key Features
            </h2>
            <div className="grid gap-2 grid-auto-fit">
              <ul className="space-y-2 text-xs">
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Dual-Axis Chart:</span> Temperature & rain probability side-by-side</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Sunshine Windows:</span> Actionable weather recommendations</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Dynamic Background:</span> Responds to real-time weather</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Climate Memory:</span> 6-month historical baseline</span>
                </li>
              </ul>
              <ul className="space-y-2 text-xs">
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Prayer System:</span> Log sunshine wishes (future: gamification)</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Glassmorphic UI:</span> Aesthetic consistency throughout</span>
                </li>
                <li className="key-feature-item flex items-start gap-1.5">
                  <span className="text-[#E8541A]">→</span>
                  <span><span className="key-feature-label">Multi-Tab Navigation:</span> Home, Forecast, Dashboard, About</span>
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

        {/* Bottom Navigation */}
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "rgba(15,20,30,0.90)",
          borderTop: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(16px)",
          display: "flex", justifyContent: "center", gap: 8,
          padding: "12px 0 16px",
          zIndex: 100,
        }}>
          {[
            { label: "Home", icon: "🏠" },
            { label: "Forecast", icon: "☁️" },
            { label: "Dashboard", icon: "📊" },
            { label: "About", icon: "ℹ️" },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => handleNavigation(tab.label)}
              style={{
                background: activeTab === tab.label ? "#e07b39" : "rgba(255,255,255,0.08)",
                border: "1px solid " + (activeTab === tab.label ? "#e07b39" : "rgba(255,255,255,0.12)"),
                borderRadius: 24,
                color: "#f5ede0",
                padding: "8px 20px",
                fontSize: 13,
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all 0.2s",
              }}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default About;
