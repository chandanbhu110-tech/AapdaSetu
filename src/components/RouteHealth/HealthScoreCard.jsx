import React from 'react';
import { Activity, ShieldAlert, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function HealthScoreCard({ healthDetails, routeName = 'Guwahati → Imphal' }) {
  const {
    score = 25,
    tier = 'Critical',
    hexColor = '#ef4444',
    breakdown = {}
  } = healthDetails || {};

  const getTierIcon = () => {
    switch (tier) {
      case 'Safe': return <CheckCircle size={18} color="#22c55e" />;
      case 'Moderate': return <AlertTriangle size={18} color="#eab308" />;
      case 'Risky': return <AlertTriangle size={18} color="#f97316" />;
      default: return <AlertOctagon size={18} color="#ef4444" />;
    }
  };

  const getBadgeClass = () => {
    switch (tier) {
      case 'Safe': return 'badge-safe';
      case 'Moderate': return 'badge-moderate';
      case 'Risky': return 'badge-risky';
      default: return 'badge-critical';
    }
  };

  return (
    <div className="card" style={{ borderLeft: `4px solid ${hexColor}` }}>
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h3 className="card-title">Route Health Score</h3>
            <span className={`badge ${getBadgeClass()}`}>
              {getTierIcon()}
              {tier.toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Transparent Rule-Based Metric • <strong>NOT Machine Learning</strong>
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{routeName}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '3rem', fontWeight: 800, color: hexColor, lineHeight: 1 }}>
              {score}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600 }}>/ 100</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            {score < 40 
              ? 'Critical impairment: Active infrastructure hazard & extreme weather.' 
              : score < 60 
              ? 'Moderate caution: Sub-optimal pavement & localized hazards.'
              : 'Safe for all standard logistics convoys.'}
          </p>
        </div>

        {/* Circular / Progress Indicator */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          border: `6px solid #e2e8f0`,
          borderTopColor: hexColor,
          borderRightColor: score > 50 ? hexColor : '#e2e8f0',
          borderBottomColor: score > 75 ? hexColor : '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Activity size={24} color={hexColor} />
        </div>
      </div>

      {/* Transparent Input Breakdown */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Rule-Based Factor Deductions:
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', fontSize: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Road Condition Base:</span>
            <strong style={{ color: 'var(--text-primary)' }}>+{breakdown.roadConditionContribution || 15} pts</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Weather Penalty:</span>
            <strong style={{ color: '#ea580c' }}>-{breakdown.weatherPenalty || 8} pts</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Incident Frequency:</span>
            <strong style={{ color: '#dc2626' }}>-{breakdown.incidentCountPenalty || 20} pts</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span>Incident Severity:</span>
            <strong style={{ color: '#dc2626' }}>-{breakdown.incidentSeverityPenalty || 32} pts</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
