import React from 'react';

interface SunshineWindowProps {
  timeWindow: string;
  temperature: number;
  rainChance: number;
  condition: 'optimal' | 'good' | 'fair';
  description: string;
  emoji?: string;
}

const conditionStyles = {
  optimal: {
    bg: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-400/30',
    badge: 'bg-yellow-500/20 text-yellow-300',
  },
  good: {
    bg: 'from-cyan-500/20 to-blue-500/20',
    border: 'border-cyan-400/30',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
  fair: {
    bg: 'from-purple-500/20 to-indigo-500/20',
    border: 'border-purple-400/30',
    badge: 'bg-purple-500/20 text-purple-300',
  },
};

const SunshineWindow: React.FC<SunshineWindowProps> = ({
  timeWindow,
  temperature,
  rainChance,
  condition,
  description,
  emoji = '☀️',
}) => {
  const styles = conditionStyles[condition];

  return (
    <div className={`glass-card p-4 bg-gradient-to-br ${styles.bg} border-l-4 ${styles.border} hover:bg-opacity-80`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <p className="text-sm font-semibold text-white">{timeWindow}</p>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles.badge}`}>
          {condition.toUpperCase()}
        </span>
      </div>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">🌡️</span>
          <span className="font-semibold text-orange-300">{temperature}°C</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">💧</span>
          <span className="font-semibold text-cyan-300">{rainChance}%</span>
        </div>
      </div>
    </div>
  );
};

export default SunshineWindow;
