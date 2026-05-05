import React from 'react';
import RainDropIcon from './RainDropIcon';

interface HourlyData {
  time: string;
  temperature: number;
  rainProbability: number;
  rainIntensity: 'none' | 'tiny' | 'light' | 'heavy';
}

interface HourlyForecastStripProps {
  hourlyData: HourlyData[];
}

const HourlyForecastStrip: React.FC<HourlyForecastStripProps> = ({ hourlyData }) => {
  return (
    <div
      className="overflow-x-auto scrollbar-hide"
      role="region"
      aria-label="Hourly forecast strip"
    >
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(72px, 1fr)',
          gap: 0,
          borderTop: '1px solid rgba(237, 237, 237, 0.3)',
          marginTop: '8px',
          paddingTop: '8px',
        }}
        role="list"
      >
        {hourlyData.map((h, i) => (
          <div
            key={i}
            role="listitem"
            aria-label={`${h.time} — ${h.temperature}°C — ${h.rainProbability}% rain`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '0 4px',
              borderRight:
                i < hourlyData.length - 1 ? '1px solid rgba(237, 237, 237, 0.2)' : 'none',
            }}
          >
            {/* Time */}
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '10px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.65)',
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {h.time}
            </span>

            {/* Rain Icon */}
            <RainDropIcon intensity={h.rainIntensity} size={14} />

            {/* Rain % */}
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                color: h.rainProbability >= 80 ? '#AEECEF' : 'rgba(255, 255, 255, 0.65)',
              }}
            >
              {h.rainProbability}%
            </span>

            {/* Temperature */}
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {h.temperature}°
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecastStrip;
