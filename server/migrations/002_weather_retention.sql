create table if not exists public.archived_daily_weather_observations
(like public.daily_weather_observations including all);

create table if not exists public.archived_daily_weather_forecasts
(like public.daily_weather_forecasts including all);

create index if not exists idx_archived_weather_observations_location_date
on public.archived_daily_weather_observations (location_id, observed_date desc);

create index if not exists idx_archived_weather_forecasts_location_date_time
on public.archived_daily_weather_forecasts (location_id, forecast_date desc, target_time);

create or replace function public.archive_weather_records_older_than(retention interval default interval '30 days')
returns void
language plpgsql
security definer
as $$
begin
  insert into public.archived_daily_weather_observations
  select *
  from public.daily_weather_observations
  where observed_at < now() - retention
  on conflict do nothing;

  delete from public.daily_weather_observations
  where observed_at < now() - retention;

  insert into public.archived_daily_weather_forecasts
  select *
  from public.daily_weather_forecasts
  where generated_at < now() - retention
  on conflict do nothing;

  delete from public.daily_weather_forecasts
  where generated_at < now() - retention;
end;
$$;
