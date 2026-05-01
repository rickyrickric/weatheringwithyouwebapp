import React, { useMemo } from 'react';

interface DynamicBackgroundProps {
  temperature?: number;
  rainProbability?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'sunset';
  isOptimalWindow?: boolean;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  temperature = 28,
  rainProbability = 35,
  timeOfDay = 'afternoon',
  isOptimalWindow = false,
}) => {
  const getBackgroundGradient = useMemo(() => {
    let gradient = '';
    let glowColor = '';

    // If optimal window is active, use warm amber gradient
    if (isOptimalWindow) {
      gradient = 'from-amber-900/60 via-orange-900/40 to-slate-900/80';
      glowColor = 'from-amber-500/35 via-orange-500/20 to-transparent';
    }
    // Determine gradient based on weather conditions
    else if (rainProbability > 60) {
      // Rainy: cooler, grayer tones with blue energy
      gradient = 'from-slate-900 via-slate-800 to-slate-700';
      glowColor = 'from-slate-500/30 via-blue-500/20 to-transparent';
    } else if (temperature > 28) {
      // Hot: warm orange/amber tones
      gradient = 'from-amber-950 via-orange-900/50 to-slate-900';
      glowColor = 'from-orange-500/25 via-red-500/15 to-transparent';
    } else if (temperature < 20) {
      // Cool: cooler blues and cyans
      gradient = 'from-blue-950 via-slate-900 to-slate-800';
      glowColor = 'from-cyan-500/25 via-blue-500/15 to-transparent';
    } else {
      // Comfortable: purple/violet tones
      gradient = 'from-slate-900 via-purple-900/30 to-slate-900';
      glowColor = 'from-purple-500/25 via-indigo-500/15 to-transparent';
    }

    // Adjust based on time of day (only if not optimal window)
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
    <>
      <div className={`fixed inset-0 bg-gradient-to-br ${getBackgroundGradient.gradient} z-0 w-screen h-screen`} style={{ willChange: 'transform' }}>
        {/* Animated glow effects */}
        <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-radial ${getBackgroundGradient.glowColor} rounded-full blur-3xl animate-pulse`}
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

        {/* Raindrop effects for high rain probability */}
        {rainProbability > 50 && (
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`drop-${i}`}
                className="absolute w-0.5 h-8 bg-gradient-to-b from-cyan-300 to-cyan-400/0 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `fall ${1.5 + Math.random() * 1.5}s linear infinite`,
                  animationDelay: `${i * 0.1}s`,
                  opacity: 0.3 + Math.random() * 0.4,
                }}
              />
            ))}
          </div>
        )}

        {/* Particle effects */}
        {rainProbability > 30 && (
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-white/40 rounded-full blur-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `drift ${8 + Math.random() * 4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes drift {
          0%, 100% {
            opacity: 0.2;
            transform: translate(0, 0);
          }
          50% {
            opacity: 0.4;
            transform: translate(20px, -20px);
          }
        }
      `}</style>
    </>
  );
};

export default DynamicBackground;
