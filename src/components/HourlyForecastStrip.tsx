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
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${hourlyData.length}, 1fr)`,
        gap: 0,
        borderTop: '1px solid rgba(237, 237, 237, 0.3)',
        marginTop: '16px',
        paddingTop: '12px',
      }}
    >
      {hourlyData.map((h, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            padding: '0 6px',
            borderRight:
              i < hourlyData.length - 1 ? '1px solid rgba(237, 237, 237, 0.2)' : 'none',
          }}
        >
          {/* Time */}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: '#999999',
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {h.time}
          </span>

          {/* Rain Icon */}
          <RainDropIcon intensity={h.rainIntensity} size={18} />

          {/* Rain % */}
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '11px',
              fontWeight: 600,
              color: h.rainProbability >= 80 ? '#AEECEF' : '#999999',
            }}
          >
            {h.rainProbability}%
          </span>

          {/* Temperature */}
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#48484A',
            }}
          >
            {h.temperature}°
          </span>
        </div>
      ))}
    </div>
  );
};

export default HourlyForecastStrip;
