# Forecast Regression Algorithm

The backend smooths OpenWeather forecast points before they reach the UI so charts and sunshine-window scoring are less jumpy.

## Inputs

Each point has:

- `time` as `HH:mm`
- `temperature` in Celsius
- `rainProbability` from `0` to `100`

## Process

1. Convert `time` into a numeric hour, for example `14:30` becomes `14.5`.
2. Fit separate polynomial regression curves for temperature and rain probability.
3. Predict smoothed values for each original timestamp.
4. Round temperature to one decimal place.
5. Clamp rain probability between `0` and `100`.

The current order is `3`, which is high enough to soften short-term changes without making the 24-hour curve too rigid.

## Tests

The backend test suite verifies that smoothing preserves the number of forecast points and keeps rain probabilities in range.
