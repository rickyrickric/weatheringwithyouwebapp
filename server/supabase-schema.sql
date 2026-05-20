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

create index if not exists idx_weather_observations_location_date
on public.daily_weather_observations (location_id, observed_date desc);

create index if not exists idx_weather_forecasts_location_date_time
on public.daily_weather_forecasts (location_id, forecast_date desc, target_time);

create table if not exists public.weather_observations (
  id uuid primary key default gen_random_uuid(),
  location_id text not null,
  observed_at timestamptz not null,
  source text not null default 'openweather',
  temperature numeric,
  rain_probability numeric,
  rain_mm numeric,
  humidity numeric,
  wind_speed numeric,
  weather_id integer,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, observed_at, source)
);

grant usage on schema public to service_role;
grant select, insert, update, delete on public.weather_observations to service_role;

create index if not exists idx_weather_observations_hourly_location_time
on public.weather_observations (location_id, observed_at desc);

alter table public.weather_observations enable row level security;

create policy "No public hourly observation reads"
on public.weather_observations
for select
using (false);

create materialized view if not exists public.hourly_climatology_90d as
select
  location_id,
  extract(hour from observed_at at time zone 'Asia/Manila')::integer as hour_of_day,
  avg(temperature) filter (where temperature between -20 and 60) as avg_temperature,
  stddev_samp(temperature) filter (where temperature between -20 and 60) as std_temperature,
  count(temperature) filter (where temperature between -20 and 60) as temperature_count,
  avg(rain_probability) filter (where rain_probability between 0 and 100) as avg_rain_probability,
  stddev_samp(rain_probability) filter (where rain_probability between 0 and 100) as std_rain_probability,
  count(rain_probability) filter (where rain_probability between 0 and 100) as rain_probability_count,
  avg(rain_mm) filter (where rain_mm >= 0 and rain_mm <= 500) as avg_rain_mm,
  max(observed_at) as latest_observed_at
from public.weather_observations
where observed_at >= now() - interval '90 days'
group by location_id, extract(hour from observed_at at time zone 'Asia/Manila')::integer;

create unique index if not exists idx_hourly_climatology_90d_location_hour
on public.hourly_climatology_90d (location_id, hour_of_day);

create or replace function public.refresh_hourly_climatology_90d()
returns void
language sql
security definer
as $$
  refresh materialized view concurrently public.hourly_climatology_90d;
$$;

grant select on public.hourly_climatology_90d to service_role;
grant execute on function public.refresh_hourly_climatology_90d() to service_role;

notify pgrst, 'reload schema';
