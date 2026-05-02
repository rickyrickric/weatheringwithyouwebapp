import React, { useMemo } from 'react';

interface DynamicBackgroundProps {
  temperature?: number;
  rainProbability?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'sunset';
  isOptimalWindow?: boolean;
}

// Stable random seed arrays generated once at module level — prevents
// positions from shifting on every re-render (Math.random() in JSX is an anti-pattern).
const DROP_POSITIONS = Array.from({ length: 20 }, (_, i) => ({
  left: (((i * 51) % 97) + 3),   // pseudo-random but deterministic
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
  temperature = 28,
  rainProbability = 35,
  timeOfDay = 'afternoon',
  isOptimalWindow = false,
}) => {
  const { gradient, glowColor } = useMemo(() => {
    let gradient = '';
    let glowColor = '';

    if (isOptimalWindow) {
      gradient = 'from-amber-900/60 via-orange-900/40 to-slate-900/80';
      glowColor = 'from-amber-500/35 via-orange-500/20 to-transparent';
    } else if (rainProbability > 60) {
      gradient = 'from-slate-900 via-slate-800 to-slate-700';
      glowColor = 'from-slate-500/30 via-blue-500/20 to-transparent';
    } else if (temperature > 28) {
      gradient = 'from-amber-950 via-orange-900/50 to-slate-900';
      glowColor = 'from-orange-500/25 via-red-500/15 to-transparent';
    } else if (temperature < 20) {
      gradient = 'from-blue-950 via-slate-900 to-slate-800';
      glowColor = 'from-cyan-500/25 via-blue-500/15 to-transparent';
    } else {
      gradient = 'from-slate-900 via-purple-900/30 to-slate-900';
      glowColor = 'from-purple-500/25 via-indigo-500/15 to-transparent';
    }

    if (!isOptimalWindow) {
      if (timeOfDay === 'sunset') {
        gradient = 'from-orange-900 via-purple-900 to-slate-900';
        glowColor = 'from-orange-500/30 via-pink-500/20 to-transparent';
      } else if (timeOfDay === 'night') {
        gradient = 'from-slate-950 via-slate-900 to-slate-800';
        glowColor = 'from-blue-500/15 via-purple-500/10 to-transparent';
      }
    }

    return { gradient, glowColor };
  }, [temperature, rainProbability, timeOfDay, isOptimalWindow]);

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${gradient} z-0 w-screen h-screen`} style={{ willChange: 'transform' }}>
      {/* Animated glow effects */}
      <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-radial ${glowColor} rounded-full blur-3xl`}
          style={{
            animation: `pulse ${rainProbability > 50 ? '3s' : '4s'} ease-in-out infinite`,
          }}
        />
        {rainProbability > 40 && (
          <div className="absolute top-0 right-0 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl opacity-50" />
        )}
        {temperature > 28 && (
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-40" />
        )}
      </div>

      {/* Raindrop effects — positions are stable (no Math.random in JSX) */}
      {rainProbability > 50 && (
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          {DROP_POSITIONS.map((drop, i) => (
            <div
              key={`drop-${i}`}
              className="absolute w-0.5 h-8 bg-gradient-to-b from-cyan-300 to-cyan-400/0 rounded-full"
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

      {/* Particle effects — positions are stable */}
      {rainProbability > 30 && (
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {PARTICLE_POSITIONS.map((p, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-white/40 rounded-full blur-sm"
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
