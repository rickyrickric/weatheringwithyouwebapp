import React from 'react';

interface SunshineWindowProps {
  timeWindow: string;
  temperature: number;
  rainChance: number;
  condition: 'optimal' | 'good' | 'fair';
  description: string;
  emoji?: string;
  isActive?: boolean;
}

// QA FIX P2: Unified status card fills to a single hue family (orange) with opacity variation
const conditionStyles = {
  optimal: {
    bg: 'bg-[#D4622A]/80',
    border: 'border-[#D4622A]/45',
    badge: 'bg-[#D4622A]/30 text-orange-100',
    activeBorder: 'border-[#D4622A]/80',
  },
  good: {
    bg: 'bg-[#D4622A]/55',
    border: 'border-[#D4622A]/30',
    badge: 'bg-[#D4622A]/20 text-orange-100/80',
    activeBorder: 'border-[#D4622A]/60',
  },
  fair: {
    bg: 'bg-[#D4622A]/25',
    border: 'border-[#D4622A]/20',
    badge: 'bg-[#D4622A]/10 text-orange-100/60',
    activeBorder: 'border-[#D4622A]/40',
  },
};

const SunshineWindow: React.FC<SunshineWindowProps> = ({
  timeWindow,
  temperature,
  rainChance,
  condition,
  description,
  emoji = '☀️',
  isActive = false,
}) => {
  const styles = conditionStyles[condition];

  return (
    <div
      className={`glass-card p-4 ${styles.bg} border-l-4 ${
        isActive ? `${styles.activeBorder} active-window-glow` : styles.border
      } hover:bg-opacity-80 transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-white">{timeWindow}</p>
            <p className="text-xs text-gray-300/80">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isActive && (
            <span className="now-pulse inline-block w-2 h-2 rounded-full bg-orange-400" />
          )}
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles.badge}`}>
            {isActive ? 'ACTIVE' : condition.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">🌡️</span>
          <span className="font-semibold text-gray-200">{temperature}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">💧</span>
          <span className="font-semibold text-gray-200">{rainChance}%</span>
        </div>
      </div>
    </div>
  );
};

export default SunshineWindow;
