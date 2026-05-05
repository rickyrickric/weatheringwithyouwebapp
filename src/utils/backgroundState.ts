/**
 * Utility function to determine background state and appropriate text color
 * based on weather conditions and time of day
 */

export type BackgroundState = 'raining' | 'storm' | 'evening' | 'cloudy' | 'night' | 'sunrise' | 'sunshine';

export const getBackgroundState = (weatherId?: number, currentHour?: number): BackgroundState => {
  const resolvedHour = currentHour ?? new Date().getHours();
  const isNightHours = resolvedHour >= 18 || resolvedHour < 5;
  const isEveningHours = resolvedHour >= 16 && resolvedHour < 18;
  const isSunriseHours = resolvedHour >= 5 && resolvedHour < 7;

  // Night takes priority
  if (isNightHours) return 'night';

  // Weather conditions
  if (!weatherId) {
    if (isEveningHours) return 'evening';
    if (isSunriseHours) return 'sunrise';
    return 'sunshine';
  }

  // Storm (200-299 OpenWeather ID range)
  if (weatherId >= 200 && weatherId < 300) return 'storm';

  // Raining (300-399 or 500-599 OpenWeather ID range)
  if ((weatherId >= 300 && weatherId < 400) || (weatherId >= 500 && weatherId < 600)) return 'raining';

  // Cloudy (802-804 OpenWeather ID range)
  if (weatherId >= 802 && weatherId <= 804) return 'cloudy';

  // Clear (800-801 OpenWeather ID range)
  if (weatherId === 800 || weatherId === 801) {
    if (isEveningHours) return 'evening';
    if (isSunriseHours) return 'sunrise';
    return 'sunshine';
  }

  // Default fallback
  if (isEveningHours) return 'evening';
  if (isSunriseHours) return 'sunrise';
  return 'sunshine';
};

/**
 * Get text color class based on background state
 * Used for dynamic text color adaptation for readability
 */
export const getTextColorClass = (backgroundState: BackgroundState): string => {
  const colorMap: Record<BackgroundState, string> = {
    raining: 'text-contrast-raining',      // Light text for dark rainy backgrounds
    storm: 'text-contrast-storm',          // Brightest text for very dark storm
    evening: 'text-contrast-evening',      // White text for warm sunset backgrounds
    cloudy: 'text-contrast-cloudy',        // Dark text for gray cloudy backgrounds
    night: 'text-contrast-night',          // Brightest text for very dark night
    sunrise: 'text-contrast-sunrise',      // White/light text for sunrise
    sunshine: 'text-contrast-sunshine',    // Dark text for bright sunny backgrounds
  };

  return colorMap[backgroundState];
};

/**
 * Get specific color value for a background state (for inline styles)
 */
export const getTextColor = (backgroundState: BackgroundState): string => {
  const colorMap: Record<BackgroundState, string> = {
    raining: '#E5E7EB',      // light gray-200
    storm: '#FFFFFF',        // pure white
    evening: '#FFFFFF',      // pure white
    cloudy: '#1F2937',       // gray-800
    night: '#FFFFFF',        // pure white
    sunrise: '#F5F5F5',      // near white
    sunshine: '#1F2937',     // gray-800
  };

  return colorMap[backgroundState];
};
