create table if not exists public.daily_weather_observations (
  id uuid primary key default gen_random_uuid(),
  location_id text not null,
  observed_date date not null,
  observed_at timestamptz not null,
  temperature numeric,
  feels_like numeric,
  humidity numeric,
  pressure numeric,
  wind_speed numeric,
  visibility numeric,
  rain_chance numeric,
  uv_index numeric,
  dew_point numeric,
  weather_id integer,
  condition text,
  source text not null default 'openweather',
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, observed_date)
);

create table if not exists public.daily_weather_forecasts (
  id uuid primary key default gen_random_uuid(),
  location_id text not null,
  forecast_date date not null,
  generated_at timestamptz not null,
  target_time text not null,
  predicted_temperature numeric,
  predicted_rain_probability numeric,
  source text not null default 'openweather',
  accuracy_status text not null default 'pending-dataset',
  raw_payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, forecast_date, target_time)
);

alter table public.daily_weather_observations enable row level security;
alter table public.daily_weather_forecasts enable row level security;

create policy "No public observation reads"
on public.daily_weather_observations
for select
using (false);

create policy "No public forecast reads"
on public.daily_weather_forecasts
for select
using (false);
