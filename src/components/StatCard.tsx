import React from 'react';
import { type ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'stable';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit = '', icon, trend }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-red-400';
      case 'down':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-white/8 hover:border-white/20">
      {icon && (
        <div 
          className="mb-3 text-2xl opacity-80 hover:opacity-100 transition-opacity filter drop-shadow-lg"
          style={{
            textShadow: '0 0 8px rgba(249, 115, 22, 0.3)',
            filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.2))',
          }}
        >
          {icon}
        </div>
      )}
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">{label}</p>
      <div className="flex items-baseline justify-center gap-1">
        <p className="text-4xl font-bold text-white">{value}</p>
        {unit && <span className="text-base text-gray-500">{unit}</span>}
      </div>
      {trend && (
        <p className={`text-xs mt-3 font-semibold tracking-wide ${getTrendColor()}`}>
          {getTrendIcon()} {trend === 'up' ? 'Rising' : trend === 'down' ? 'Falling' : 'Stable'}
        </p>
      )}
    </div>
  );
};

export default StatCard;
