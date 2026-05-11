import React from 'react';
import { CartesianGrid, LabelList, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

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

interface InterpolationPoint {
  time: string;
  minuteOfDay: number;
  sequenceMinute: number;
  temperature: number;
  rainProbability: number;
  rainMm: number;
  rainIntensity?: RainIntensity;
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

const parseMinuteOfDay = (time: string) => {
  const [hourPart, minutePart = '0'] = time.split(':');
  const hour = Number(hourPart);
  const minute = Number(minutePart);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return 0;
  return ((Math.trunc(hour) % 24) + 24) % 24 * 60 + Math.max(0, Math.min(59, Math.trunc(minute)));
};

const formatMinuteOfDay = (minuteOfDay: number) => {
  const boundedMinute = ((Math.round(minuteOfDay) % 1440) + 1440) % 1440;
  const hour = Math.floor(boundedMinute / 60);
  const minute = boundedMinute % 60;

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

const interpolateNumber = (left: number, right: number, ratio: number) => left + (right - left) * ratio;

const getRainIntensity = (rainMm: number): RainIntensity => {
  if (rainMm <= 0) return 'none';
  if (rainMm < 2.5) return 'light';
  if (rainMm < 7.6) return 'moderate';
  return 'heavy';
};

const getRainClass = (intensity: RainIntensity) => `rain-${intensity}`;

const getWeatherIcon = (rainProbability: number) => {
  if (rainProbability >= 86) return '⛈';
  if (rainProbability >= 66) return '🌧';
  if (rainProbability >= 41) return '🌦';
  return '☁';
};

const WeatherIcon: React.FC<{ rainProbability: number }> = ({ rainProbability }) => {
  return <span className="hourly-weather-icon" aria-hidden="true">{getWeatherIcon(rainProbability)}</span>;
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

const expandToHourlyData = (
  hourlyData: HourlyData[],
  temperatureUnit: 'c' | 'f',
  timeFormat: '12h' | '24h',
): NormalizedHourlyData[] => {
  let previousMinuteOfDay = 0;
  let previousSequenceMinute = 0;

  const sourcePoints: InterpolationPoint[] = hourlyData.map((hour, index) => {
    const minuteOfDay = parseMinuteOfDay(hour.time);
    const gapFromPrevious =
      index === 0 ? 0 : (minuteOfDay - previousMinuteOfDay + 1440) % 1440 || 1440;
    const sequenceMinute =
      index === 0 ? minuteOfDay : previousSequenceMinute + gapFromPrevious;
    const rainProbability = Math.round(hour.rainProbability ?? hour.rain ?? 0);
    const rainMm = Number((hour.rainMm ?? rainProbability / 18).toFixed(1));
    previousMinuteOfDay = minuteOfDay;
    previousSequenceMinute = sequenceMinute;

    return {
      time: hour.time,
      minuteOfDay,
      sequenceMinute,
      temperature: convertTemperature(hour.temperature ?? hour.temp ?? 0, temperatureUnit),
      rainProbability,
      rainMm,
      rainIntensity: hour.rainIntensity,
    };
  });

  const expanded: InterpolationPoint[] = [];

  sourcePoints.forEach((point, index) => {
    expanded.push(point);
    const next = sourcePoints[index + 1];
    if (!next) return;

    const gap = next.sequenceMinute - point.sequenceMinute;
    if (gap <= 60) return;

    const hourlySteps = Math.floor(gap / 60);
    for (let step = 1; step < hourlySteps; step += 1) {
      const ratio = (step * 60) / gap;
      const sequenceMinute = point.sequenceMinute + step * 60;

      expanded.push({
        time: formatMinuteOfDay(sequenceMinute),
        minuteOfDay: sequenceMinute % 1440,
        sequenceMinute,
        temperature: Math.round(interpolateNumber(point.temperature, next.temperature, ratio)),
        rainProbability: Math.round(interpolateNumber(point.rainProbability, next.rainProbability, ratio)),
        rainMm: Number(interpolateNumber(point.rainMm, next.rainMm, ratio).toFixed(1)),
      });
    }
  });

  return expanded.map((hour) => ({
    label: formatHour(hour.time, timeFormat),
    time: hour.time,
    temperature: hour.temperature,
    rainProbability: hour.rainProbability,
    rainMm: hour.rainMm,
    rainIntensity: hour.rainIntensity ?? getRainIntensity(hour.rainMm),
  }));
};

const formatChartTemperatureLabel = (value: unknown) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? `${Math.round(numericValue)}\u00B0` : '';
};

const HourlyForecastStrip: React.FC<HourlyForecastStripProps> = ({
  hourlyData,
  temperatureUnit = 'c',
  timeFormat = '12h',
}) => {
  const normalizedData = expandToHourlyData(hourlyData, temperatureUnit, timeFormat);

  const temperatures = normalizedData.map((hour) => hour.temperature);
  const minTemperature = temperatures.length ? Math.min(...temperatures) : 0;
  const maxTemperature = temperatures.length ? Math.max(...temperatures) : 0;
  const hasRange = maxTemperature > minTemperature;
  const yMin = hasRange ? minTemperature - 2 : minTemperature - 1;
  const yMax = hasRange ? maxTemperature + 2 : maxTemperature + 1;
  const averageTemperature = temperatures.length
    ? Math.round(temperatures.reduce((sum, temperature) => sum + temperature, 0) / temperatures.length)
    : 0;
  const averageLabel = `Avg ${averageTemperature}\u00B0`;
  const yAxisTicks = Array.from(
    new Set(hasRange ? [minTemperature, averageTemperature, maxTemperature] : [minTemperature]),
  ).sort((left, right) => left - right);

  return (
    <article className="hourly-forecast-card" role="region" aria-label="Hourly forecast">
      <div className="hourly-chart-header">
        <h2 className="hourly-forecast-title">Hourly forecast</h2>
        <span className="hourly-average-legend">
          <span aria-hidden="true" />
          {averageLabel}
        </span>
      </div>

      <div className="hourly-chart-frame">
        <ResponsiveContainer width="100%" height={196} minWidth={0}>
          <LineChart data={normalizedData} margin={{ top: 34, right: 30, left: 18, bottom: 14 }}>
            <CartesianGrid
              vertical={false}
              stroke="rgba(124, 95, 74, 0.18)"
              strokeDasharray="3 5"
            />
            <XAxis dataKey="time" hide />
            <YAxis
              dataKey="temperature"
              tickLine={{ stroke: 'rgba(124, 95, 74, 0.42)' }}
              axisLine={{ stroke: 'rgba(124, 95, 74, 0.34)' }}
              width={54}
              tick={{ fontSize: 12, fill: '#5f4634', fontWeight: 800 }}
              ticks={yAxisTicks}
              tickFormatter={formatChartTemperatureLabel}
              domain={[yMin, yMax]}
              label={{
                value: temperatureUnit === 'f' ? 'Temp (°F)' : 'Temp (°C)',
                angle: -90,
                position: 'insideLeft',
                offset: 0,
                fill: '#6f503a',
                fontSize: 11,
                fontWeight: 900,
              }}
            />
            <ReferenceLine
              y={averageTemperature}
              stroke="rgba(124, 95, 74, 0.42)"
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
            <WeatherIcon rainProbability={hour.rainProbability} />
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
