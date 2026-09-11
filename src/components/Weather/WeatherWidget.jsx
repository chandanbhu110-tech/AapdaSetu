import React from 'react';
import { CloudRain, Wind, Droplets, Thermometer, Radio, RefreshCw } from 'lucide-react';

export default function WeatherWidget({ weatherData, onRefresh = null, isLoading = false }) {
  if (!weatherData) {
    return (
      <div className="card">
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Loading OpenWeather telemetry...</p>
      </div>
    );
  }

  const {
    city = 'Guwahati',
    temp_c = 28.4,
    feels_like_c = 32.1,
    humidity = 84,
    wind_speed_ms = 3.6,
    rainfall_mm = 12.4,
    condition = 'Rain / Mist',
    last_updated = new Date().toLocaleTimeString(),
    isLive = false,
    badgeText = 'DEMO DATA MODE'
  } = weatherData;

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CloudRain size={20} color="#38bdf8" />
          <h3 className="card-title">Weather Intelligence: {city}</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {isLive ? (
            <span className="badge badge-live-weather">
              <Radio size={11} className="vehicle-marker-pulse" />
              LIVE • OPENWEATHER
            </span>
          ) : (
            <span className="badge badge-demo-mode" title="No valid VITE_OPENWEATHER_API_KEY found or API limit reached">
              {badgeText}
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="btn btn-outline btn-sm"
              disabled={isLoading}
              title="Refresh weather data"
            >
              <RefreshCw size={12} className={isLoading ? 'vehicle-marker-pulse' : ''} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {temp_c}°C
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Feels like {feels_like_c}°C
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
            {condition}
          </p>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <p>Source: <strong style={{ color: 'var(--text-secondary)' }}>OpenWeather API</strong></p>
          <p style={{ marginTop: '2px' }}>Updated: {last_updated}</p>
        </div>
      </div>

      {/* Weather telemetry grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <CloudRain size={14} color="#0284c7" />
            <span>Rainfall</span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: rainfall_mm > 15 ? '#dc2626' : 'var(--text-primary)' }}>
            {rainfall_mm} mm
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Droplets size={14} color="#0284c7" />
            <span>Humidity</span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {humidity}%
          </span>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <Wind size={14} color="#0284c7" />
            <span>Wind Speed</span>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {wind_speed_ms} m/s
          </span>
        </div>
      </div>
    </div>
  );
}
