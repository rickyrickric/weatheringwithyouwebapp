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
import type { ChartDataPoint, SunshineWindow } from '../types/weather';
import { DEFAULT_CHART_DATA } from '../types/weather';

interface DualAxisChartProps {
  data?: ChartDataPoint[];
  title?: string;
  currentTime?: Date;
  sunshineWindows?: SunshineWindow[];
  height?: number;
}

const DualAxisChart: React.FC<DualAxisChartProps> = ({
  data = DEFAULT_CHART_DATA,
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
        <h3 className="text-sm md:text-base font-bold text-openweather-primary">{title}</h3>
        <div className="text-xs text-openweather-textLight flex items-center gap-1.5">
          <span className="now-pulse inline-block w-2 h-2 rounded-full bg-orange-500" />
          Now: <span className="font-mono font-semibold text-openweather-primary">{nowLabel}</span>
        </div>
      </div>
      
      {/* glowPulse / nowPulse keyframes are defined in index.css */}
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 36, left: 10, bottom: 10 }}>
          <defs>
            {/* Orange gradient for temperature area fill */}
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#EB6E4B" stopOpacity={0.6} />
              <stop offset="50%" stopColor="#EB6E4B" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#EB6E4B" stopOpacity={0.1} />
            </linearGradient>
            {/* Enhanced cyan gradient for rain — increased opacity for visibility */}
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#67E8F9" stopOpacity={0.85} />
              <stop offset="50%" stopColor="#22D3EE" stopOpacity={0.55} />
              <stop offset="100%" stopColor="#AEECEF" stopOpacity={0.25} />
            </linearGradient>
            {/* Glow filter for "Now" line */}
            <filter id="glowNow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Glow filter for the temperature line */}
            <filter id="tempGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
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

          {/* Axes — bumped font sizes for legibility at compressed widths */}
          <XAxis
            dataKey="time"
            stroke="rgba(237, 237, 237, 0.5)"
            style={{ fontSize: '12px', fontWeight: '600', fill: '#b0b0b0' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(235, 110, 75, 0.3)"
            label={{
              value: '°C',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fontSize: 13,
              fontWeight: 700,
              fill: '#EB6E4B',
            }}
            style={{ fontSize: '12px', fontWeight: '700', fill: '#EB6E4B' }}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(103, 232, 249, 0.4)"
            label={{
              value: '%',
              angle: 90,
              position: 'insideRight',
              offset: 10,
              fontSize: 13,
              fontWeight: 700,
              fill: '#67E8F9',
            }}
            style={{ fontSize: '12px', fontWeight: '700', fill: '#67E8F9' }}
            tick={{ fontSize: 12 }}
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
              fontSize: 12,
              fontWeight: 700,
              offset: 6,
            }}
          />

          {/* Rain area on right axis — boosted opacity for dark-bg visibility */}
          <Area
            yAxisId="right"
            type="monotone"
            dataKey="rainProbability"
            fill="url(#rainGradient)"
            stroke="#22D3EE"
            strokeWidth={1}
            strokeOpacity={0.4}
            name="Rain (%)"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={800}
          />

          {/* Temperature line — with subtle glow filter */}
          <Line
            yAxisId="left"
            type="natural"
            dataKey="temperature"
            stroke="#EB6E4B"
            strokeWidth={3}
            dot={{ fill: '#FB923C', r: 5, opacity: 0.9 }}
            activeDot={{ r: 7, fill: '#EB6E4B', opacity: 1 }}
            name="Temperature (°C)"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={800}
            filter="url(#tempGlow)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DualAxisChart;
