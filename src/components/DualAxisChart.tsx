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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const nowLabel = useMemo(() => {
    const hours = String(currentTime.getHours()).padStart(2, '0');
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [currentTime]);

  // QA FIX P1: Unify colors. Temperature is muted orange, Rain is slate gray. Remove glows.
  const tempColor = '#D4622A';
  const rainColor = '#64748B'; 

  return (
    <div className="w-full glass-card p-4" style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm md:text-base font-bold text-gray-200">{title}</h3>
        <div className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="now-pulse inline-block w-2 h-2 rounded-full" style={{ backgroundColor: tempColor }} />
          Now: <span className="font-mono font-semibold text-gray-200">{nowLabel}</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 10, right: 36, left: 10, bottom: 10 }}>
          <defs>
            {/* Neutral slate gradient for rain */}
            <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={rainColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={rainColor} stopOpacity={0.1} />
            </linearGradient>
            {/* Removed SVG glow filters for flattened UI approach */}
          </defs>

          {sunshineWindows.map((window, idx) => (
            <ReferenceArea
              key={`window-${idx}`}
              x1={window.startTime}
              x2={window.endTime}
              fill="rgba(212, 98, 42, 0.05)"
              stroke="none"
            />
          ))}

          <XAxis
            dataKey="time"
            stroke="rgba(156, 163, 175, 0.3)"
            style={{ fontSize: '13px', fontWeight: '600' }}
            tick={{ fontSize: 13, fill: '#9ca3af' }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(212, 98, 42, 0.3)"
            label={{
              value: '°C',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              fontSize: 13,
              fontWeight: 700,
              fill: tempColor,
            }}
            style={{ fontSize: '13px', fontWeight: '700' }}
            tick={{ fontSize: 13, fill: tempColor }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(100, 116, 139, 0.3)"
            label={{
              value: '%',
              angle: 90,
              position: 'insideRight',
              offset: 10,
              fontSize: 13,
              fontWeight: 700,
              fill: rainColor,
            }}
            style={{ fontSize: '13px', fontWeight: '700' }}
            tick={{ fontSize: 13, fill: rainColor }}
            domain={[0, 130]}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#f8fafc',
            }}
            cursor={{ stroke: 'rgba(156, 163, 175, 0.2)', strokeWidth: 2 }}
            formatter={(value: any) => {
              if (typeof value === 'number') {
                return value.toFixed(1);
              }
              return value;
            }}
          />

          <Legend
            wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#9ca3af' }}
            iconType="line"
          />

          <ReferenceLine
            x={nowLabel}
            stroke={tempColor}
            strokeWidth={2}
            strokeDasharray="4,4"
            label={{
              value: `NOW (${nowLabel})`,
              position: 'top',
              fill: tempColor,
              fontSize: 12,
              fontWeight: 600,
              offset: 6,
            }}
          />

          <Area
            yAxisId="right"
            type="monotone"
            dataKey="rainProbability"
            fill="url(#rainGradient)"
            stroke={rainColor}
            strokeWidth={1}
            strokeOpacity={0.6}
            name="Rain (%)"
            isAnimationActive={!prefersReducedMotion}
            animationDuration={800}
          />

          <Line
            yAxisId="left"
            type="natural"
            dataKey="temperature"
            stroke={tempColor}
            strokeWidth={3}
            dot={{ fill: tempColor, r: 4, opacity: 0.9 }}
            activeDot={{ r: 6, fill: tempColor, opacity: 1 }}
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
