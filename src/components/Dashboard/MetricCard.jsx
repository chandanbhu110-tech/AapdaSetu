import React from 'react';

export default function MetricCard({ label, value, subtext, icon: Icon, badge, color = '#38bdf8' }) {
  return (
    <div className="metric-card">
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        <div className="metric-icon-wrap" style={{ color }}>
          {Icon && <Icon size={16} />}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div className="metric-value">{value}</div>
        {badge && <span className={`badge ${badge.type}`}>{badge.text}</span>}
      </div>
      {subtext && <div className="metric-subtext">{subtext}</div>}
    </div>
  );
}
