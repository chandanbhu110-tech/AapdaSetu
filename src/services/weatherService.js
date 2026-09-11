/**
 * SIH NER Smart Logistics Platform - OpenWeather Service
 * 
 * Fetches real weather observations from OpenWeather Current Weather API:
 * https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric
 * 
 * If API fails or key is missing, provides clearly labelled DEMO DATA MODE.
 */

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Monitored NER strategic logistics centers
export const MONITORED_CITIES = ['Guwahati', 'Shillong', 'Imphal', 'Silchar', 'Gangtok'];

// High-fidelity fallback meteorological data for NER hill corridors
const FALLBACK_WEATHER = {
  Guwahati: {
    city: 'Guwahati',
    temp_c: 28.4,
    feels_like_c: 32.1,
    humidity: 84,
    wind_speed_ms: 3.6,
    rainfall_mm: 12.4, // Moderate monsoon rain
    condition: 'Rain / Mist',
    icon: '10d',
    last_updated: new Date().toLocaleTimeString(),
    source: 'OpenWeather',
    isLive: false,
    badgeText: 'DEMO DATA MODE'
  },
  Shillong: {
    city: 'Shillong',
    temp_c: 19.2,
    feels_like_c: 19.5,
    humidity: 92,
    wind_speed_ms: 5.8,
    rainfall_mm: 26.8, // Heavy rain in Meghalaya hills
    condition: 'Heavy Rain / Cloud Cover',
    icon: '10d',
    last_updated: new Date().toLocaleTimeString(),
    source: 'OpenWeather',
    isLive: false,
    badgeText: 'DEMO DATA MODE'
  },
  Imphal: {
    city: 'Imphal',
    temp_c: 24.1,
    feels_like_c: 25.0,
    humidity: 88,
    wind_speed_ms: 4.2,
    rainfall_mm: 18.5, // Continuous rain affecting hill passes
    condition: 'Thunderstorm with Rain',
    icon: '11d',
    last_updated: new Date().toLocaleTimeString(),
    source: 'OpenWeather',
    isLive: false,
    badgeText: 'DEMO DATA MODE'
  },
  Silchar: {
    city: 'Silchar',
    temp_c: 27.6,
    feels_like_c: 31.2,
    humidity: 89,
    wind_speed_ms: 2.8,
    rainfall_mm: 15.0,
    condition: 'Light Rain',
    icon: '10d',
    last_updated: new Date().toLocaleTimeString(),
    source: 'OpenWeather',
    isLive: false,
    badgeText: 'DEMO DATA MODE'
  },
  Gangtok: {
    city: 'Gangtok',
    temp_c: 16.5,
    feels_like_c: 16.0,
    humidity: 95,
    wind_speed_ms: 4.5,
    rainfall_mm: 22.0, // Sikkim hill corridor rain
    condition: 'Fog / Steady Rain',
    icon: '50d',
    last_updated: new Date().toLocaleTimeString(),
    source: 'OpenWeather',
    isLive: false,
    badgeText: 'DEMO DATA MODE'
  }
};

/**
 * Fetch current weather for a city using OpenWeather API
 */
export async function fetchCityWeather(cityName) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;

  // If no API key configured, use clearly labeled Demo Data
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('YOUR_')) {
    const fallback = FALLBACK_WEATHER[cityName] || FALLBACK_WEATHER['Guwahati'];
    return {
      ...fallback,
      city: cityName,
      last_updated: new Date().toLocaleTimeString(),
      isLive: false,
      badgeText: 'DEMO DATA MODE'
    };
  }

  try {
    const url = `${OPENWEATHER_BASE_URL}?q=${encodeURIComponent(cityName)},IN&appid=${encodeURIComponent(apiKey)}&units=metric`;
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`OpenWeather API returned status ${response.status} for ${cityName}. Falling back to demo data.`);
      const fallback = FALLBACK_WEATHER[cityName] || FALLBACK_WEATHER['Guwahati'];
      return {
        ...fallback,
        city: cityName,
        last_updated: new Date().toLocaleTimeString(),
        isLive: false,
        badgeText: 'DEMO DATA MODE (API ' + response.status + ')'
      };
    }

    const data = await response.json();
    
    // Extract rainfall if reported in rain['1h'] or rain['3h']
    let rain_mm = 0;
    if (data.rain) {
      rain_mm = data.rain['1h'] || data.rain['3h'] || 0;
    }

    return {
      city: data.name || cityName,
      temp_c: Math.round(data.main.temp * 10) / 10,
      feels_like_c: Math.round(data.main.feels_like * 10) / 10,
      humidity: data.main.humidity,
      wind_speed_ms: data.wind.speed,
      rainfall_mm: rain_mm,
      condition: data.weather?.[0]?.description 
        ? data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)
        : 'Cloudy',
      icon: data.weather?.[0]?.icon || '02d',
      last_updated: new Date().toLocaleTimeString(),
      source: 'OpenWeather',
      isLive: true,
      badgeText: 'LIVE • OPENWEATHER'
    };
  } catch (error) {
    console.warn(`OpenWeather network error for ${cityName}:`, error);
    const fallback = FALLBACK_WEATHER[cityName] || FALLBACK_WEATHER['Guwahati'];
    return {
      ...fallback,
      city: cityName,
      last_updated: new Date().toLocaleTimeString(),
      isLive: false,
      badgeText: 'DEMO DATA MODE'
    };
  }
}

/**
 * Batch fetch weather for all core NER cities
 */
export async function fetchAllMonitoredWeather() {
  const promises = MONITORED_CITIES.map(city => fetchCityWeather(city));
  const results = await Promise.all(promises);
  const weatherMap = {};
  results.forEach(res => {
    weatherMap[res.city] = res;
  });
  return weatherMap;
}
