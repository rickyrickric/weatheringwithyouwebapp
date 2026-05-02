import React from 'react';

interface DynamicBackgroundProps {
  temperature?: number;
  rainProbability?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'sunset';
  isOptimalWindow?: boolean;
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
}) => {
  // QA FIX: Removed all dynamic gradients and radial glows. 
  // Unified to a single flat dark slate background (#121826).

  return (
    <div className="fixed inset-0 bg-[#121826] z-0 w-screen h-screen">
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
