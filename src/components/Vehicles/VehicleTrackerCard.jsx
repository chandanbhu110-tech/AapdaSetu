import React from 'react';
import { Truck, Radio, Clock, Navigation, Thermometer, AlertTriangle } from 'lucide-react';

export default function VehicleTrackerCard({ vehicle }) {
  if (!vehicle) return null;

  const isCritical = vehicle.priority === 'Critical';

  return (
    <div className="card" style={{ borderTop: isCritical ? '3px solid #ef4444' : '3px solid #0284c7' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            background: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(2, 132, 199, 0.15)',
            color: isCritical ? '#ef4444' : '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Truck size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {vehicle.id} • {vehicle.vehicle_number}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              {vehicle.cargo}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className={`badge ${isCritical ? 'badge-critical' : 'badge-risky'}`}>
            {vehicle.priority}
          </span>
          <span className="badge badge-gps-simulated" title="Simulated GPS coordinate telemetry">
            <Radio size={10} className="vehicle-marker-pulse" />
            GPS: SIMULATED
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
          <span>{vehicle?.origin || 'Guwahati'}</span>
          <span style={{ color: '#0284c7', fontWeight: 600 }}>{vehicle.progress_percent}% En Route</span>
          <span>{vehicle?.destination || 'Imphal'}</span>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${vehicle.progress_percent}%`,
              height: '100%',
              background: isCritical ? 'linear-gradient(90deg, #dc2626, #ea580c)' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
              borderRadius: '4px',
              transition: 'width 1s ease-in-out'
            }}
          />
        </div>
      </div>

      {/* Vehicle Attributes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Current Position</span>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
            {vehicle.current_location}
          </p>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.65rem', borderRadius: '6px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Transit ETA</span>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
            ~{vehicle.eta_hours} hrs ({vehicle.speed_kmh} km/h)
          </p>
        </div>
      </div>

      {/* Cold chain status for medicine */}
      {vehicle.temp_sensitive && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          padding: '0.5rem 0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#047857'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Thermometer size={14} />
            <span>Cold-Chain Telemetry Active</span>
          </div>
          <strong>{vehicle.storage_temp_c}°C (Nominal)</strong>
        </div>
      )}
    </div>
  );
}
