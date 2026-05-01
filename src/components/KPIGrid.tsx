import React from 'react';

interface KPIGridProps {
  windSpeed: number;
  humidity: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  dewPoint: number;
}

interface KPITileProps {
  label: string;
  value: string | number;
  unit: string;
  icon: string;
  color: string;
}

const KPITile: React.FC<KPITileProps> = ({ label, value, unit, icon, color }) => (
  <div className="kpi-tile group">
    <div className="flex items-start justify-between mb-3">
      <p className="text-openweather-textLight text-xs font-semibold uppercase tracking-widest">
        {label}
      </p>
      <span className="text-2xl">{icon}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
      <span className="text-openweather-textLight text-sm">{unit}</span>
    </div>
    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} opacity-60 rounded-full`}
        style={{ width: `${Math.min(Number(value), 100)}%` }}
      />
    </div>
  </div>
);

const KPIGrid: React.FC<KPIGridProps> = ({
  windSpeed,
  humidity,
  visibility,
  pressure,
  uvIndex,
  dewPoint,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Top Row */}
      <KPITile
        label="Wind Speed"
        value={windSpeed}
        unit="km/h"
        icon="💨"
        color="text-blue-600"
      />
      <KPITile
        label="Humidity"
        value={humidity}
        unit="%"
        icon="💧"
        color="text-cyan-600"
      />
      <KPITile
        label="Visibility"
        value={visibility}
        unit="km"
        icon="👁️"
        color="text-purple-600"
      />

      {/* Bottom Row */}
      <KPITile
        label="Pressure"
        value={(pressure / 100).toFixed(1)}
        unit="mb"
        icon="🔻"
        color="text-indigo-600"
      />
      <KPITile
        label="UV Index"
        value={uvIndex}
        unit="☀️"
        icon="🛡️"
        color="text-openweather-primary"
      />
      <KPITile
        label="Dew Point"
        value={dewPoint}
        unit="°C"
        icon="❄️"
        color="text-teal-600"
      />
    </div>
  );
};

export default KPIGrid;
