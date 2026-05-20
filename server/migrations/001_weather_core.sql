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

grant usage on schema public to service_role;
grant select, insert, update, delete on public.daily_weather_observations to service_role;
grant select, insert, update, delete on public.daily_weather_forecasts to service_role;

create index if not exists idx_weather_observations_location_date
on public.daily_weather_observations (location_id, observed_date desc);

create index if not exists idx_weather_forecasts_location_date_time
on public.daily_weather_forecasts (location_id, forecast_date desc, target_time);

alter table public.daily_weather_observations enable row level security;
alter table public.daily_weather_forecasts enable row level security;

drop policy if exists "No public observation reads" on public.daily_weather_observations;
create policy "No public observation reads"
on public.daily_weather_observations
for select
using (false);

drop policy if exists "No public forecast reads" on public.daily_weather_forecasts;
create policy "No public forecast reads"
on public.daily_weather_forecasts
for select
using (false);
