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
  <div className="bg-openweather-card border border-openweather-border rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow duration-300 group">
    <div className="flex items-center gap-2 text-openweather-textLight text-xs font-semibold uppercase tracking-widest">
      <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
      <span>{label}</span>
    </div>
    <div className="font-serif text-3xl font-bold text-openweather-text">
      {value}
      {unit && <span className="text-lg font-normal text-openweather-textLight ml-1">{unit}</span>}
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <StatTile
        icon="💨"
        label="Wind"
        value={windSpeed}
        unit="m/s"
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
