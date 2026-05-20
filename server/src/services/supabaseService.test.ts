import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  getLatestSyncedForecast,
  resetSupabaseWarningsForTests,
} from './supabaseService';
import { logger } from '../utils/logger';

describe('supabaseService', () => {
  afterEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    resetSupabaseWarningsForTests();
    vi.restoreAllMocks();
  });

  it('warns once and falls back when Supabase env vars are missing', async () => {
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => logger);

    await expect(getLatestSyncedForecast()).resolves.toEqual([]);
    await expect(getLatestSyncedForecast()).resolves.toEqual([]);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      { missingVars: ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] },
      'Supabase env vars missing; using in-memory mode until configuration is provided',
    );
  });
});
