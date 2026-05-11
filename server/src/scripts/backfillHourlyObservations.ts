import 'dotenv/config';
import { refreshHourlyClimatology90d, storeHourlyObservationRows } from '../services/supabaseService';

type OpenMeteoArchiveResponse = {
  hourly?: {
    time?: string[];
    temperature_2m?: Array<number | null>;
    relative_humidity_2m?: Array<number | null>;
    precipitation?: Array<number | null>;
    rain?: Array<number | null>;
    wind_speed_10m?: Array<number | null>;
    weather_code?: Array<number | null>;
  };
  reason?: string;
};

const DEFAULT_START_DATE = '2026-04-12';
const SOURCE = 'open-meteo-archive';
const API_URL = 'https://archive-api.open-meteo.com/v1/archive';

const getArg = (name: string) => {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
};

const toDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

const requireNumber = (name: string, fallback?: string) => {
  const value = getArg(name) ?? process.env[`OPENWEATHER_${name.toUpperCase()}`] ?? fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Missing numeric ${name}. Set OPENWEATHER_${name.toUpperCase()} or pass --${name}=...`);
  }
  return parsed;
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const estimateRainProbability = (precipitationMm: number | null | undefined) => {
  if (!precipitationMm || precipitationMm <= 0) return 0;
  return Math.round(clamp(20 + precipitationMm * 35, 20, 100));
};

const toIsoManilaHour = (localTime: string) => {
  const [date, time] = localTime.split('T');
  return `${date}T${time}:00+08:00`;
};

async function fetchArchive() {
  const latitude = requireNumber('lat');
  const longitude = requireNumber('lon');
  const startDate = getArg('start') ?? process.env.BACKFILL_START_DATE ?? DEFAULT_START_DATE;
  const endDate = getArg('end') ?? process.env.BACKFILL_END_DATE ?? toDateKey();

  const endpoint = new URL(API_URL);
  endpoint.searchParams.set('latitude', String(latitude));
  endpoint.searchParams.set('longitude', String(longitude));
  endpoint.searchParams.set('start_date', startDate);
  endpoint.searchParams.set('end_date', endDate);
  endpoint.searchParams.set('timezone', 'Asia/Manila');
  endpoint.searchParams.set(
    'hourly',
    [
      'temperature_2m',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'wind_speed_10m',
      'weather_code',
    ].join(','),
  );

  const response = await fetch(endpoint);
  const payload = (await response.json()) as OpenMeteoArchiveResponse;

  if (!response.ok) {
    throw new Error(`Open-Meteo archive request failed: ${response.status} ${payload.reason ?? ''}`.trim());
  }

  return { payload, startDate, endDate };
}

async function main() {
  const { payload, startDate, endDate } = await fetchArchive();
  const hourly = payload.hourly;
  const times = hourly?.time ?? [];

  if (times.length === 0) {
    throw new Error(`No hourly archive rows returned for ${startDate} to ${endDate}`);
  }

  const rows = times.map((time, index) => {
    const precipitation = hourly?.precipitation?.[index] ?? hourly?.rain?.[index] ?? null;

    return {
      observed_at: toIsoManilaHour(time),
      source: SOURCE,
      temperature: hourly?.temperature_2m?.[index] ?? null,
      rain_probability: estimateRainProbability(precipitation),
      rain_mm: precipitation,
      humidity: hourly?.relative_humidity_2m?.[index] ?? null,
      wind_speed: hourly?.wind_speed_10m?.[index] ?? null,
      weather_id: hourly?.weather_code?.[index] ?? null,
      raw_payload: {
        provider: SOURCE,
        localTime: time,
        precipitation,
      },
    };
  });

  for (let index = 0; index < rows.length; index += 500) {
    await storeHourlyObservationRows(rows.slice(index, index + 500));
  }

  await refreshHourlyClimatology90d();

  console.log(
    `Backfilled ${rows.length} hourly observations from ${startDate} to ${endDate} and refreshed hourly_climatology_90d.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
