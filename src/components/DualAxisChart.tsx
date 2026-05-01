import React, { useMemo, useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
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
  height?: number;
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
  height = 240,
  sunshineWindows = [
    { startTime: '08:00', endTime: '11:00' },
    { startTime: '14:00', endTime: '16:00' },
  ],
}) => {
  // Check if user prefers reduced motion (memoized)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Format current time as HH:MM for chart reference
  const nowLabel = useMemo(() => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [currentTime]);
  return (
    <div className="w-full glass-card p-4" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }} aria-label="Dual-axis forecast chart showing temperature and rain probability">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-openweather-primary">{title}</h3>
        <div className="text-xs text-openweather-textLight">
          Now: <span className="font-mono font-semibold text-openweather-primary">{nowLabel}</span>
        </div>
      </div>
      
      <style>{`
        @keyframes glowPulse {
          0% {
            filter: drop-shadow(0 0 4px rgba(235, 110, 75, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(235, 110, 75, 0.8));
          }
          100% {
            filter: drop-shadow(0 0 4px rgba(235, 110, 75, 0.4));
          }
        }
      `}</style>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 36, left: 10, bottom: 10 }}>
          <defs>
            {/* Orange gradient for temperature line - matches OpenWeather primary */}
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EB6E4B" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#EB6E4B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EB6E4B" stopOpacity={0.1} />
            </linearGradient>
            {/* Pale cyan gradient for rain bars - matches OpenWeather secondary */}
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AEECEF" stopOpacity={0.7} />
              <stop offset="50%" stopColor="#AEECEF" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#AEECEF" stopOpacity={0.2} />
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

          {/* Sunshine window background shading with ReferenceArea */}
          {sunshineWindows.map((window, idx) => (
            <ReferenceArea
              key={`window-${idx}`}
              x1={window.startTime}
              x2={window.endTime}
              fill="rgba(234, 179, 8, 0.08)"
              stroke="none"
            />
          ))}

          {/* Minimal axes with OpenWeather color coding */}
          <XAxis
            dataKey="time"
            stroke="rgba(237, 237, 237, 0.5)"
            style={{ fontSize: '11px', fontWeight: '500', fill: '#999999' }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(235, 110, 75, 0.3)"
            label={{
              value: '°C',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fontSize: 11,
              fontWeight: 700,
              fill: '#EB6E4B',
            }}
            style={{ fontSize: '10px', fontWeight: '700', fill: '#EB6E4B' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(174, 236, 239, 0.3)"
            label={{
              value: '%',
              angle: 90,
              position: 'insideRight',
              offset: 10,
              fontSize: 11,
              fontWeight: 700,
              fill: '#AEECEF',
            }}
            style={{ fontSize: '10px', fontWeight: '700', fill: '#AEECEF' }}
            domain={[0, 130]}
          />

          {/* Dark-themed tooltip for consistency */}
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(22, 24, 28, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(12px)',
              color: '#FFFFFF',
            }}
            cursor={{ stroke: 'rgba(235, 110, 75, 0.3)', strokeWidth: 2 }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return value.toFixed(1);
              }
              return value;
            }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#999999' }}
            iconType="line"
          />

          {/* "NOW" Reference Line - Enhanced glowing vertical line */}
          <ReferenceLine
            x={nowLabel}
            stroke="#EB6E4B"
            strokeWidth={2}
            strokeDasharray="6,3"
            label={{
              value: `NOW (${nowLabel})`,
              position: 'top',
              fill: '#EB6E4B',
              fontSize: 11,
              fontWeight: 700,
              offset: 6,
            }}
          />

          {/* Rain area on right axis - teal gradient */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="rainProbability"
            fill="url(#rainGradient)"
            stroke="none"
            name="Rain (%)"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={800}
          />

          {/* Spline curve (smooth) - respect prefers-reduced-motion */}
          <Line
            yAxisId="left"
            type="natural"
            dataKey="temperature"
            stroke="#EB6E4B"
            strokeWidth={3}
            dot={{ fill: '#FB923C', r: 5, opacity: 0.8 }}
            activeDot={{ r: 7, fill: '#EB6E4B', opacity: 1 }}
            name="Temperature (°C)"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DualAxisChart;
