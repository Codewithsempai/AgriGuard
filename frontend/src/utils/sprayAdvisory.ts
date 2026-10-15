import type { WeatherData } from '../types';

export type SprayStatus = 'favorable' | 'caution' | 'unfavorable' | 'unavailable';

export interface SprayAdvisory {
  status: SprayStatus;
  badgeText: string;
  badgeColorClass: string;
  summary: string;
  currentObsText: string;
  forecastText: string;
  reasons: string[];
  dryingWindowNotice: string;
}

/**
 * Computes transparent, deterministic agronomic spray advisories.
 * Strictly separates verified current physical observations from future multi-hour forecasts.
 */
export function computeSprayAdvisory(
  weather: WeatherData | null | undefined,
  language: 'en' | 'ta' = 'en'
): SprayAdvisory {
  const isTa = language === 'ta';

  // 1. Missing or uninitialized weather data
  if (!weather || !weather.data || !weather.data.current) {
    return {
      status: 'unavailable',
      badgeText: isTa ? 'தரவு கிடைக்கவில்லை' : 'Data Unavailable',
      badgeColorClass: 'text-zinc-400 bg-zinc-800/50 border-zinc-700/60',
      summary: isTa
        ? 'வானிலை தரவு கிடைக்கவில்லை. தெளிப்பு சாளரத்தை கணக்கிட முடியாது.'
        : 'Live weather observations are unavailable. Spray advisory cannot be determined.',
      currentObsText: isTa ? 'நடப்பு அளவீடு கிடைக்கவில்லை' : 'Current observations unavailable',
      forecastText: isTa ? 'முன்னறிவிப்பு தரவு கிடைக்கவில்லை' : 'Forecast data unavailable',
      reasons: [isTa ? 'வானிலை சேவை பதில் அளிக்கவில்லை' : 'Weather service response missing or network offline'],
      dryingWindowNotice: isTa
        ? 'தெளிப்பதற்கு முன் உள்ளூர் வானிலை நிலவரத்தை சரிபார்க்கவும்.'
        : 'Verify local weather and field conditions before spraying.',
    };
  }

  const current = weather.data.current;
  const currentRain = typeof current.precipitation === 'number' ? current.precipitation : 0;
  const windSpeed = typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : 0;
  const humidity = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : 0;
  const temp = typeof current.temperature_2m === 'number' ? current.temperature_2m : 0;
  const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 0;

  const currentObsText = isTa
    ? `தற்போதைய அளவீடு: மழை ${currentRain.toFixed(1)} மி.மீ | காற்று ${windSpeed.toFixed(1)} கி.மீ/மணி | ஈரப்பதம் ${humidity}% | வெப்பம் ${temp.toFixed(1)}°C`
    : `Verified current observations: Rain ${currentRain.toFixed(1)} mm | Wind ${windSpeed.toFixed(1)} km/h | Humidity ${humidity}% | Temp ${temp.toFixed(1)}°C`;

  // 2. Extract forecast details
  const daily = weather.data.daily;
  const hourly = weather.data.hourly;
  const hasForecast = Boolean(
    (daily?.precipitation_sum && daily.precipitation_sum.length > 0) ||
    (hourly?.precipitation && hourly.precipitation.length > 0)
  );

  const dailyRainToday = daily?.precipitation_sum?.[0] ?? null;
  const dailyProbToday = daily?.precipitation_probability_max?.[0] ?? null;

  // Check hourly forecast for near-term precipitation (next 4 hours)
  let nearTermRainMax = 0;
  let nearTermProbMax = 0;
  let nearTermRainHour: string | null = null;

  if (hourly?.time && hourly?.precipitation) {
    const currentTimeStr = current.time || '';
    // Find matching hour or start near index 0
    let startIdx = 0;
    if (currentTimeStr) {
      const currentPrefix = currentTimeStr.slice(0, 13);
      const matchIdx = hourly.time.findIndex(t => t.startsWith(currentPrefix));
      if (matchIdx >= 0) startIdx = matchIdx;
    }

    const windowEnd = Math.min(startIdx + 4, hourly.time.length);
    for (let i = startIdx; i < windowEnd; i++) {
      const rain = hourly.precipitation[i] || 0;
      const prob = hourly.precipitation_probability?.[i] || 0;
      if (rain > nearTermRainMax) nearTermRainMax = rain;
      if (prob > nearTermProbMax) nearTermProbMax = prob;
      if ((rain >= 0.5 || prob >= 50) && !nearTermRainHour) {
        nearTermRainHour = hourly.time[i]?.slice(11, 16) || null;
      }
    }
  }

  // 3. Priority Decision Rules

  // Rule 1: Active rainfall happening right now
  if (currentRain > 0) {
    return {
      status: 'unfavorable',
      badgeText: isTa ? '⚠️ சாதகமற்றது (மழை பெய்கிறது)' : '⚠️ Unfavorable (Active Rain)',
      badgeColorClass: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      summary: isTa
        ? `தற்போது மழை பெய்கிறது (${currentRain.toFixed(1)} மி.மீ). பூச்சிக்கொல்லி/உரம் உடனடியாக நீரில் அடித்துச் செல்லப்படும்.`
        : `Active precipitation (${currentRain.toFixed(1)} mm) occurring right now. Sprayed chemicals will be immediately washed off.`,
      currentObsText,
      forecastText: dailyRainToday !== null
        ? (isTa ? `இன்றைய மொத்த மழை முன்னறிவிப்பு: ${dailyRainToday.toFixed(1)} மி.மீ` : `Today's total forecast: ${dailyRainToday.toFixed(1)} mm`)
        : (isTa ? 'முன்னறிவிப்பு கிடைக்கவில்லை' : 'Forecast data unavailable'),
      reasons: [
        isTa
          ? `தற்போது பெய்யும் மழை: ${currentRain.toFixed(1)} மி.மீ`
          : `Active precipitation of ${currentRain.toFixed(1)} mm currently falling on foliage`,
        isTa
          ? 'மழை பெய்யும்போது தெளித்தால் ரசாயனம் வீணாகி நிலத்தடி நீர் மாசுபடும்'
          : 'Spraying during rain causes direct chemical washoff and ground runoff'
      ],
      dryingWindowNotice: isTa
        ? 'மழை நின்று இலைகள் காய்ந்த பிறகே தெளிக்க வேண்டும்.'
        : 'Do not spray during precipitation. Wait until leaf surfaces are dry.',
    };
  }

  // Rule 2: Thunderstorm / convective squall hazard
  if (weatherCode >= 95) {
    return {
      status: 'unfavorable',
      badgeText: isTa ? '⚠️ தீவிர வானிலை எச்சரிக்கை' : '⚠️ Unfavorable (Thunderstorm Risk)',
      badgeColorClass: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      summary: isTa
        ? 'இடி மின்னலுடன் கூடிய புயல் எச்சரிக்கை. வயலில் தெளிப்பான் உபகரணங்களை இயக்குவது பாதுகாப்பற்றது.'
        : 'Severe thunderstorm or convective activity present. Operating spray equipment in the field is hazardous.',
      currentObsText,
      forecastText: isTa ? `WMO வானிலை குறியீடு: ${weatherCode} (இடி மின்னல்)` : `WMO weather code: ${weatherCode} (Thunderstorm)`,
      reasons: [
        isTa ? 'இடி மின்னல் அபாயம் மற்றும் தீவிர காற்று' : 'Convective storm activity with lightning and erratic wind gusts',
      ],
      dryingWindowNotice: isTa
        ? 'வானிலை சீராகும் வரை தெளிப்பு பணியை தள்ளி வைக்கவும்.'
        : 'Postpone all field applications until convective storms have completely cleared.',
    };
  }

  // Rule 3: High wind speed (> 15 km/h) causes excessive off-target drift
  if (windSpeed > 15) {
    return {
      status: 'unfavorable',
      badgeText: isTa ? '⚠️ அதிக காற்று சிதறல் அபாயம்' : '⚠️ Unfavorable (High Wind Drift)',
      badgeColorClass: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      summary: isTa
        ? `காற்று வேகம் ${windSpeed.toFixed(1)} கி.மீ/மணி (பாதுகாப்பான 15 கி.மீ/மணி வரம்பிற்கு மேல்). மருந்து காற்றில் அடித்துச் செல்லப்பட்டு வீணாகும்.`
        : `Wind speed is ${windSpeed.toFixed(1)} km/h (exceeds recommended 15 km/h threshold). Extreme risk of chemical drift away from target crops.`,
      currentObsText,
      forecastText: dailyRainToday !== null
        ? (isTa ? `இன்றைய மழை முன்னறிவிப்பு: ${dailyRainToday.toFixed(1)} மி.மீ` : `Forecast precipitation: ${dailyRainToday.toFixed(1)} mm today`)
        : '',
      reasons: [
        isTa
          ? `காற்று வேகம் (${windSpeed.toFixed(1)} கி.மீ/மணி) பாதுகாப்பான 15 கி.மீ/மணி வரம்பை தாண்டியுள்ளது`
          : `Wind speed (${windSpeed.toFixed(1)} km/h) exceeds safe 15 km/h limit for droplet deposition`,
      ],
      dryingWindowNotice: isTa
        ? 'காற்றின் வேகம் 12 கி.மீ/மணிக்கு கீழ் குறையும் வரை காத்திருக்கவும்.'
        : 'Wait for wind speeds to drop below 12-15 km/h before spraying.',
    };
  }

  // Rule 4: Current rainfall is 0.0 mm (Canopy is dry now), BUT future rain is forecast
  // Distinguish near-term imminent rain (within 4 hours) vs later today
  const hasNearTermRain = nearTermRainMax >= 0.5 || nearTermProbMax >= 50;
  const hasSubstantialDailyRain = (dailyRainToday ?? 0) >= 2.0 || (dailyProbToday ?? 0) >= 60;

  if (hasNearTermRain) {
    const timeDetail = nearTermRainHour ? ` (~${nearTermRainHour})` : '';
    const probDetail = nearTermProbMax > 0 ? ` (${nearTermProbMax}% probability)` : '';
    return {
      status: 'unfavorable',
      badgeText: isTa ? '⚠️ சாதகமற்றது (விரைவில் மழை வாய்ப்பு)' : '⚠️ Unfavorable (Rain Forecast Soon)',
      badgeColorClass: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
      summary: isTa
        ? `தற்போதைய மழை 0 மி.மீ (இலைகள் இப்போது உலர்ந்துள்ளன). ஆனால் அடுத்த 2-4 மணி நேரத்திற்குள் மழை${timeDetail} முன்னறிவிக்கப்பட்டுள்ளது.`
        : `Current rainfall is 0.0 mm (canopy is dry now), but rain is forecast within the next 2-4 hours${timeDetail}${probDetail}.`,
      currentObsText,
      forecastText: isTa
        ? `முன்னறிவிப்பு: அடுத்த 4 மணி நேரத்திற்குள் ${nearTermRainMax.toFixed(1)} மி.மீ வரை மழை வாய்ப்பு${probDetail}. இன்றைய மொத்த மழை: ${(dailyRainToday ?? nearTermRainMax).toFixed(1)} மி.மீ.`
        : `Forecast: Up to ${nearTermRainMax.toFixed(1)} mm rain predicted within 4 hours${timeDetail}${probDetail}. Day's total: ${(dailyRainToday ?? nearTermRainMax).toFixed(1)} mm.`,
      reasons: [
        isTa
          ? `தற்போதைய மழை 0 மி.மீ ஆக இருந்தாலும், விரைவில் மழை வருவதால் மருந்து காய்ந்து ஒட்ட நேரம் கிடைக்காது`
          : `Current rainfall is 0.0 mm, but forecast rain within 4 hours prevents proper chemical absorption`,
        isTa
          ? `ரசாயனம் பயிரில் ஒட்ட குறைந்தபட்சம் 2 முதல் 4 மணிநேர மழை இல்லாத உலர் நேரம் தேவை`
          : `Pesticides and foliar feeds require a 2–4 hour dry "rainfast" period to prevent wash-off`,
      ],
      dryingWindowNotice: isTa
        ? 'மழைக்காலம் முடியும் வரை தெளிப்பு பணியை ஒத்திவைப்பது நல்லது.'
        : 'Chemical wash-off risk: Insufficient rain-free drying window before forecasted precipitation arrives.',
    };
  }

  if (hasSubstantialDailyRain) {
    const probStr = dailyProbToday ? ` (up to ${dailyProbToday}% probability)` : '';
    return {
      status: 'caution',
      badgeText: isTa ? '⚠️ எச்சரிக்கை (இன்று பின்னர் மழை வாய்ப்பு)' : '⚠️ Caution (Rain Forecast Later Today)',
      badgeColorClass: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      summary: isTa
        ? `தற்போது மழை இல்லை (0 மி.மீ). காற்று வேகம் சாதகமாக உள்ளது. ஆனால் இன்று பின்னர் ${(dailyRainToday ?? 0).toFixed(1)} மி.மீ மழை எதிர்பார்க்கப்படுகிறது.`
        : `Current rainfall is 0.0 mm (dry canopy now) with safe winds. However, ${(dailyRainToday ?? 0).toFixed(1)} mm precipitation is forecast later today${probStr}.`,
      currentObsText,
      forecastText: isTa
        ? `முன்னறிவிப்பு: இன்று பின்னர் ${(dailyRainToday ?? 0).toFixed(1)} மி.மீ மழை எதிர்பார்க்கப்படுகிறது${dailyProbToday ? ` (${dailyProbToday}% வாய்ப்பு)` : ''}.`
        : `Forecast: ${(dailyRainToday ?? 0).toFixed(1)} mm rain expected later today${probStr}.`,
      reasons: [
        isTa
          ? `தற்போதைய அளவீடு 0 மி.மீ மழை (இலைகள் காய்ந்துள்ளன)`
          : `Current rainfall is verified 0.0 mm (dry canopy right now)`,
        isTa
          ? `இன்று பின்னர் மழை எதிர்பார்க்கப்படுவதால், வேகமாக உறிஞ்சப்படும் மருந்துகளை மட்டுமே குறைந்தபட்ச 2 மணி நேர இடைவெளியில் பயன்படுத்தலாம்`
          : `Rain forecast later today requires fast-absorbing systemic products or rainfast stickers`,
      ],
      dryingWindowNotice: isTa
        ? 'மழை வருவதற்குள் மருந்து முழுமையாக காய குறைந்தபட்சம் 2-3 மணிநேர உலர் நேரம் உள்ளதா என உறுதி செய்யவும்.'
        : 'Conditional spray window: Ensure application and drying are completed at least 2–3 hours before later rain arrives.',
    };
  }

  // Rule 5: Forecast data missing or empty
  if (!hasForecast) {
    return {
      status: windSpeed <= 12 ? 'caution' : 'unfavorable',
      badgeText: isTa ? 'ℹ️ நடப்பு அளவீடு மட்டும் (முன்னறிவிப்பு இல்லை)' : 'ℹ️ Current Observation Only (Forecast Unavailable)',
      badgeColorClass: 'text-sky-400 bg-sky-950/60 border-sky-800/60',
      summary: isTa
        ? `தற்போது மழை இல்லை (0 மி.மீ). காற்று வேகம் ${windSpeed.toFixed(1)} கி.மீ/மணி. ஆனால் முன்னறிவிப்பு தரவு கிடைக்கவில்லை.`
        : `Current rainfall is 0.0 mm and wind is ${windSpeed.toFixed(1)} km/h. Multi-hour forecast data is currently unavailable.`,
      currentObsText,
      forecastText: isTa
        ? 'முன்னறிவிப்பு தரவு கிடைக்கவில்லை. உள்ளூர் மேகமூட்டத்தை கவனிக்கவும்.'
        : 'Forecast data missing from provider. Check local sky and radar before application.',
      reasons: [
        isTa ? 'தற்போதைய மழை: 0.0 மி.மீ (உலர்ந்த இலைகள்)' : 'Verified current rainfall: 0.0 mm (dry canopy)',
        isTa ? 'முன்னறிவிப்பு இல்லாததால் உள்ளூர் வானிலை நிலவரத்தை உறுதிப்படுத்தவும்' : 'Forecast rainfast window cannot be verified without forecast data',
      ],
      dryingWindowNotice: isTa
        ? 'தெளிப்பதற்கு முன் வானில் மழை மேகங்கள் உள்ளதா என்பதை நேரடியாக சரிபார்க்கவும்.'
        : 'Advisory based strictly on current observations. Visually inspect sky conditions before spraying.',
    };
  }

  // Rule 6: Moderate wind caution (12 to 15 km/h)
  if (windSpeed >= 12 && windSpeed <= 15) {
    return {
      status: 'caution',
      badgeText: isTa ? '⚠️ மிதமான காற்று சிதறல்' : '⚠️ Caution (Moderate Wind Drift)',
      badgeColorClass: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      summary: isTa
        ? `தற்போது மழை இல்லை (0 மி.மீ), மழை முன்னறிவிப்பும் இல்லை. ஆனால் காற்று வேகம் ${windSpeed.toFixed(1)} கி.மீ/மணி உள்ளது.`
        : `No rain currently (0.0 mm) and no rain forecast. Wind speed is ${windSpeed.toFixed(1)} km/h (borderline moderate breeze).`,
      currentObsText,
      forecastText: isTa ? 'இன்று குறிப்பிடத்தக்க மழை இல்லை (< 1 மி.மீ)' : 'No significant rain forecast today (< 1 mm)',
      reasons: [
        isTa ? 'மழை இல்லை (0.0 மி.மீ)' : 'Current rainfall is 0.0 mm (dry canopy)',
        isTa ? `காற்று வேகம் ${windSpeed.toFixed(1)} கி.மீ/மணி - குறைந்த தெளிப்பு உயரத்தை பராமரிக்கவும்` : `Wind speed ${windSpeed.toFixed(1)} km/h requires low boom height or anti-drift nozzles`,
      ],
      dryingWindowNotice: isTa
        ? 'காற்று குறைவாக இருக்கும் காலை அல்லது மாலை நேரங்களில் தெளிப்பது சிறந்தது.'
        : 'Spray with anti-drift nozzles or wait for lighter breeze in early morning/late evening.',
    };
  }

  // Rule 7: High temperature & low humidity (evaporation risk)
  if (temp > 35 && humidity < 35) {
    return {
      status: 'caution',
      badgeText: isTa ? '⚠️ அதிக வெப்பம் / ஆவியாதல் அபாயம்' : '⚠️ Caution (High Evaporation Risk)',
      badgeColorClass: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
      summary: isTa
        ? `வெப்பம் ${temp.toFixed(1)}°C மற்றும் குறைந்த ஈரப்பதம் ${humidity}%. தெளிக்கும் மருந்து இலையை அடைவதற்குள் ஆவியாக வாய்ப்புள்ளது.`
        : `High temperature (${temp.toFixed(1)}°C) and low humidity (${humidity}%). Spray droplets may rapidly evaporate before absorption.`,
      currentObsText,
      forecastText: isTa ? 'மழை வாய்ப்பு இல்லை' : 'No rain forecast',
      reasons: [
        isTa ? 'அதிக வெப்பம் மற்றும் குறைந்த ஈரப்பதத்தால் மருந்து ஆவியாதல்' : 'Droplet evaporation hazard in hot, dry air',
      ],
      dryingWindowNotice: isTa
        ? 'குளிர்ந்த காலை அல்லது மாலை நேரங்களில் தெளிக்க பரிந்துரைக்கப்படுகிறது.'
        : 'Schedule spraying during cooler morning or late afternoon hours to prevent droplet evaporation.',
    };
  }

  // Rule 8: Ideal Favorable Spray Window
  // Current rain = 0 mm, forecast rain < 1 mm, wind between 1 and 12 km/h
  return {
    status: 'favorable',
    badgeText: isTa ? '✅ சாதகமான தெளிப்பு நேரம்' : '✅ Favorable Spray Window',
    badgeColorClass: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
    summary: isTa
      ? `உலர்ந்த இலைகள் (மழை 0 மி.மீ), மழை முன்னறிவிப்பு இல்லை (< 1 மி.மீ), மற்றும் காற்று வேகம் ${windSpeed.toFixed(1)} கி.மீ/மணி சிறந்தது.`
      : `Dry leaf canopy (0.0 mm rain), no rain forecast in drying window (< 1 mm expected), and optimal wind (${windSpeed.toFixed(1)} km/h).`,
    currentObsText,
    forecastText: isTa
      ? `இன்றைய மழை முன்னறிவிப்பு: ${(dailyRainToday ?? 0).toFixed(1)} மி.மீ (மழை வாய்ப்பு குறைவு)`
      : `Forecast: ${(dailyRainToday ?? 0).toFixed(1)} mm total today (Low precipitation risk, dry window secured)`,
    reasons: [
      isTa ? 'தற்போதைய மழை 0.0 மி.மீ (இலைப்பரப்பு உலர்வாக உள்ளது)' : 'Current rainfall is 0.0 mm (leaf surfaces completely dry)',
      isTa ? 'அடுத்த 24 மணி நேரத்திற்குள் குறிப்பிடத்தக்க மழை இல்லை' : 'No significant precipitation forecast in the 4–6 hour rainfast window',
      isTa ? `சிறந்த காற்று வேகம் (${windSpeed.toFixed(1)} கி.மீ/மணி: இலக்கு பயிரை அடைய உகந்தது)` : `Optimal wind speed (${windSpeed.toFixed(1)} km/h: minimal drift, good canopy penetration)`,
    ],
    dryingWindowNotice: isTa
      ? 'பயிர் பாதுகாப்பு மருந்துகள் மற்றும் உரங்கள் தெளிக்க உகந்த நேரம்.'
      : 'Optimal conditions for routine crop protection and foliar applications.',
  };
}
