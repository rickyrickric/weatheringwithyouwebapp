import { useMemo } from 'react';
import { getBackgroundState, getTextColorClass, type BackgroundState } from '../utils/backgroundState';

interface UseBackgroundStateResult {
  backgroundState: BackgroundState;
  textColorClass: string;
}

/**
 * Custom hook to get the current background state and corresponding text color class
 * @param weatherId - OpenWeather API weather ID
 * @param currentHour - Current hour (0-23)
 * @returns Object containing background state and text color class
 */
export const useBackgroundState = (weatherId?: number, currentHour?: number): UseBackgroundStateResult => {
  const result = useMemo(() => {
    const state = getBackgroundState(weatherId, currentHour);
    return {
      backgroundState: state,
      textColorClass: getTextColorClass(state),
    };
  }, [weatherId, currentHour]);

  return result;
};
