import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun, Droplets, Wind, Thermometer, CloudRain, AlertTriangle,
  Compass, MapPin, RefreshCw, Sun, Cloud, Search, Navigation,
  SlidersHorizontal, Check, Globe
} from 'lucide-react';
import { api } from '../services/api';
import type { Farm, WeatherData } from '../types';
import { LoadingSkeleton } from '../components/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

interface GeoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}

const PRESET_LOCATIONS = [
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558, tag: 'TN' },
  { name: 'Thanjavur', lat: 10.7870, lon: 79.1378, tag: 'TN Rice Belt' },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198, tag: 'TN' },
  { name: 'Salem', lat: 11.6643, lon: 78.1460, tag: 'TN' },
  { name: 'Punjab (Ludhiana)', lat: 30.9010, lon: 75.8573, tag: 'Wheat Hub' },
  { name: 'Nashik', lat: 19.9975, lon: 73.7898, tag: 'Onion/Grape' },
  { name: 'Bengaluru Rural', lat: 12.9716, lon: 77.5946, tag: 'KA' },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.2090, tag: 'North' },
];

const getWeatherMeta = (code: number | undefined, lang: string) => {
  if (code === undefined) return { label: lang === 'ta' ? 'வானிலை தகவல்' : 'Weather Data', icon: CloudSun };
  if (code === 0) return { label: lang === 'ta' ? 'தெளிவான வானம்' : 'Clear Sky', icon: Sun };
  if (code === 1 || code === 2) return { label: lang === 'ta' ? 'பகுதி மேகமூட்டம்' : 'Partly Cloudy', icon: CloudSun };
  if (code === 3) return { label: lang === 'ta' ? 'முழு மேகமூட்டம்' : 'Overcast', icon: Cloud };
  if (code === 45 || code === 48) return { label: lang === 'ta' ? 'மூடுபனி' : 'Foggy', icon: Cloud };
  if (code >= 51 && code <= 57) return { label: lang === 'ta' ? 'தூறல் மழை' : 'Drizzle', icon: Droplets };
  if (code >= 61 && code <= 67) return { label: lang === 'ta' ? 'மழைப்பொழிவு' : 'Rain', icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: lang === 'ta' ? 'பனிப்பொழிவு' : 'Snowfall', icon: Cloud };
  if (code >= 80 && code <= 82) return { label: lang === 'ta' ? 'கனமழை' : 'Showers', icon: CloudRain };
  if (code >= 95) return { label: lang === 'ta' ? 'இடி மின்னல் மழை' : 'Thunderstorm', icon: AlertTriangle };
  return { label: lang === 'ta' ? 'வானிலை மாற்றம்' : 'Variable', icon: CloudSun };
};

const getDayAdvisory = (rain: number, maxTemp: number, code: number, lang: string) => {
  if (code >= 95) {
    return lang === 'ta'
      ? 'இடி மின்னல் எச்சரிக்கை - தெளிப்பை தவிர்க்கவும்'
      : 'Thunderstorm warning - pause field spray';
  }
  if (rain >= 10) {
    return lang === 'ta'
      ? 'கனமழை வாய்ப்பு - பாசனத்தை முழுமையாக நிறுத்தவும்'
      : 'Substantial rain - suspend irrigation';
  }
  if (rain >= 2) {
    return lang === 'ta'
      ? 'லேசான மழை - உரம்/பூச்சிக்கொல்லி தெளிப்பை ஒத்திவைக்கவும்'
      : 'Moderate showers - postpone chemical application';
  }
  if (maxTemp >= 36) {
    return lang === 'ta'
      ? 'அதிக வெப்பம் - காலை/மாலையில் கூடுதல் பாசனம் தேவை'
      : 'High heat index - schedule morning/evening irrigation';
  }
  return lang === 'ta'
    ? 'சாதகமான சூழல் - வழக்கமான விவசாய பணிகளை தொடரலாம்'
    : 'Favorable conditions for routine crop management';
};

export const Weather: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [farms, setFarms] = useState<Farm[]>([]);
  const [lat, setLat] = useState<number>(11.0168); // Coimbatore default
  const [lon, setLon] = useState<number>(76.9558);
  const [locationName, setLocationName] = useState('Coimbatore Region, TN');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Geocoding states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Custom coordinates modal/toggle
  const [showCoordInput, setShowCoordInput] = useState(false);
  const [customLat, setCustomLat] = useState('11.0168');
  const [customLon, setCustomLon] = useState('76.9558');

  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    api.getFarms()
      .then((res) => {
        setFarms(res.items);
        if (res.items.length > 0 && res.items[0].latitude && res.items[0].longitude) {
          setLat(res.items[0].latitude);
          setLon(res.items[0].longitude);
          setLocationName(res.items[0].name);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchWeather = (latitude: number, longitude: number, name?: string) => {
    setLoading(true);
    setError(null);
    if (name) setLocationName(name);
    api.getWeather(latitude, longitude)
      .then(setWeather)
      .catch((err) => {
        console.error(err);
        setError('Live weather forecast is currently unavailable from Open-Meteo or network is offline.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather(lat, lon);
  }, [lat, lon]);

  // Debounced search query handler
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resp = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=6&language=en&format=json`
        );
        if (resp.ok) {
          const data = await resp.json();
          setSearchResults(data.results || []);
          setShowDropdown(true);
        }
      } catch (err) {
        console.error('Geocoding search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectLocation = (res: GeoResult) => {
    const displayName = `${res.name}${res.admin1 ? `, ${res.admin1}` : ''}${res.country ? ` (${res.country})` : ''}`;
    setLat(res.latitude);
    setLon(res.longitude);
    setLocationName(displayName);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = Number(pos.coords.latitude.toFixed(4));
        const userLon = Number(pos.coords.longitude.toFixed(4));
        setLat(userLat);
        setLon(userLon);
        setLocationName(language === 'ta' ? 'தற்போதைய ஜிபிஎஸ் இருப்பிடம்' : 'My Current GPS Location');
        setGpsLoading(false);
      },
      (err) => {
        console.error(err);
        alert(language === 'ta' ? 'ஜிபிஎஸ் இருப்பிடத்தை பெற முடியவில்லை' : 'Unable to retrieve your current location.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectFarm = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const farmId = Number(e.target.value);
    const farm = farms.find((f) => f.id === farmId);
    if (farm && farm.latitude && farm.longitude) {
      setLat(farm.latitude);
      setLon(farm.longitude);
      setLocationName(farm.name);
    }
  };

  const handleApplyCustomCoords = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLat = parseFloat(customLat);
    const parsedLon = parseFloat(customLon);
    if (isNaN(parsedLat) || isNaN(parsedLon)) {
      alert('Please enter valid numeric latitude and longitude');
      return;
    }
    setLat(parsedLat);
    setLon(parsedLon);
    setLocationName(`Custom (${parsedLat.toFixed(4)}, ${parsedLon.toFixed(4)})`);
    setShowCoordInput(false);
  };

  const current = weather?.data?.current;
  const daily = weather?.data?.daily;

  // Prepare 7-day forecast chart data
  const forecastChartData = daily?.time?.map((dateStr, idx) => ({
    date: dateStr.slice(5),
    fullDate: dateStr,
    MaxTemp: daily.temperature_2m_max?.[idx] ?? 0,
    MinTemp: daily.temperature_2m_min?.[idx] ?? 0,
    Rainfall: daily.precipitation_sum?.[idx] ?? 0,
    code: daily.weather_code?.[idx] ?? 0,
  })) || [];

  const currentMeta = getWeatherMeta(current?.weather_code, language);
  const CurrentWeatherIcon = currentMeta.icon;

  // Spray advisory
  const isHighRain = (daily?.precipitation_sum?.[0] || 0) > 2.0;
  const isHighWind = (current?.wind_speed_10m || 0) > 15;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {t('nav_weather')}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            {language === 'ta'
              ? 'விவசாய தெளிப்பான் மற்றும் பாசன திட்டமிடலுக்கான துல்லியமான உலகளாவிய வானிலை முன்னறிவிப்பு'
              : 'Precision agrometeorological insights for irrigation timing, spray windows, and frost alerts.'}
          </p>
        </div>

        {/* Quick controls right */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={() => fetchWeather(lat, lon)}
            className="rounded-xl border border-zinc-200 bg-white/90 p-2.5 text-zinc-600 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:bg-zinc-800 transition shadow-xs"
            title="Refresh forecast"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* GPS current location button */}
          <button
            onClick={handleUseGPS}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
            title="Detect GPS location"
          >
            <Navigation className={`h-3.5 w-3.5 text-zinc-900 dark:text-white ${gpsLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{language === 'ta' ? 'என் இருப்பிடம்' : 'Use My GPS'}</span>
          </button>

          {/* Farm location picker */}
          {farms.length > 0 && (
            <div className="flex items-center gap-1.5">
              <select
                onChange={handleSelectFarm}
                className="rounded-xl border border-zinc-200 bg-white/90 px-3 py-2 text-xs font-semibold text-zinc-800 focus:border-zinc-500 focus:outline-hidden dark:border-white/10 dark:bg-zinc-900/90 dark:text-white"
              >
                <option value="">{language === 'ta' ? 'பண்ணையை தேர்வு செய்க...' : 'Select Farm...'}</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.latitude ? `${f.latitude.toFixed(2)}, ${f.longitude?.toFixed(2)}` : 'No GPS'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Lat/Lon Toggle */}
          <button
            onClick={() => setShowCoordInput(!showCoordInput)}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition shadow-xs ${
              showCoordInput
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-transparent'
                : 'border-zinc-200 bg-white/90 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/90 dark:text-zinc-200'
            }`}
            title="Manual coordinates"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Global Location Search Bar */}
      <div className="relative" ref={searchBoxRef}>
        <div className="flex items-center rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 shadow-sm dark:border-white/10 dark:bg-zinc-900/80 backdrop-blur-xl focus-within:ring-2 focus-within:ring-zinc-400 dark:focus-within:ring-white/20 transition">
          <Search className="h-4 w-4 text-zinc-400 shrink-0 mr-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) setShowDropdown(true);
            }}
            placeholder={
              language === 'ta'
                ? 'உலகில் எந்த ஊர்/நகரத்தையும் தேடுங்கள் (எ.கா: மதுரை, சென்னை, கோயம்புத்தூர், டெல்லி)...'
                : 'Search any city, district, town, or village anywhere in the world (e.g. Coimbatore, Madurai, Delhi, London)...'
            }
            className="w-full bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden dark:text-white"
          />
          {isSearching && (
            <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {searchQuery && !isSearching && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
              }}
              className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Auto-suggest dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-2xl dark:border-white/15 dark:bg-zinc-900/95 backdrop-blur-2xl">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              {language === 'ta' ? 'பொருந்தும் இடங்கள்' : 'Matching Locations (Select to Load)'}
            </div>
            {searchResults.map((res) => (
              <button
                key={res.id}
                onClick={() => handleSelectLocation(res)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-zinc-800 hover:bg-zinc-100/80 dark:text-zinc-200 dark:hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white">{res.name}</span>
                    <span className="text-zinc-500 text-[11px] ml-1.5">
                      {res.admin1 ? `${res.admin1}, ` : ''}{res.country || ''}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Manual Coordinates Drawer (Optional) */}
      {showCoordInput && (
        <form
          onSubmit={handleApplyCustomCoords}
          className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-zinc-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center gap-3 text-xs"
        >
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Lat:</span>
            <input
              type="text"
              value={customLat}
              onChange={(e) => setCustomLat(e.target.value)}
              className="w-full sm:w-28 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-zinc-900 dark:border-white/15 dark:bg-zinc-800 dark:text-white"
              placeholder="11.0168"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Lon:</span>
            <input
              type="text"
              value={customLon}
              onChange={(e) => setCustomLon(e.target.value)}
              className="w-full sm:w-28 rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-zinc-900 dark:border-white/15 dark:bg-zinc-800 dark:text-white"
              placeholder="76.9558"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto rounded-xl bg-zinc-900 px-4 py-1.5 font-bold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 transition"
          >
            {language === 'ta' ? 'வானிலை பெற' : 'Apply Coordinates'}
          </button>
        </form>
      )}

      {/* Quick Agricultural Belt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-[11px] font-bold text-zinc-400 shrink-0 uppercase tracking-wider">
          {language === 'ta' ? 'விரைவு இடங்கள்:' : 'Quick Hubs:'}
        </span>
        {PRESET_LOCATIONS.map((p) => {
          const isActive = Math.abs(lat - p.lat) < 0.05 && Math.abs(lon - p.lon) < 0.05;
          return (
            <button
              key={p.name}
              onClick={() => {
                setLat(p.lat);
                setLon(p.lon);
                setLocationName(`${p.name} (${p.tag})`);
              }}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition shadow-xs ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950'
                  : 'border border-zinc-200 bg-white/80 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Error / Offline state */}
      {error && (
        <div className="rounded-2xl border border-amber-300/60 bg-amber-50/80 p-5 text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-200 flex items-start gap-3 backdrop-blur-md">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm">Live Weather Service Unavailable</h4>
            <p className="text-xs mt-1 leading-relaxed">{error}</p>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-2">
              Note: AgriGuard AI strictly avoids inventing fake weather data. Transparent service status is displayed until the external Open-Meteo connection responds.
            </p>
          </div>
        </div>
      )}

      {loading && !weather ? (
        <LoadingSkeleton count={3} height="h-36" />
      ) : weather ? (
        <>
          {/* Current Conditions Card */}
          <div className="rounded-3xl border border-zinc-200/90 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-5 sm:p-8 text-white shadow-2xl dark:border-white/15 dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    {locationName}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-baseline gap-4">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                    {current?.temperature_2m ?? '--'}°C
                  </span>
                  <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1 text-xs font-semibold text-zinc-200">
                    <CurrentWeatherIcon className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>{currentMeta.label}</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-300 capitalize">
                    {current?.relative_humidity_2m}% {language === 'ta' ? 'ஈரப்பதம்' : 'Humidity'}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                  <span>Source: {weather.source}</span>
                  {current?.time && (
                    <span>• {language === 'ta' ? 'கண்காணிப்பு' : 'Observation'}: {current.time.replace('T', ' ')}</span>
                  )}
                  {weather.fetched_at && (
                    <span>• {language === 'ta' ? 'பெறப்பட்டது' : 'Retrieved'}: {new Date(weather.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                </div>
              </div>

              {/* 3 Metric Pills */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 bg-white/10 dark:bg-white/5 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl border border-white/10 min-w-0">
                <div className="text-center min-w-0">
                  <Droplets className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-zinc-300 mb-1" />
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase block truncate">Humidity</span>
                  <span className="text-xs sm:text-base font-bold text-white truncate block">{current?.relative_humidity_2m ?? '--'}%</span>
                </div>
                <div className="text-center min-w-0">
                  <CloudRain className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-zinc-300 mb-1" />
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase block truncate">Rainfall</span>
                  <span className="text-xs sm:text-base font-bold text-white truncate block">{current?.precipitation ?? 0} mm</span>
                </div>
                <div className="text-center min-w-0">
                  <Wind className="h-4 w-4 sm:h-5 sm:w-5 mx-auto text-zinc-300 mb-1" />
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase block truncate">Wind</span>
                  <span className="text-xs sm:text-base font-bold text-white truncate block">{current?.wind_speed_10m ?? 0} km/h</span>
                </div>
              </div>
            </div>

            {/* Spray Window Advisory */}
            <div className="mt-6 border-t border-white/15 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold uppercase tracking-wider text-zinc-400 shrink-0">Spray Advisory:</span>
                {isHighRain ? (
                  <span className="text-rose-300 font-semibold">⚠️ Unfavorable (Rain predicted, chemical runoff risk)</span>
                ) : isHighWind ? (
                  <span className="text-amber-300 font-semibold">⚠️ Moderate Drift (High wind speed, drift hazard)</span>
                ) : (
                  <span className="text-zinc-200 font-semibold">✅ Favorable Spray Window (Low wind & clear canopy)</span>
                )}
              </div>
              <span className="text-zinc-400 text-[11px] shrink-0">Lat: {lat.toFixed(4)}, Lon: {lon.toFixed(4)}</span>
            </div>
          </div>

          {/* 7-Day Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
            {/* Temperature Trends */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-4 sm:p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 backdrop-blur-xl min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                {language === 'ta' ? '7 நாள் வெப்பநிலை போக்கு (°C)' : '7-Day Temperature Range (°C)'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Maximum daytime vs minimum night-time temperatures
              </p>
              <div className="chart-wrapper h-64 w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={forecastChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} opacity={0.7} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#71717a' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#71717a' }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                        borderColor: isDark ? '#27272a' : '#e4e4e7',
                        color: isDark ? '#f4f4f5' : '#09090b',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#d4d4d8' : '#3f3f46' }} />
                    <Line type="monotone" dataKey="MaxTemp" stroke={isDark ? '#e4e4e7' : '#18181b'} strokeWidth={2.5} name="Max Temp (°C)" />
                    <Line type="monotone" dataKey="MinTemp" stroke={isDark ? '#71717a' : '#94a3b8'} strokeWidth={2.5} name="Min Temp (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Precipitation Trends */}
            <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-4 sm:p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 backdrop-blur-xl min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                {language === 'ta' ? 'எதிர்பார்க்கப்படும் மழைப்பொழிவு (மி.மீ)' : 'Daily Precipitation Sum (mm)'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Quantitative precipitation forecast for irrigation regulation
              </p>
              <div className="chart-wrapper h-64 w-full min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastChartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} opacity={0.7} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#71717a' }} />
                    <YAxis tick={{ fontSize: 11, fill: isDark ? '#a1a1aa' : '#71717a' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: isDark ? '#18181b' : '#ffffff',
                        borderColor: isDark ? '#27272a' : '#e4e4e7',
                        color: isDark ? '#f4f4f5' : '#09090b',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: isDark ? '#d4d4d8' : '#3f3f46' }} />
                    <Bar dataKey="Rainfall" fill={isDark ? '#a1a1aa' : '#52525b'} radius={[6, 6, 0, 0]} name="Rainfall (mm)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 7-Day Agronomic Forecast Table */}
          <div className="rounded-3xl border border-zinc-200/80 bg-white/90 p-4 sm:p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 backdrop-blur-xl min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {language === 'ta' ? '7 நாள் விரிவான வானிலை & பாசன வழிகாட்டி' : '7-Day Agronomic Weather & Irrigation Forecast'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {language === 'ta' ? 'நேரடி Open-Meteo முன்னறிவிப்பு மற்றும் பயிர் பாதுகாப்பு பரிந்துரைகள்' : 'Live multi-day provider projections and daily field operation advisories'}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                {forecastChartData.length} {language === 'ta' ? 'நாட்கள்' : 'Days'}
              </span>
            </div>

            <div className="table-responsive-container">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-white/10 text-zinc-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">{language === 'ta' ? 'நாள் / தேதி' : 'Date'}</th>
                    <th className="py-2.5 px-3">{language === 'ta' ? 'வானிலை' : 'Condition'}</th>
                    <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'அதிகபட்சம்' : 'Max Temp'}</th>
                    <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'குறைந்தபட்சம்' : 'Min Temp'}</th>
                    <th className="py-2.5 px-3 text-right">{language === 'ta' ? 'மழை' : 'Rain'}</th>
                    <th className="py-2.5 px-3">{language === 'ta' ? 'பரிந்துரை' : 'Agronomic Advisory'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {forecastChartData.map((d, i) => {
                    const meta = getWeatherMeta(d.code, language);
                    const Icon = meta.icon;
                    const advisory = getDayAdvisory(d.Rainfall, d.MaxTemp, d.code, language);
                    const dateObj = new Date(d.fullDate);
                    const dayName = dateObj.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', { weekday: 'short' });
                    return (
                      <tr key={d.fullDate} className="hover:bg-zinc-50/70 dark:hover:bg-white/5 transition">
                        <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-white whitespace-nowrap">
                          {dayName}, {d.date}
                          {i === 0 && (
                            <span className="ml-1.5 text-[9px] font-bold uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-1.5 py-0.5 rounded-md">
                              {language === 'ta' ? 'இன்று' : 'Today'}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-200 font-medium">
                            <Icon className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-zinc-900 dark:text-white whitespace-nowrap">
                          {d.MaxTemp}°C
                        </td>
                        <td className="py-2.5 px-3 text-right text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {d.MinTemp}°C
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                          <span className={d.Rainfall > 5 ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-zinc-600 dark:text-zinc-300'}>
                            {d.Rainfall.toFixed(1)} mm
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300 text-[11px]">
                          {advisory}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
