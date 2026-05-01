import React, { useState } from 'react';

interface CurrentConditionsHeroProps {
  temperature: number;
  condition: string;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  location: string;
  lastUpdated: Date;
  feelsLike?: number;
  compact?: boolean; // For Split-Hero Grid layout
}

interface TooltipState {
  [key: string]: boolean;
}

const CurrentConditionsHero: React.FC<CurrentConditionsHeroProps> = ({
  temperature,
  condition,
  rainChance,
  humidity,
  windSpeed,
  location,
  lastUpdated,
  feelsLike = 26,
  compact = false,
}) => {
  const [hoveredMetric, setHoveredMetric] = useState<TooltipState>({});
  
  const getWeatherEmoji = (cond: string) => {
    switch (cond.toLowerCase()) {
      case 'sunny':
        return '☀️';
      case 'rainy':
        return '🌧️';
      case 'cloudy':
        return '☁️';
      case 'clear':
        return '✨';
      default:
        return '🌤️';
    }
  };

  if (compact) {
    // Split-Hero Grid: Right-side hero card (compact, light theme)
    return (
      <div className="glass-card-light overflow-hidden flex flex-col">
        {/* Header with time */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-6xl">{getWeatherEmoji(condition)}</span>
            <div>
              <p className="text-4xl font-bold text-openweather-primary">
                {temperature}°C
              </p>
              <p className="text-sm text-openweather-textLight capitalize">
                {condition} in {location}
              </p>
            </div>
          </div>
        </div>

        {/* Feels Like prominently displayed */}
        <div className="px-6 py-4 bg-openweather-primary/5">
          <p className="text-xs text-openweather-textLight uppercase tracking-widest font-semibold mb-1">
            Feels Like
          </p>
          <p className="text-3xl font-bold text-openweather-text">
            {feelsLike}°C
          </p>
        </div>

        {/* Quick metrics footer */}
        <div className="px-6 py-4 grid grid-cols-2 gap-3 border-t border-gray-200">
          <div>
            <p className="text-xs text-openweather-textLight uppercase font-semibold">
              Rain Probability
            </p>
            <p className="text-2xl font-bold text-openweather-secondary">
              {rainChance}%
            </p>
          </div>
          <div>
            <p className="text-xs text-openweather-textLight uppercase font-semibold">
              Last Updated
            </p>
            <p className="text-sm font-mono text-openweather-text">
              {lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Original immersive layout (for backwards compatibility)
  return (
    <div className="relative w-full mb-8">
      {/* Immersive Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-blue-500/5 to-purple-500/10 rounded-3xl blur-2xl" />

      {/* Glass Card Container */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 overflow-hidden">
        {/* Decorative gradient corners */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-orange-400/20 to-transparent rounded-full blur-3xl -ml-20 -mt-20" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-cyan-400/20 to-transparent rounded-full blur-3xl -mr-20 -mb-20" />

        <div className="relative z-10">
          {/* Main Temperature Display */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-start gap-6">
              <div className="text-8xl md:text-9xl filter drop-shadow-lg opacity-80 hover:opacity-100 transition-opacity" style={{ textShadow: '0 0 12px rgba(249, 115, 22, 0.3), 0 0 4px rgba(249, 115, 22, 0.2)' }}>
                {getWeatherEmoji(condition)}
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-orange-500 leading-tight">
                  {temperature}°
                </div>
                <p className="text-gray-400 text-lg mt-2 capitalize">{condition} in {location}</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-right">
              <p className="text-gray-500 text-sm">Last updated</p>
              <p className="text-gray-300 font-mono">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          {/* Secondary Metrics - Horizontal Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
            {/* Rain Chance */}
            <div 
              className="space-y-2 relative group cursor-help"
              onMouseEnter={() => setHoveredMetric({ ...hoveredMetric, rain: true })}
              onMouseLeave={() => setHoveredMetric({ ...hoveredMetric, rain: false })}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Rain Probability</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-cyan-400">{rainChance}</span>
                <span className="text-gray-400">%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${rainChance}%` }}
                />
              </div>
              {hoveredMetric.rain && (
                <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/20 rounded-lg p-2 text-xs text-gray-200 whitespace-nowrap z-10 backdrop-blur">
                  Probability of rainfall in next 24h
                </div>
              )}
            </div>

            {/* Humidity */}
            <div 
              className="space-y-2 relative group cursor-help"
              onMouseEnter={() => setHoveredMetric({ ...hoveredMetric, humidity: true })}
              onMouseLeave={() => setHoveredMetric({ ...hoveredMetric, humidity: false })}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Humidity</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-400">{humidity}</span>
                <span className="text-gray-400">%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${humidity}%` }}
                />
              </div>
              {hoveredMetric.humidity && (
                <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/20 rounded-lg p-2 text-xs text-gray-200 whitespace-nowrap z-10 backdrop-blur">
                  Water vapor in air mass
                </div>
              )}
            </div>

            {/* Wind Speed */}
            <div 
              className="space-y-2 relative group cursor-help"
              onMouseEnter={() => setHoveredMetric({ ...hoveredMetric, wind: true })}
              onMouseLeave={() => setHoveredMetric({ ...hoveredMetric, wind: false })}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Wind Speed</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-400">{windSpeed}</span>
                <span className="text-gray-400">km/h</span>
              </div>
              <p className="text-gray-500 text-xs">
                {windSpeed < 10 ? 'Calm' : windSpeed < 20 ? 'Light' : 'Moderate'}
              </p>
              {hoveredMetric.wind && (
                <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/20 rounded-lg p-2 text-xs text-gray-200 whitespace-nowrap z-10 backdrop-blur">
                  Surface wind velocity from SW
                </div>
              )}
            </div>

            {/* Feels Like */}
            <div 
              className="space-y-2 relative group cursor-help"
              onMouseEnter={() => setHoveredMetric({ ...hoveredMetric, feelsLike: true })}
              onMouseLeave={() => setHoveredMetric({ ...hoveredMetric, feelsLike: false })}
            >
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Feels Like</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-orange-400">{feelsLike}</span>
                <span className="text-gray-400">°C</span>
              </div>
              <p className="text-gray-500 text-xs">Cooler with wind</p>
              {hoveredMetric.feelsLike && (
                <div className="absolute bottom-full left-0 mb-2 bg-slate-800 border border-white/20 rounded-lg p-2 text-xs text-gray-200 whitespace-nowrap z-10 backdrop-blur">
                  Apparent temperature (wind-adjusted)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentConditionsHero;
