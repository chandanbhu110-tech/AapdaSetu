import React from 'react';
import { 
  Navigation, 
  ShieldAlert, 
  Truck, 
  FileSpreadsheet, 
  ArrowRight, 
  Map as MapIcon, 
  Clock, 
  MapPin, 
  Compass, 
  AlertTriangle,
  Radio,
  ExternalLink
} from 'lucide-react';
import NERMap from '../components/Map/NERMap';
import { DEMO_ROUTES } from '../data/demoRoutes';
import { DEMO_VEHICLES } from '../data/demoVehicles';

export default function Dashboard({
  routes = [],
  vehicles = [],
  incidents = [],
  fieldReports = [],
  alerts = [],
  weatherMap = {},
  predictions = {},
  onSelectRoute,
  onNavigate,
  onAcknowledgeAlert,
  onRefreshWeather,
  isWeatherLoading
}) {
  // Dynamic metrics calculation
  const totalRoutes = routes.length || 5;
  const criticalAlertsCount = alerts.filter(a => a?.severity === 'Critical' && !a?.is_acknowledged).length;
  const activeVehiclesCount = vehicles.filter(v => v?.status === 'On Route' || v?.status === 'Delayed').length;
  const fieldReportsCount = fieldReports.length || 0;

  // Primary demo spotlight route
  const defaultRoute = DEMO_ROUTES[0] || {
    id: 'R001',
    origin: 'Guwahati',
    destination: 'Imphal',
    distance_km: 360,
    baseline_health_score: 25,
    risk_level: 'Critical',
    road_condition: 'Severely Degraded'
  };
  const r001 = (routes && routes.length > 0)
    ? (routes.find(r => r && (r.id === 'R001' || r.route_id === 'R001')) || routes[0] || defaultRoute)
    : defaultRoute;

  const pred001 = predictions['R001'] || {
    disruption_probability_pct: 54.1,
    risk_level: 'High'
  };

  // Recent 3 alerts
  const recentAlerts = alerts.slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. TOP 4 CLEAN SUMMARY CARDS */}
      <div className="grid-summary-4">
        {/* Card 1: Monitored Routes */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-card-title">Monitored Routes</span>
            <div className="summary-card-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Navigation size={18} />
            </div>
          </div>
          <div className="summary-card-value">{totalRoutes}</div>
          <div className="summary-card-status">Strategic Northeast Corridors</div>
        </div>

        {/* Card 2: Critical Alerts */}
        <div className="summary-card" style={{ borderLeft: criticalAlertsCount > 0 ? '3px solid #dc2626' : undefined }}>
          <div className="summary-card-top">
            <span className="summary-card-title">Critical Alerts</span>
            <div className="summary-card-icon" style={{ background: '#fee2e2', color: '#dc2626' }}>
              <ShieldAlert size={18} />
            </div>
          </div>
          <div className="summary-card-value" style={{ color: criticalAlertsCount > 0 ? '#dc2626' : '#0f172a' }}>
            {criticalAlertsCount}
          </div>
          <div className="summary-card-status" style={{ color: criticalAlertsCount > 0 ? '#dc2626' : '#64748b' }}>
            {criticalAlertsCount > 0 ? 'Requires Immediate Rerouting' : 'All Clear / Stable'}
          </div>
        </div>

        {/* Card 3: Active Vehicles */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-card-title">Active Vehicles</span>
            <div className="summary-card-icon" style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
              <Truck size={18} />
            </div>
          </div>
          <div className="summary-card-value">{activeVehiclesCount}</div>
          <div className="summary-card-status">Medical &amp; Supply Convoys (GPS Simulated)</div>
        </div>

        {/* Card 4: Field Reports */}
        <div className="summary-card">
          <div className="summary-card-top">
            <span className="summary-card-title">Field Reports</span>
            <div className="summary-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div className="summary-card-value">{fieldReportsCount}</div>
          <div className="summary-card-status">Ground Hazards &amp; Incident Stream</div>
        </div>
      </div>

      {/* 2. MAIN TWO-COLUMN LAYOUT */}
      <div className="dashboard-main-grid">
        
        {/* LEFT COLUMN (65%): Live Regional Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1rem' }}>
            {/* Map Header with Single View Full Map Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapIcon size={18} color="#0284c7" />
                  Live Corridor Accessibility Map
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Real-time highway health, active hazards, and simulated convoy telemetry across Northeast India
                </span>
              </div>

              <button 
                className="btn btn-outline btn-sm"
                onClick={() => onNavigate('live-map')}
                id="btn-view-full-map"
              >
                <span>View Full Map</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Interactive Leaflet Map */}
            <NERMap
              routes={routes}
              incidents={incidents}
              vehicles={vehicles}
              fieldReports={fieldReports}
              selectedRouteId="R001"
              onSelectRoute={(id) => {
                if (onSelectRoute) onSelectRoute(id);
                onNavigate('route-intel');
              }}
              height="430px"
            />

            {/* Simple Route Risk Legend */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              padding: '0.6rem 0.85rem',
              background: '#f8fafc',
              borderRadius: '8px',
              marginTop: '0.75rem',
              border: '1px solid #e2e8f0'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                Route Health Legend:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#15803d', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
                  Safe (80–100)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b45309', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  Moderate (60–79)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#c2410c', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }} />
                  Risky (40–59)
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#b91c1c', fontWeight: 600 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }} />
                  Critical (0–39)
                </span>
              </div>
            </div>
          </div>

          {/* Primary Demonstration Spotlight (Guwahati -> Imphal V001) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #fecaca',
            borderLeft: '4px solid #dc2626',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-critical">DEMO SCENARIO</span>
                <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                  {r001?.origin || 'Guwahati'} → {r001?.destination || 'Imphal'} (NH27 / NH29 / NH2)
                </strong>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0 }}>
                Active Jiribam bridge bottleneck impacting emergency medicine convoy V001. Route Health: <strong>{r001?.dynamic_health_score || r001?.baseline_health_score || 25}/100</strong> • AI Disruption Risk: <strong>{pred001.disruption_probability_pct}%</strong>.
              </p>
            </div>

            <button
              onClick={() => {
                if (onSelectRoute) onSelectRoute('R001');
                onNavigate('route-intel');
              }}
              className="btn btn-primary btn-sm"
              id="btn-evaluate-safer-route"
            >
              <span>Evaluate Safe Alternate</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN (35%): Recent Alerts + Quick Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card 1: Recent Alerts */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                <ShieldAlert size={16} color="#dc2626" />
                Recent Alerts
              </h4>
              <button 
                onClick={() => onNavigate('alerts')}
                style={{ background: 'transparent', border: 'none', color: '#0284c7', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
              >
                View All →
              </button>
            </div>

            <div className="recent-alerts-list">
              {recentAlerts.length > 0 ? (
                recentAlerts.map(alert => (
                  <div 
                    key={alert.id || alert.alert_id} 
                    className={`recent-alert-item ${(alert.severity || '').toLowerCase()}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        {alert.title}
                      </span>
                      <span className={`badge ${
                        alert.severity === 'Critical' ? 'badge-critical' : alert.severity === 'High' ? 'badge-risky' : 'badge-moderate'
                      }`}>
                        {alert.severity}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} />
                        {alert.location}
                      </span>
                      <span>•</span>
                      <span>{alert.cause?.slice(0, 30) || 'Hazard reported'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  No active critical alerts.
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                Quick Actions
              </h4>
            </div>

            <div className="quick-actions-grid">
              <button 
                className="quick-action-btn"
                onClick={() => {
                  if (onSelectRoute) onSelectRoute('R001');
                  onNavigate('route-intel');
                }}
                id="btn-qa-plan-route"
              >
                <Compass size={20} color="#0284c7" />
                <span>Plan Route</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => onNavigate('vehicles')}
                id="btn-qa-track-vehicle"
              >
                <Truck size={20} color="#8b5cf6" />
                <span>Track Vehicle</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => onNavigate('field-reports')}
                id="btn-qa-report-incident"
              >
                <FileSpreadsheet size={20} color="#16a34a" />
                <span>Report Incident</span>
              </button>

              <button 
                className="quick-action-btn"
                onClick={() => onNavigate('alerts')}
                id="btn-qa-view-alerts"
              >
                <ShieldAlert size={20} color="#dc2626" />
                <span>View Alerts</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
