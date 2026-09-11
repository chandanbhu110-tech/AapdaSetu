import React from 'react';
import { AlertOctagon, AlertTriangle, Check, ShieldAlert, Clock } from 'lucide-react';

export default function AlertBanner({ alerts = [], onAcknowledge = null }) {
  const activeAlerts = alerts.filter(a => !a.is_acknowledged);

  if (activeAlerts.length === 0) {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        marginBottom: '1.25rem',
        color: '#34d399',
        fontSize: '0.85rem'
      }}>
        <Check size={18} />
        <span>All operational freight routes nominal. No unacknowledged critical delivery alerts.</span>
      </div>
    );
  }

  // Spotlight on Critical Medicine Delivery at Risk
  const criticalMedAlert = activeAlerts.find(a => a.type === 'Critical Medicine Delivery at Risk');
  const otherAlerts = activeAlerts.filter(a => a.type !== 'Critical Medicine Delivery at Risk');

  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {criticalMedAlert && (
        <div style={{
          background: 'rgba(220, 38, 38, 0.05)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          borderLeft: '4px solid #dc2626',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
            <div style={{
              background: '#dc2626',
              color: 'white',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px'
            }}>
              <AlertOctagon size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-critical">CRITICAL DISPATCH ALERT</span>
                <h4 style={{ color: '#b91c1c', fontSize: '1rem', margin: 0, fontWeight: 700 }}>
                  {criticalMedAlert.title}
                </h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {criticalMedAlert.description}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px', fontWeight: 600 }}>
                ACTION: {criticalMedAlert.action_required}
              </p>
            </div>
          </div>

          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(criticalMedAlert.alert_id)}
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#dc2626', color: '#dc2626' }}
            >
              <Check size={14} /> Acknowledge Alert
            </button>
          )}
        </div>
      )}

      {/* Secondary Active Alerts */}
      {otherAlerts.slice(0, 2).map(alert => (
        <div key={alert.alert_id} style={{
          background: '#ffffff',
          border: `1px solid var(--border-subtle)`,
          borderLeft: `4px solid ${alert.severity === 'High' ? '#ea580c' : '#ca8a04'}`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={18} color={alert.severity === 'High' ? '#ea580c' : '#ca8a04'} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className={`badge ${alert.severity === 'High' ? 'badge-risky' : 'badge-moderate'}`}>
                  {alert.severity}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                  {alert.title}
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {alert.description}
              </p>
            </div>
          </div>

          {onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert.alert_id)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.7rem' }}
            >
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
