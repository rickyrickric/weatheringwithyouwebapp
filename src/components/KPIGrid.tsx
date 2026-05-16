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
    className="condition-tile p-3 min-h-[96px] flex flex-col gap-3 justify-start group"
    aria-label={`${label}: ${value}${unit ? " " + unit : ""}`}
  >
    <div className="flex items-center gap-2 text-label-contrast text-[10px] font-semibold uppercase tracking-widest text-shadow-image">
      <i className={`bi ${icon} text-lg group-hover:scale-110 transition-transform`} aria-hidden="true"></i>
      <span>{label}</span>
    </div>
    <div className="font-serif text-3xl font-bold text-white leading-none text-shadow-image">
      <span>{value}</span>
      {unit && (
        <span className="text-xs font-semibold text-label-contrast align-super ml-1">
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
    <div className="conditions-grid grid grid-cols-2 md:grid-cols-3 gap-2">
      <StatTile
        icon="bi-wind"
        label="Wind"
        value={windSpeed}
        unit="km/h"
      />
      <StatTile
        icon="bi-droplet-fill"
        label="Humidity"
        value={humidity}
        unit="%"
      />
      <StatTile
        icon="bi-eye-fill"
        label="Visibility"
        value={visibility}
        unit="km"
      />
      <StatTile
        icon="bi-thermometer-half"
        label="Pressure"
        value={(pressure / 100).toFixed(0)}
        unit="hPa"
      />
      <StatTile
        icon="bi-sun-fill"
        label="UV Index"
        value={uvIndex}
        unit="UV"
      />
      <StatTile
        icon="bi-snow"
        label="Dew Point"
        value={dewPoint}
        unit="°C"
      />
    </div>
  );
};

export default KPIGrid;
