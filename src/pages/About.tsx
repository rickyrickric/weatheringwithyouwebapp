import React from 'react';
import GlassCard from '../components/GlassCard';
import DynamicBackground from '../components/DynamicBackground';

const About: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <DynamicBackground
        temperature={28}
        rainProbability={35}
        timeOfDay="afternoon"
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="text-center py-8 px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
            About This Project
          </h1>
          <p className="text-gray-400">Inspiration, technology, and vision</p>
          <div className="mt-4 h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full opacity-60" />
        </div>

        {/* Main container */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Inspiration */}
          <GlassCard>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-yellow-300 mb-6">
              🎬 Inspiration: "Tenki no Ko" (Weathering with You)
            </h2>
            <div className="space-y-4 text-gray-300">
              <p className="leading-relaxed">
                This project draws inspiration from the beautiful anime film <strong>"Tenki no Ko"</strong> (Weathering with You), where weather forecasting transcends mere meteorology and becomes an act of connection, sacrifice, and hope.
              </p>
              <p className="leading-relaxed">
                In the film, the protagonist Hodaka discovers that the heroine Hina possesses the ability to influence weather—a power tied to the climate itself. Their journey explores themes of destiny, love, and the intersection between human choice and natural phenomena.
              </p>
              <p className="leading-relaxed italic text-gray-400">
                "A prayer for the palm city" encapsulates this philosophy: we don't merely predict weather—we understand the emotional and practical dimensions of atmospheric conditions. We recognize that sunshine and rain carry meaning beyond data points.
              </p>
            </div>
          </GlassCard>

          {/* Tech Stack */}
          <GlassCard>
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">
              ⚙️ Technology Stack
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frontend */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-blue-300 flex items-center gap-2">
                  <span>🎨</span> Frontend
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-blue-400">React 19</p>
                    <p className="text-xs text-gray-500">Component-based UI with hooks</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-cyan-400">React Router v7</p>
                    <p className="text-xs text-gray-500">Seamless navigation between tabs</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-purple-400">Tailwind CSS</p>
                    <p className="text-xs text-gray-500">Glassmorphic design system</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-orange-400">Recharts</p>
                    <p className="text-xs text-gray-500">Dual-axis data visualization</p>
                  </div>
                </div>
              </div>

              {/* Backend & ML */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-300 flex items-center gap-2">
                  <span>⚡</span> Backend & ML
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-green-400">FastAPI</p>
                    <p className="text-xs text-gray-500">Async Python web framework</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-emerald-400">Scikit-Learn</p>
                    <p className="text-xs text-gray-500">Polynomial Regression (Degree 4)</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-teal-400">Supabase</p>
                    <p className="text-xs text-gray-500">PostgreSQL + Auth + Real-time</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded border border-white/10">
                    <p className="font-semibold text-cyan-400">OpenWeather API</p>
                    <p className="text-xs text-gray-500">Live weather data feed</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Project Architecture */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 mb-6">
              🏗️ Architecture Overview
            </h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded border border-blue-400/30">
                <p className="font-semibold text-blue-300 mb-2">Data Flow</p>
                <p className="text-xs text-gray-400 font-mono">
                  OpenWeather API → FastAPI Backend → Scikit-Learn Model → React UI
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded border border-purple-400/30">
                <p className="font-semibold text-purple-300 mb-2">Database Layer</p>
                <p className="text-xs text-gray-400">
                  Supabase PostgreSQL stores 6-month climate memory, prediction logs, and user "sunshine prayers"
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded border border-orange-400/30">
                <p className="font-semibold text-orange-300 mb-2">ML Pipeline</p>
                <p className="text-xs text-gray-400">
                  Polynomial Regression (Degree 4) trained on historical data; 92% 24h accuracy, 78% 7d accuracy
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Key Features */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-6">
              ✨ Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-orange-400 text-lg">→</span>
                  <span><strong>Dual-Axis Chart:</strong> Temperature & rain probability side-by-side</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 text-lg">→</span>
                  <span><strong>Sunshine Windows:</strong> Actionable weather recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 text-lg">→</span>
                  <span><strong>Dynamic Background:</strong> Responds to real-time weather</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-400 text-lg">→</span>
                  <span><strong>Climate Memory:</strong> 6-month historical baseline</span>
                </li>
              </ul>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 text-lg">→</span>
                  <span><strong>Prayer System:</strong> Log sunshine wishes (future: gamification)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-400 text-lg">→</span>
                  <span><strong>Glassmorphic UI:</strong> Aesthetic consistency throughout</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 text-lg">→</span>
                  <span><strong>Multi-Tab Navigation:</strong> Home, Forecast, Dashboard, About</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-400 text-lg">→</span>
                  <span><strong>Responsive Design:</strong> Mobile-first, works on all devices</span>
                </li>
              </ul>
            </div>
          </GlassCard>

          {/* Team & Credits */}
          <GlassCard>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400 mb-6">
              👥 Credits & Future Roadmap
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">🎥 Inspiration</h3>
                <p className="text-sm text-gray-400">
                  Film: "Tenki no Ko" (Weathering with You) - © Makoto Shinkai, CoMix Wave Films
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">🔮 Future Enhancements</h3>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• Gamification: Prayer streak tracking, community forecast accuracy leaderboard</li>
                  <li>• Push notifications: "Your Sunshine Window is here!" alerts</li>
                  <li>• Photo sharing: Users upload photos during optimal weather windows</li>
                  <li>• Multi-city support: Expand beyond Tagum City to other Philippine regions</li>
                  <li>• Advanced ML: LSTM for seasonal patterns, ensemble methods for robustness</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Footer */}
        <div className="text-center py-12 text-gray-500 text-sm">
          <p>Built with love, data, and a prayer for perfect weather ✨</p>
        </div>
      </div>
    </div>
  );
};

export default About;
