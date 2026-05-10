import React from 'react';
import { LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface HourlyData {
  time: string;
  temperature?: number;
  rainProbability?: number;
  rainMm?: number;
  temp?: number;
  rain?: number;
  rainIntensity?: RainIntensity;
}

interface HourlyForecastStripProps {
  hourlyData: HourlyData[];
  temperatureUnit?: 'c' | 'f';
  timeFormat?: '12h' | '24h';
}

type RainIntensity = 'none' | 'light' | 'moderate' | 'heavy';

interface NormalizedHourlyData {
  label: string;
  time: string;
  temperature: number;
  rainProbability: number;
  rainMm: number;
  rainIntensity: RainIntensity;
}

interface HourlyTooltipPayload {
  payload?: NormalizedHourlyData;
}

const formatHour = (time: string, timeFormat: '12h' | '24h') => {
  const [hourPart] = time.split(':');
  const hour = Number(hourPart);

  if (Number.isNaN(hour)) return time;
  if (timeFormat === '24h') return `${hour.toString().padStart(2, '0')}:00`;

  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour} ${period}`;
};

const getRainIntensity = (rainMm: number): RainIntensity => {
  if (rainMm <= 0) return 'none';
  if (rainMm < 2.5) return 'light';
  if (rainMm < 7.6) return 'moderate';
  return 'heavy';
};

const getRainClass = (intensity: RainIntensity) => `rain-${intensity}`;

const CloudIcon: React.FC<{ intensity: RainIntensity }> = ({ intensity }) => {
  const opacity = intensity === 'none' ? 0.45 : intensity === 'light' ? 0.68 : intensity === 'moderate' ? 0.82 : 0.95;

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
        <path d="M9 17h2M13 17h2M17 17h2" stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round" />
      )}
      {intensity === 'moderate' && (
        <path d="M11 17h2M16 17h2" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
      )}
      {intensity === 'light' && (
        <path d="M13 17h2" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
};

const HourlyTooltip: React.FC<{
  active?: boolean;
  payload?: readonly HourlyTooltipPayload[];
}> = ({ active, payload }) => {
  const point = payload?.[0]?.payload;

  if (!active || !point) return null;

  return (
    <div className="hourly-tooltip">
      <div className="hourly-tooltip-time">{point.time}</div>
      <div className="hourly-tooltip-row">
        <span className="hourly-tooltip-swatch hourly-tooltip-temp" />
        <span>Temp: {point.temperature}&deg;</span>
      </div>
      <div className="hourly-tooltip-row">
        <span className="hourly-tooltip-swatch hourly-tooltip-precip" />
        <span>Rain: {point.rainMm.toFixed(1)} mm, {point.rainIntensity}</span>
      </div>
    </div>
  );
};

const convertTemperature = (temperature: number, unit: 'c' | 'f') => (
  unit === 'f' ? Math.round((temperature * 9) / 5 + 32) : Math.round(temperature)
);

const formatChartTemperatureLabel = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${Math.round(numericValue)}\u00B0` : '';
};

const HourlyForecastStrip: React.FC<HourlyForecastStripProps> = ({
  hourlyData,
  temperatureUnit = 'c',
  timeFormat = '12h',
}) => {
  const normalizedData: NormalizedHourlyData[] = hourlyData.map((hour) => {
    const temperature = convertTemperature(hour.temperature ?? hour.temp ?? 0, temperatureUnit);
    const rainProbability = Math.round(hour.rainProbability ?? hour.rain ?? 0);
    const rainMm = Number((hour.rainMm ?? rainProbability / 18).toFixed(1));

    return {
      ...hour,
      label: formatHour(hour.time, timeFormat),
      temperature,
      rainProbability,
      rainMm,
      rainIntensity: hour.rainIntensity ?? getRainIntensity(rainMm),
    };
  });

  const temperatures = normalizedData.map((hour) => hour.temperature);
  const minTemperature = temperatures.length ? Math.min(...temperatures) : 0;
  const maxTemperature = temperatures.length ? Math.max(...temperatures) : 0;
  const hasRange = maxTemperature > minTemperature;
  const yMin = hasRange ? minTemperature - 2 : minTemperature - 1;
  const yMax = hasRange ? maxTemperature + 2 : maxTemperature + 1;
  const midpointTemperature = Math.round((minTemperature + maxTemperature) / 2);

  return (
    <article className="hourly-forecast-card" role="region" aria-label="Hourly forecast">
      <h2 className="hourly-forecast-title">Hourly forecast</h2>

      <div className="hourly-chart-frame">
        <ResponsiveContainer width="100%" height={196} minWidth={0}>
          <LineChart data={normalizedData} margin={{ top: 36, right: 28, left: 12, bottom: 16 }}>
            <XAxis dataKey="time" hide />
            <YAxis
              dataKey="temperature"
              tickLine={{ stroke: 'rgba(124, 95, 74, 0.42)' }}
              axisLine={{ stroke: 'rgba(124, 95, 74, 0.34)' }}
              width={48}
              tick={{ fontSize: 12, fill: '#5f4634', fontWeight: 800 }}
              ticks={hasRange ? [minTemperature, maxTemperature] : [minTemperature]}
              tickFormatter={formatChartTemperatureLabel}
              domain={[yMin, yMax]}
            />
            <ReferenceLine
              y={midpointTemperature}
              stroke="rgba(124, 95, 74, 0.30)"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <Tooltip
              cursor={false}
              content={({ active, payload }) => (
                <HourlyTooltip active={active} payload={payload as readonly HourlyTooltipPayload[]} />
              )}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#ff5a14"
              strokeWidth={2}
              dot={{
                r: 4,
                fill: '#ff5a14',
                stroke: '#fff7ed',
                strokeWidth: 2,
              }}
              activeDot={{
                r: 6,
                fill: '#ff5a14',
                stroke: '#fff7ed',
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            >
              <LabelList
                dataKey="temperature"
                position="top"
                offset={10}
                formatter={formatChartTemperatureLabel}
                fill="#8a3d14"
                fontSize={11}
                fontWeight={700}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="hourly-strip" role="list">
        {normalizedData.map((hour) => (
          <div
            key={hour.time}
            className={`hourly-tile ${getRainClass(hour.rainIntensity)}`}
            role="listitem"
            aria-label={`${hour.label}, ${hour.temperature} degrees, ${hour.rainProbability}% rain probability, ${hour.rainMm.toFixed(1)} millimeters, ${hour.rainIntensity} rain`}
          >
            <span className="hourly-time">{hour.label}</span>
            <CloudIcon intensity={hour.rainIntensity} />
            <span className="hourly-rain">{hour.rainProbability}%</span>
            <span className="hourly-mm">{hour.rainMm.toFixed(1)} mm</span>
            <span className="hourly-temp">{hour.temperature}&deg;</span>
          </div>
        ))}
      </div>
    </article>
  );
};

export default HourlyForecastStrip;

