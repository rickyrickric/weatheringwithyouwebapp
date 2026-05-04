import React from 'react';

import bgSunshine from '../assets/forecast_sunshine.png';
import bgCloudy from '../assets/forecast_cloudy.png';
import bgRaining from '../assets/forecast_raining.png';
import bgStorm from '../assets/forecast_storm.png';
import bgNighttime from '../assets/forecast_nighttime.png';

interface DynamicBackgroundProps {
  temperature?: number;
  rainProbability?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'sunset';
  isOptimalWindow?: boolean;
  transparentBase?: boolean;
  weatherId?: number;
  currentHour?: number;
}

// Stable random seed arrays generated once at module level
const DROP_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  left: (((i * 51) % 97) + 3),
  top: (((i * 37) % 89) + 5),
  duration: 1.5 + ((i * 0.17) % 1.5),
  delay: i * 0.1,
  opacity: 0.3 + ((i * 0.04) % 0.4),
}));

const PARTICLE_POSITIONS = Array.from({ length: 8 }, (_, i) => ({
  left: (((i * 73) % 91) + 4),
  top: (((i * 43) % 83) + 7),
  duration: 8 + ((i * 0.61) % 4),
  delay: i * 0.5,
}));

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  rainProbability = 35,
  timeOfDay,
  transparentBase = false,
  weatherId,
  currentHour,
}) => {
  // Determine background image based on OpenWeather API ID
  const getBackgroundImage = () => {
    if (transparentBase) return undefined;
    const resolvedHour = currentHour ?? new Date().getHours();
    const isNightHours = resolvedHour >= 18 || resolvedHour < 5;
    const isNightTimeOfDay = timeOfDay === 'night' || timeOfDay === 'evening' || timeOfDay === 'sunset';

    if (isNightHours || isNightTimeOfDay) return bgNighttime;
    if (!weatherId) return bgSunshine;
    if (weatherId >= 200 && weatherId < 300) return bgStorm;
    if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) return bgRaining;
    if (weatherId >= 802 && weatherId <= 804) return bgCloudy;
    if (weatherId === 800 || weatherId === 801) return bgSunshine;
    return bgSunshine;
  };

  const backgroundImage = getBackgroundImage();

  return (
    <div className={`fixed inset-0 z-0 w-screen h-screen ${transparentBase ? 'bg-transparent' : 'bg-[#121826]'}`}>
      {/* Background Image with Global Scrim */}
      {backgroundImage && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          {/* Top scrim for header legibility without obscuring the scene */}
          <div className="absolute top-0 left-0 right-0 h-[40vh] bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
        </div>
      )}

      {/* Raindrop effects — kept for thematic relevance but without background glowing */}
      {rainProbability > 50 && (
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          {DROP_POSITIONS.map((drop, i) => (
            <div
              key={`drop-${i}`}
              className="absolute w-0.5 h-8 bg-gradient-to-b from-slate-400 to-transparent rounded-full"
              style={{
                left: `${drop.left}%`,
                top: `${drop.top}%`,
                animation: `fall ${drop.duration}s linear infinite`,
                animationDelay: `${drop.delay}s`,
                opacity: drop.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Particle effects — kept but color muted to slate */}
      {rainProbability > 30 && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          {PARTICLE_POSITIONS.map((p, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-slate-300 rounded-full blur-sm"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                animation: `drift ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DynamicBackground;
