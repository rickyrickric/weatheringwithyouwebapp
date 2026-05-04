import React from 'react';

interface KPIGridProps {
  windSpeed: number;
  humidity: number;
  visibility: number;
  pressure: number;
  uvIndex: number;
  dewPoint: number;
}

interface StatTileProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
}

const StatTile: React.FC<StatTileProps> = ({ icon, label, value, unit }) => (
  <div
    className="glass-card rounded-2xl p-3 min-h-[92px] flex flex-col justify-between gap-1.5 hover:shadow-md transition-shadow duration-300 group"
    aria-label={`${label}: ${value}${unit ? " " + unit : ""}`}
  >
    <div className="flex items-center gap-2 text-openweather-textLight text-[10px] font-semibold uppercase tracking-widest">
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="flex items-start justify-end font-serif text-3xl font-bold text-white leading-none text-right">
      <span>{value}</span>
      {unit && (
        <span className="text-xs font-semibold text-openweather-textLight align-super ml-1">
          {unit}
        </span>
      )}
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      <StatTile
        icon="💨"
        label="Wind"
        value={windSpeed}
        unit="km/h"
      />
      <StatTile
        icon="💧"
        label="Humidity"
        value={humidity}
        unit="%"
      />
      <StatTile
        icon="👁️"
        label="Visibility"
        value={visibility}
        unit="km"
      />
      <StatTile
        icon="🌡️"
        label="Pressure"
        value={(pressure / 100).toFixed(0)}
        unit="hPa"
      />
      <StatTile
        icon="☀️"
        label="UV Index"
        value={uvIndex}
        unit="UV"
      />
      <StatTile
        icon="❄️"
        label="Dew Point"
        value={dewPoint}
        unit="°C"
      />
    </div>
  );
};

export default KPIGrid;
