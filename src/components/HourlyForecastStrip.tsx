import React from 'react';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface HourlyData {
  time: string;
  temperature?: number;
  rainProbability?: number;
  temp?: number;
  rain?: number;
  rainIntensity?: 'none' | 'tiny' | 'light' | 'heavy';
}

interface HourlyForecastStripProps {
  hourlyData: HourlyData[];
}

const formatHour = (time: string) => {
  const [hourPart] = time.split(':');
  const hour = Number(hourPart);

  if (Number.isNaN(hour)) return time;

  const period = hour < 12 ? 'a.m' : 'p.m';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour} ${period}`;
};

const getRainIntensity = (rainProbability: number): 'none' | 'tiny' | 'light' | 'heavy' => {
  if (rainProbability <= 0) return 'none';
  if (rainProbability < 35) return 'tiny';
  if (rainProbability < 70) return 'light';
  return 'heavy';
};

const CloudIcon: React.FC<{ intensity: 'none' | 'tiny' | 'light' | 'heavy' }> = ({ intensity }) => {
  const opacity = intensity === 'none' ? 0.45 : intensity === 'tiny' ? 0.62 : intensity === 'light' ? 0.78 : 0.95;

  return (
    <svg className="hourly-cloud-icon" viewBox="0 0 28 18" aria-hidden="true">
      <path
        d="M8.2 14.8h12.7c3 0 5.1-1.7 5.1-4.1 0-2.2-1.9-3.9-4.4-3.9h-.5C20.4 3.7 17.7 1.6 14.4 1.6c-3 0-5.5 1.8-6.5 4.4C4.6 6.2 2 8 2 10.5c0 2.6 2.5 4.3 6.2 4.3Z"
        fill="#7d8da1"
        opacity={opacity}
        stroke="#475569"
        strokeWidth="0.7"
      />
      {intensity === 'heavy' && (
        <path d="M10 17h2M16 17h2" stroke="#e07b39" strokeWidth="1.8" strokeLinecap="round" />
      )}
      {intensity === 'light' && (
        <path d="M13 17h2" stroke="#e07b39" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
};

const HourlyForecastStrip: React.FC<HourlyForecastStripProps> = ({ hourlyData }) => {
  const normalizedData = hourlyData.map((hour) => {
    const temperature = Math.round(hour.temperature ?? hour.temp ?? 0);
    const rainProbability = Math.round(hour.rainProbability ?? hour.rain ?? 0);

    return {
      ...hour,
      label: formatHour(hour.time),
      temperature,
      rainProbability,
      rainIntensity: hour.rainIntensity ?? getRainIntensity(rainProbability),
    };
  });

  return (
    <article className="hourly-forecast-card" role="region" aria-label="Hourly forecast">
      <h2 className="hourly-forecast-title">Hourly forecast</h2>

      <div className="hourly-chart-frame" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={normalizedData} margin={{ top: 42, right: 0, left: 0, bottom: 28 }}>
            <YAxis dataKey="temperature" hide domain={['dataMin - 3', 'dataMax + 3']} />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ff5a14"
              strokeWidth={2.2}
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="hourly-strip" role="list">
        {normalizedData.map((hour) => (
          <div
            key={hour.time}
            className="hourly-tile"
            role="listitem"
            aria-label={`${hour.label}, ${hour.temperature} degrees, ${hour.rainProbability}% rain probability`}
          >
            <span className="hourly-time">{hour.label}</span>
            <CloudIcon intensity={hour.rainIntensity} />
            <span className="hourly-rain">{hour.rainProbability}%</span>
            <span className="hourly-temp">{hour.temperature}&deg;</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default HourlyForecastStrip;
