import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ChartDataPoint {
  time: string;
  temperature: number;
  rainProbability: number;
}

interface SunshineWindow {
  startTime: string;
  endTime: string;
}

interface DualAxisChartProps {
  data?: ChartDataPoint[];
  title?: string;
  currentTime?: Date;
  sunshineWindows?: SunshineWindow[];
}

// Default mock data for visualization - using consistent HH:MM format
const DEFAULT_DATA: ChartDataPoint[] = [
  { time: '00:00', temperature: 23, rainProbability: 10 },
  { time: '04:00', temperature: 21, rainProbability: 15 },
  { time: '08:00', temperature: 26, rainProbability: 5 },
  { time: '12:00', temperature: 31, rainProbability: 20 },
  { time: '16:00', temperature: 29, rainProbability: 25 },
  { time: '20:00', temperature: 26, rainProbability: 40 },
  { time: '23:00', temperature: 24, rainProbability: 35 },
];

const DualAxisChart: React.FC<DualAxisChartProps> = ({
  data = DEFAULT_DATA,
  title = 'Temperature & Rain Probability',
  currentTime = new Date(),
  sunshineWindows = [
    { startTime: '08:00', endTime: '11:00' },
    { startTime: '14:00', endTime: '16:00' },
  ],
}) => {
  // Format current time as HH:MM for chart reference
  const nowLabel = useMemo(() => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [currentTime]);
  return (
    <div className="w-full">
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <div className="text-xs text-gray-500 mb-4">Current time: {nowLabel}</div>
      <style>{`
        @keyframes glowPulse {
          0% {
            filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.8));
          }
          100% {
            filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.4));
          }
        }
      `}</style>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 20, right: 60, left: 20, bottom: 20 }}>
          <defs>
            {/* Softer, mist-like gradient for temperature line */}
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
            </linearGradient>
            {/* Softer, misty gradient for rain bars */}
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.5} />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.15} />
            </linearGradient>
            {/* Glow filter for "Now" line */}
            <filter id="glowNow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sunshine window background shading */}
          {sunshineWindows.map((window, idx) => (
            <ReferenceLine
              key={`window-${idx}`}
              x={window.startTime}
              stroke="rgba(234, 179, 8, 0.1)"
              strokeWidth={0}
            />
          ))}

          {/* Minimal axes without grid */}
          <XAxis
            dataKey="time"
            stroke="rgba(156, 163, 175, 0.3)"
            style={{ fontSize: '13px', fontWeight: '500', fill: 'rgba(156, 163, 175, 0.6)' }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(249, 115, 22, 0.4)"
            label={{
              value: '°C',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fontSize: 13,
              fontWeight: 600,
              fill: '#f97316',
            }}
            style={{ fontSize: '12px', fontWeight: '600', fill: '#f97316' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(6, 182, 212, 0.4)"
            label={{
              value: '%',
              angle: 90,
              position: 'insideRight',
              offset: 10,
              fontSize: 13,
              fontWeight: 600,
              fill: '#06b6d4',
            }}
            style={{ fontSize: '12px', fontWeight: '600', fill: '#06b6d4' }}
          />

          {/* Enhanced tooltip with softer styling */}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
            }}
            cursor={{ stroke: 'rgba(168, 85, 247, 0.2)', strokeWidth: 2 }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return [value.toFixed(1), ''];
              }
              return value;
            }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px', fontSize: '14px', color: 'rgba(156, 163, 175, 0.8)' }}
            iconType="line"
          />

          {/* "NOW" Reference Line - Enhanced glowing vertical line with pulse */}
          <ReferenceLine
            x={nowLabel}
            stroke="#f97316"
            strokeWidth={3}
            strokeDasharray="6,3"
            label={{
              value: `NOW (${nowLabel})`,
              position: 'top',
              fill: '#f97316',
              fontSize: 12,
              fontWeight: 700,
              offset: 8,
            }}
          />

          {/* Spline curve (smooth) instead of monotone (jagged) */}
          <Line
            yAxisId="left"
            type="natural"
            dataKey="temperature"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ fill: '#fb923c', r: 5, opacity: 0.8 }}
            activeDot={{ r: 7, fill: '#f97316', opacity: 1 }}
            name="Temperature (°C)"
            isAnimationActive={true}
            animationDuration={800}
          />

          {/* Softer rain bars - mist-like appearance */}
          <Bar
            yAxisId="right"
            dataKey="rainProbability"
            fill="url(#rainGradient)"
            name="Rain Probability (%)"
            opacity={0.7}
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DualAxisChart;
