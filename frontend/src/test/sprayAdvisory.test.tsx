import { describe, it, expect } from 'vitest';
import { computeSprayAdvisory } from '../utils/sprayAdvisory';
import type { WeatherData } from '../types';

describe('Spray Advisory & Real-time Weather Decision Logic', () => {
  // Test Case 1: Current precipitation = 0 mm and no forecast rain
  it('identifies favorable spray window when current precipitation = 0 mm and no forecast rain', () => {
    const weatherNoRain: WeatherData = {
      source: 'Open-Meteo (open-meteo.com)',
      fetched_at: '2026-10-15T07:30:00Z',
      data: {
        current: {
          time: '2026-10-15T07:30',
          temperature_2m: 24.5,
          relative_humidity_2m: 65,
          precipitation: 0.0,
          weather_code: 1, // Mainly clear
          wind_speed_10m: 6.2, // Optimal breeze (3-12 km/h)
        },
        daily: {
          time: ['2026-10-15', '2026-10-16'],
          temperature_2m_max: [30.0, 31.0],
          temperature_2m_min: [21.0, 22.0],
          precipitation_sum: [0.0, 0.0],
          precipitation_probability_max: [5, 10],
          weather_code: [1, 1],
        },
        hourly: {
          time: ['2026-10-15T07:00', '2026-10-15T08:00', '2026-10-15T09:00', '2026-10-15T10:00'],
          precipitation: [0.0, 0.0, 0.0, 0.0],
          precipitation_probability: [5, 5, 5, 5],
          wind_speed_10m: [6.0, 6.2, 6.5, 7.0],
          relative_humidity_2m: [65, 64, 62, 60],
        },
      },
    };

    const advisoryEn = computeSprayAdvisory(weatherNoRain, 'en');
    expect(advisoryEn.status).toBe('favorable');
    expect(advisoryEn.badgeText).toContain('Favorable Spray Window');
    expect(advisoryEn.currentObsText).toContain('Rain 0.0 mm');
    expect(advisoryEn.forecastText).toContain('0.0 mm');
    expect(advisoryEn.summary).toContain('< 1 mm');
    // Ensure no false rain warning is shown
    expect(advisoryEn.summary).not.toContain('Unfavorable');
    expect(advisoryEn.summary).not.toContain('wash-off');

    // Verify Tamil localization
    const advisoryTa = computeSprayAdvisory(weatherNoRain, 'ta');
    expect(advisoryTa.status).toBe('favorable');
    expect(advisoryTa.badgeText).toContain('சாதகமான தெளிப்பு நேரம்');
    expect(advisoryTa.currentObsText).toContain('மழை 0.0 மி.மீ');
  });

  // Test Case 2: Current precipitation = 0 mm but rain is forecast later
  it('distinguishes current precipitation = 0 mm from future rain forecast later today', () => {
    const weatherRainLater: WeatherData = {
      source: 'Open-Meteo (open-meteo.com)',
      fetched_at: '2026-10-15T07:30:00Z',
      data: {
        current: {
          time: '2026-10-15T07:30',
          temperature_2m: 25.9,
          relative_humidity_2m: 76,
          precipitation: 0.0, // NOT raining right now!
          weather_code: 3, // Overcast
          wind_speed_10m: 1.1, // Calm wind
        },
        daily: {
          time: ['2026-10-15', '2026-10-16'],
          temperature_2m_max: [35.1, 30.1],
          temperature_2m_min: [23.8, 22.8],
          precipitation_sum: [11.6, 16.8], // 11.6 mm rain forecast later
          precipitation_probability_max: [98, 90],
          weather_code: [95, 95],
        },
        hourly: {
          time: [
            '2026-10-15T07:00',
            '2026-10-15T08:00',
            '2026-10-15T09:00',
            '2026-10-15T10:00',
            '2026-10-15T11:00',
          ],
          precipitation: [0.0, 0.0, 0.0, 1.2, 3.4],
          precipitation_probability: [10, 16, 25, 75, 95],
          wind_speed_10m: [1.1, 1.8, 3.4, 6.5, 12.0],
          relative_humidity_2m: [76, 64, 52, 70, 85],
        },
      },
    };

    const advisory = computeSprayAdvisory(weatherRainLater, 'en');

    // Must be unfavorable due to near-term rain forecast
    expect(advisory.status).toBe('unfavorable');
    // Must clearly state that current rainfall is 0.0 mm
    expect(advisory.currentObsText).toContain('Rain 0.0 mm');
    expect(advisory.summary).toContain('Current rainfall is 0.0 mm');
    // Must explain the forecast rain that triggered the advisory
    expect(advisory.forecastText).toContain('Forecast');
    expect(advisory.forecastText).toContain('11.6 mm');
    // Must explain the agronomic chemical wash-off / rainfast drying window reason
    expect(advisory.dryingWindowNotice).toContain('Chemical wash-off risk');
    expect(advisory.reasons.some(r => r.includes('2–4 hour dry "rainfast" period'))).toBe(true);

    // Verify Tamil version preserves the clear distinction
    const advisoryTa = computeSprayAdvisory(weatherRainLater, 'ta');
    expect(advisoryTa.summary).toContain('தற்போதைய மழை 0 மி.மீ');
    expect(advisoryTa.summary).toContain('மழை');
    expect(advisoryTa.forecastText).toContain('11.6 மி.மீ');
  });

  // Test Case 3: Forecast data missing or unavailable
  it('handles missing or unavailable forecast data transparently without inventing values', () => {
    const weatherForecastMissing: WeatherData = {
      source: 'Open-Meteo (open-meteo.com)',
      fetched_at: '2026-10-15T07:30:00Z',
      data: {
        current: {
          time: '2026-10-15T07:30',
          temperature_2m: 23.0,
          relative_humidity_2m: 55,
          precipitation: 0.0,
          weather_code: 0,
          wind_speed_10m: 7.5,
        },
        // daily and hourly are completely omitted / undefined
      },
    };

    const advisory = computeSprayAdvisory(weatherForecastMissing, 'en');
    expect(advisory.badgeText).toContain('Current Observation Only');
    expect(advisory.currentObsText).toContain('Rain 0.0 mm');
    expect(advisory.forecastText).toContain('Forecast data missing from provider');
    expect(advisory.dryingWindowNotice).toContain('Advisory based strictly on current observations');
    // Does NOT crash or fabricate fake rain
    expect(advisory.reasons).toBeDefined();
  });

  // Test Case 4: Wind and humidity values displayed with correct units
  it('formats wind in km/h and humidity in % with proper agronomic thresholds', () => {
    // Subcase 4A: Safe wind (8.5 km/h) and humidity (72%)
    const weatherNormal: WeatherData = {
      source: 'Open-Meteo (open-meteo.com)',
      fetched_at: '2026-10-15T07:30:00Z',
      data: {
        current: {
          time: '2026-10-15T07:30',
          temperature_2m: 26.3,
          relative_humidity_2m: 72,
          precipitation: 0.0,
          weather_code: 1,
          wind_speed_10m: 8.5,
        },
        daily: {
          time: ['2026-10-15'],
          temperature_2m_max: [29.0],
          temperature_2m_min: [20.0],
          precipitation_sum: [0.0],
          precipitation_probability_max: [10],
          weather_code: [1],
        },
      },
    };

    const advisoryNormal = computeSprayAdvisory(weatherNormal, 'en');
    expect(advisoryNormal.currentObsText).toContain('Wind 8.5 km/h');
    expect(advisoryNormal.currentObsText).toContain('Humidity 72%');
    expect(advisoryNormal.currentObsText).toContain('Temp 26.3°C');
    expect(advisoryNormal.currentObsText).toContain('Rain 0.0 mm');

    // Subcase 4B: Excessive wind (> 15 km/h) drift hazard
    const weatherHighWind: WeatherData = {
      ...weatherNormal,
      data: {
        ...weatherNormal.data,
        current: {
          ...weatherNormal.data.current!,
          wind_speed_10m: 19.4,
        },
      },
    };

    const advisoryHighWind = computeSprayAdvisory(weatherHighWind, 'en');
    expect(advisoryHighWind.status).toBe('unfavorable');
    expect(advisoryHighWind.badgeText).toContain('High Wind Drift');
    expect(advisoryHighWind.summary).toContain('19.4 km/h');
    expect(advisoryHighWind.summary).toContain('15 km/h');
  });

  // Test Case 5: Stale or failed weather requests
  it('handles null, undefined, or failed weather requests gracefully', () => {
    const advisoryNull = computeSprayAdvisory(null, 'en');
    expect(advisoryNull.status).toBe('unavailable');
    expect(advisoryNull.badgeText).toBe('Data Unavailable');
    expect(advisoryNull.currentObsText).toBe('Current observations unavailable');
    expect(advisoryNull.forecastText).toBe('Forecast data unavailable');

    const advisoryUndefined = computeSprayAdvisory(undefined, 'ta');
    expect(advisoryUndefined.status).toBe('unavailable');
    expect(advisoryUndefined.badgeText).toBe('தரவு கிடைக்கவில்லை');

    const advisoryEmptyData = computeSprayAdvisory({ source: 'Test', fetched_at: '', data: {} }, 'en');
    expect(advisoryEmptyData.status).toBe('unavailable');
  });
});
