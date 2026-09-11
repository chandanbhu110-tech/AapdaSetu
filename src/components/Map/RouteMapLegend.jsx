import React from 'react';

export default function RouteMapLegend() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--border-subtle)',
      borderRadius: '8px',
      padding: '0.65rem 0.85rem',
      fontSize: '0.75rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
    }}>
      <span style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
        Route Health Tiers:
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ width: 12, height: 4, background: '#16a34a', borderRadius: 2 }}></span>
        <span style={{ color: '#16a34a', fontWeight: 600 }}>80–100 Safe</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ width: 12, height: 4, background: '#ca8a04', borderRadius: 2 }}></span>
        <span style={{ color: '#ca8a04', fontWeight: 600 }}>60–79 Moderate</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ width: 12, height: 4, background: '#ea580c', borderRadius: 2 }}></span>
        <span style={{ color: '#ea580c', fontWeight: 600 }}>40–59 Risky</span>
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
        <span style={{ width: 12, height: 4, background: '#dc2626', borderRadius: 2 }}></span>
        <span style={{ color: '#dc2626', fontWeight: 600 }}>0–39 Critical</span>
      </span>

      <div style={{ width: 1, height: 14, background: 'var(--border-subtle)', margin: '0 0.2rem' }}></div>

      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#0284c7' }}></span>
        Hubs
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#dc2626' }}></span>
        Demo Incidents
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)' }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#9333ea' }}></span>
        Vehicles (Simulated GPS)
      </span>
    </div>
  );
}
