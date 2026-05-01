import React from 'react';

interface CurrentConditionsHeroProps {
  temperature: number;
  condition: string;
  rainChance: number;
  humidity: number;
  windSpeed: number;
  location: string;
  lastUpdated: Date;
}

const CurrentConditionsHero: React.FC<CurrentConditionsHeroProps> = ({
  temperature,
  condition,
  rainChance,
  humidity,
  windSpeed,
  location,
  lastUpdated,
}) => {
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
              <div className="text-8xl md:text-9xl filter drop-shadow-lg opacity-90">
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
            <div className="space-y-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Rain Chance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-cyan-400">{rainChance}</span>
                <span className="text-gray-400">%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full"
                  style={{ width: `${rainChance}%` }}
                />
              </div>
            </div>

            {/* Humidity */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Humidity</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-blue-400">{humidity}</span>
                <span className="text-gray-400">%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full"
                  style={{ width: `${humidity}%` }}
                />
              </div>
            </div>

            {/* Wind Speed */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Wind Speed</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-400">{windSpeed}</span>
                <span className="text-gray-400">km/h</span>
              </div>
              <p className="text-gray-500 text-xs">
                {windSpeed < 10 ? 'Calm' : windSpeed < 20 ? 'Light' : 'Moderate'}
              </p>
            </div>

            {/* Feels Like / UV Index placeholder */}
            <div className="space-y-2">
              <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold">Feels Like</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-orange-400">{temperature - 2}</span>
                <span className="text-gray-400">°C</span>
              </div>
              <p className="text-gray-500 text-xs">Cooler with wind</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentConditionsHero;
