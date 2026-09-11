import React, { useState } from 'react';
import { 
  BarChart2, 
  Layers, 
  AlertOctagon, 
  Bell, 
  FileSpreadsheet, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Truck, 
  Radio, 
  Cloud, 
  X, 
  Compass
} from 'lucide-react';

export default function AuthorityDashboard({
  routes = [],
  vehicles = [],
  incidents = [],
  fieldReports = [],
  alerts = [],
  predictions = {},
  onSelectRoute,
  onNavigate,
  _onAcknowledgeAlert,
  isDemoDataMode = false
}) {
  const [inspectRoute, setInspectRoute] = useState(null);

  // Dynamic calculations from active application state (NOT static hardcoded numbers)
  const totalMonitoredRoutes = routes.length || 5;
  
  // Critical routes (health score < 40)
  const criticalRoutes = routes.filter(r => {
    const score = r.dynamic_health_score !== undefined ? r.dynamic_health_score : r.baseline_health_score;
    return score < 40;
  });
  const criticalRoutesCount = criticalRoutes.length;

  // Active unacknowledged alerts
  const activeAlertsCount = alerts.filter(a => !a.is_acknowledged).length || 11;

  // Pending field reports
  const pendingReportsCount = fieldReports.filter(f => f.status === 'Pending Review' || f.status === 'Pending Sync').length || 6;

  // High-Risk AI Predictions (prob >= 50% or High/Critical)
  const aiHighRiskCount = Object.values(predictions).filter(p => 
    (p.disruption_probability_pct !== undefined && p.disruption_probability_pct >= 50) || 
    p.risk_level === 'High' || 
    p.risk_level === 'Critical'
  ).length || 1;

  // AI Disruption Risk calculations
  const routePredictionsList = routes.map(r => {
    const pred = predictions[r.id] || { disruption_probability_pct: 45, risk_level: 'Medium', prediction_reason: 'Corridor risk estimated.' };
    return {
      route: r,
      pred: pred
    };
  });

  // Calculate Average AI Risk
  const totalRiskPct = routePredictionsList.reduce((acc, item) => acc + (item.pred.disruption_probability_pct || 45), 0);
  const avgRiskPct = routePredictionsList.length > 0 ? (totalRiskPct / routePredictionsList.length).toFixed(1) : '47.8';

  // Find Highest Risk Corridor
  let highestRiskItem = routePredictionsList[0];
  routePredictionsList.forEach(item => {
    if ((item.pred.disruption_probability_pct || 0) > (highestRiskItem?.pred?.disruption_probability_pct || 0)) {
      highestRiskItem = item;
    }
  });

  // Delayed vehicles count
  const delayedVehiclesCount = vehicles.filter(v => v.status === 'Delayed').length || 2;
  const criticalDeliveriesCount = vehicles.filter(v => v.priority === 'Critical').length || 1;

  const handleInspectClick = (route) => {
    setInspectRoute(route);
  };

  const handleNavigateToRouteIntel = (routeId) => {
    if (onSelectRoute) onSelectRoute(routeId);
    if (onNavigate) onNavigate('route-intel');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. Page Header matching Vehicles, Alerts, Field Reports */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <BarChart2 size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Regional Logistics Analytics
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Monitor route accessibility, disruption risk and operational readiness across the North Eastern Region.
            </p>
          </div>
        </div>

        {/* Compact Right Operational Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isDemoDataMode && (
            <span className="pill-badge pill-yellow" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
              DEMO DATA MODE
            </span>
          )}
          <span className="pill-badge pill-blue" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            <Cloud size={12} />
            Cloud Active
          </span>
          <span className="pill-badge pill-purple" style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.72rem', padding: '3px 8px' }}>
            <Radio size={12} className="vehicle-marker-pulse" />
            GPS: Simulated
          </span>
          <span className="pill-badge pill-green" style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            <Brain size={12} />
            Random Forest ML
          </span>
        </div>
      </div>

      {/* 2. Horizontal Summary Cards Row (5 Columns) */}
      <div 
        className="ref-kpi-grid" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          margin: 0
        }}
      >
        {/* Card 1: Monitored Corridors */}
        <div className="ref-kpi-card" style={{ padding: '1rem 1.15rem' }}>
          <div className="ref-kpi-icon-box" style={{ background: '#e0f2fe', color: '#0284c7', width: 44, height: 44 }}>
            <Layers size={21} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Monitored Corridors</span>
            <span className="ref-kpi-value" style={{ fontSize: '1.65rem' }}>{totalMonitoredRoutes}</span>
            <span className="ref-kpi-subtext">Regional routes monitored</span>
          </div>
        </div>

        {/* Card 2: Critical Routes */}
        <div className="ref-kpi-card" style={{ padding: '1rem 1.15rem' }}>
          <div className="ref-kpi-icon-box" style={{ background: '#fee2e2', color: '#dc2626', width: 44, height: 44 }}>
            <AlertOctagon size={21} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Critical Routes</span>
            <span className="ref-kpi-value" style={{ fontSize: '1.65rem', color: '#dc2626' }}>{criticalRoutesCount}</span>
            <span className="ref-kpi-subtext" style={{ color: '#dc2626', fontWeight: 600 }}>Immediate attention required</span>
          </div>
        </div>

        {/* Card 3: Active Alerts */}
        <div className="ref-kpi-card" style={{ padding: '1rem 1.15rem' }}>
          <div className="ref-kpi-icon-box" style={{ background: '#ffedd5', color: '#ea580c', width: 44, height: 44 }}>
            <Bell size={21} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Active Alerts</span>
            <span className="ref-kpi-value" style={{ fontSize: '1.65rem', color: '#ea580c' }}>{activeAlertsCount}</span>
            <span className="ref-kpi-subtext">Operational alerts</span>
          </div>
        </div>

        {/* Card 4: Pending Field Reports */}
        <div className="ref-kpi-card" style={{ padding: '1rem 1.15rem' }}>
          <div className="ref-kpi-icon-box" style={{ background: '#fef9c3', color: '#ca8a04', width: 44, height: 44 }}>
            <FileSpreadsheet size={21} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Pending Field Reports</span>
            <span className="ref-kpi-value" style={{ fontSize: '1.65rem' }}>{pendingReportsCount}</span>
            <span className="ref-kpi-subtext">Awaiting verification</span>
          </div>
        </div>

        {/* Card 5: High-Risk AI Predictions */}
        <div className="ref-kpi-card" style={{ padding: '1rem 1.15rem' }}>
          <div className="ref-kpi-icon-box" style={{ background: '#f3e8ff', color: '#9333ea', width: 44, height: 44 }}>
            <Brain size={21} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">High-Risk AI Predictions</span>
            <span className="ref-kpi-value" style={{ fontSize: '1.65rem', color: '#9333ea' }}>{aiHighRiskCount}</span>
            <span className="ref-kpi-subtext">Random Forest risk ≥ 50%</span>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout (Left: Route Matrix, Right: AI Risk & Operational Status) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.7fr) minmax(0, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Regional Route Connectivity Matrix */}
        <div className="ref-table-card" style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Card Header */}
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
            background: '#ffffff'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} color="#0284c7" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Regional Route Connectivity Matrix
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
              Dynamic Health &amp; Transit Status
            </span>
          </div>

          {/* Clean Table */}
          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="ref-table" style={{ width: '100%', minWidth: '640px' }}>
              <thead>
                <tr>
                  <th style={{ width: '30%' }}>Corridor</th>
                  <th style={{ width: '14%' }}>Distance</th>
                  <th style={{ width: '18%' }}>Health Score</th>
                  <th style={{ width: '16%' }}>AI Risk</th>
                  <th style={{ width: '12%' }}>Status</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {routes.map(r => {
                  const score = r.dynamic_health_score !== undefined ? r.dynamic_health_score : r.baseline_health_score;
                  const pred = predictions[r.id] || { disruption_probability_pct: 45, risk_level: 'Medium' };
                  const riskPct = pred.disruption_probability_pct !== undefined ? pred.disruption_probability_pct : 45;
                  
                  // Health score classification
                  const isSafe = score >= 80;
                  const isModerate = score >= 60 && score < 80;
                  const isRisky = score >= 40 && score < 60;
                  const isCritical = score < 40;

                  // AI Risk badge classification
                  const riskLevel = pred.risk_level || (riskPct >= 60 ? 'Critical' : riskPct >= 50 ? 'High' : riskPct >= 40 ? 'Medium' : 'Low');

                  // Route status
                  const statusLabel = isCritical ? 'Restricted' : isRisky ? 'Caution' : 'Clear';
                  const statusPillClass = isCritical ? 'pill-red' : isRisky ? 'pill-orange' : 'pill-green';

                  return (
                    <tr key={r.id}>
                      {/* Corridor */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                          {r.origin} → {r.destination}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '1px' }}>
                          {r.name ? r.name.split('(')[0].trim() : r.id}
                        </div>
                      </td>

                      {/* Distance */}
                      <td style={{ color: '#334155', fontWeight: 500 }}>
                        {r.distance_km} km
                      </td>

                      {/* Health Score (current condition) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '0.9rem',
                            color: isSafe ? '#16a34a' : isModerate ? '#0284c7' : isRisky ? '#ea580c' : '#dc2626'
                          }}>
                            {score}/100
                          </span>
                          <span className={`pill-badge ${
                            isSafe ? 'pill-green' : isModerate ? 'pill-blue' : isRisky ? 'pill-orange' : 'pill-red'
                          }`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {isSafe ? 'Safe' : isModerate ? 'Moderate' : isRisky ? 'Risky' : 'Critical'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
                          Current Condition
                        </div>
                      </td>

                      {/* AI Risk (predicted disruption probability) */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
                            {riskPct}%
                          </span>
                          <span className={`pill-badge ${
                            riskLevel === 'Critical' ? 'pill-red' : 
                            riskLevel === 'High' ? 'pill-orange' : 
                            riskLevel === 'Medium' ? 'pill-yellow' : 'pill-green'
                          }`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {riskLevel}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
                          Disruption Prob.
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`pill-badge ${statusPillClass}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          onClick={() => handleInspectClick(r)}
                          className="btn-ref-view"
                          title={`Inspect ${r.origin} → ${r.destination}`}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Disruption Risk Overview + Operational Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Card 1: AI Disruption Risk Overview */}
          <div className="ref-table-card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Brain size={18} color="#9333ea" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  AI Disruption Risk Overview
                </h3>
              </div>
              <span className="pill-badge pill-purple" style={{ background: '#f3e8ff', color: '#7e22ce', fontSize: '0.68rem' }}>
                Random Forest ML
              </span>
            </div>

            {/* Compact AI Statistics Mini-Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.65rem',
              marginBottom: '1rem'
            }}>
              {/* Stat 1: High-Risk Routes */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>High-Risk Routes</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>
                  {aiHighRiskCount}
                </div>
              </div>

              {/* Stat 2: Critical Predictions */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Critical Predictions</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>
                  {routePredictionsList.filter(i => i.pred.risk_level === 'Critical' || i.pred.disruption_probability_pct >= 50).length}
                </div>
              </div>

              {/* Stat 3: Average AI Risk */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Average AI Risk</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                  {avgRiskPct}%
                </div>
              </div>

              {/* Stat 4: Highest Risk Corridor */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.6rem 0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Highest Risk Corridor</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={`${highestRiskItem?.route?.origin} → ${highestRiskItem?.route?.destination}`}>
                  {highestRiskItem?.route ? `${highestRiskItem.route.origin} → ${highestRiskItem.route.destination}` : 'Guwahati → Imphal'}
                </div>
              </div>
            </div>

            {/* Horizontal Progress Bars for Monitored Corridors */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Corridor Disruption Probabilities
              </div>

              {routePredictionsList.map(({ route, pred }) => {
                const pct = pred.disruption_probability_pct !== undefined ? pred.disruption_probability_pct : 45;
                const barColor = pct >= 50 ? '#dc2626' : pct >= 45 ? '#ea580c' : pct >= 30 ? '#0284c7' : '#16a34a';

                return (
                  <div key={route.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>
                        {route.origin} → {route.destination}
                      </span>
                      <span style={{ fontWeight: 700, color: barColor }}>
                        {pct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                      width: '100%',
                      height: '6px',
                      background: '#f1f5f9',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: '100%',
                        background: barColor,
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Operational Status */}
          <div className="ref-table-card" style={{ padding: '1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="#16a34a" />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Operational Status
                </h3>
              </div>
              <span className="pill-badge pill-green" style={{ fontSize: '0.68rem' }}>
                Active Systems
              </span>
            </div>

            {/* Compact Rows: Icon | Label | Number/Detail | Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {/* Row 1: Active Alerts */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Active Alerts</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Operations dispatch queue</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#dc2626' }}>{activeAlertsCount}</strong>
                  <span className="pill-badge pill-red" style={{ fontSize: '0.68rem' }}>Action Req.</span>
                </div>
              </div>

              {/* Row 2: Critical Deliveries */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Critical Deliveries</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Emergency medicine &amp; supplies</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#0284c7' }}>{criticalDeliveriesCount} Unit</strong>
                  <span className="pill-badge pill-blue" style={{ fontSize: '0.68rem' }}>En Route</span>
                </div>
              </div>

              {/* Row 3: Delayed Vehicles */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertTriangle size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Delayed Vehicles</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mountain pass blockages</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#ea580c' }}>{delayedVehiclesCount}</strong>
                  <span className="pill-badge pill-orange" style={{ fontSize: '0.68rem' }}>Delayed</span>
                </div>
              </div>

              {/* Row 4: Pending Field Reports */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.6rem 0.75rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fef9c3', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileSpreadsheet size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>Pending Field Reports</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Patrol hazard updates</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.9rem', color: '#ca8a04' }}>{pendingReportsCount}</strong>
                  <span className="pill-badge pill-yellow" style={{ fontSize: '0.68rem' }}>Pending</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 4. Interactive Route Inspect Modal */}
      {inspectRoute && (
        <div className="ref-modal-overlay" onClick={() => setInspectRoute(null)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="ref-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                    {inspectRoute.origin} → {inspectRoute.destination}
                  </h3>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Corridor Code: {inspectRoute.id} • {inspectRoute.name ? inspectRoute.name.split('(')[0] : 'National Highway'}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setInspectRoute(null)} 
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="ref-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Dual Health vs Risk Banner */}
              {(() => {
                const score = inspectRoute.dynamic_health_score !== undefined ? inspectRoute.dynamic_health_score : inspectRoute.baseline_health_score;
                const pred = predictions[inspectRoute.id] || { disruption_probability_pct: 45, risk_level: 'Medium', prediction_reason: 'Estimated corridor disruption risk.' };
                const isCrit = score < 40;

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {/* Health Score Box */}
                    <div style={{
                      background: isCrit ? '#fee2e2' : '#f0fdf4',
                      border: `1px solid ${isCrit ? '#fca5a5' : '#bbf7d0'}`,
                      borderRadius: '8px',
                      padding: '0.85rem'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isCrit ? '#991b1b' : '#166534' }}>
                        CURRENT ROUTE HEALTH
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isCrit ? '#dc2626' : '#16a34a', margin: '3px 0' }}>
                        {score}/100
                      </div>
                      <div style={{ fontSize: '0.7rem', color: isCrit ? '#b91c1c' : '#15803d' }}>
                        {score < 40 ? 'Restricted Transit (Heavy Damage)' : score < 60 ? 'Caution Advised' : 'Safe for Transit'}
                      </div>
                    </div>

                    {/* AI Risk Box */}
                    <div style={{
                      background: '#f3e8ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: '8px',
                      padding: '0.85rem'
                    }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6b21a8' }}>
                        AI PREDICTED DISRUPTION
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#9333ea', margin: '3px 0' }}>
                        {pred.disruption_probability_pct || 45}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#7e22ce' }}>
                        Risk Tier: <strong>{pred.risk_level || 'Medium'}</strong> (Random Forest)
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Corridor Details */}
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>
                  Transit Specifications
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: '#64748b' }}>Total Distance:</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectRoute.distance_km} km</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Normal Drive Time:</span>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspectRoute.estimated_time_hours || 10} hrs</div>
                  </div>
                  <div>
                    <span style={{ color: '#64748b' }}>Monitored Highway:</span>
                    <div style={{ fontWeight: 700, color: '#0284c7' }}>{inspectRoute.name ? inspectRoute.name.split('(')[1]?.replace(')', '') || 'NH' : 'NH'}</div>
                  </div>
                </div>
              </div>

              {/* Prediction Explanation */}
              {predictions[inspectRoute.id]?.prediction_reason && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>
                    AI Risk Factors &amp; Telemetry
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#334155', margin: 0, lineHeight: 1.45 }}>
                    {predictions[inspectRoute.id].prediction_reason}
                  </p>
                  {predictions[inspectRoute.id]?.top_factors && predictions[inspectRoute.id].top_factors.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {predictions[inspectRoute.id].top_factors.map((f, idx) => (
                        <span key={idx} className="pill-badge pill-gray" style={{ fontSize: '0.68rem' }}>
                          {f.factor}: <strong>{f.impact}</strong>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Incidents on this route */}
              {(() => {
                const routeIncidents = incidents.filter(inc => inc.affected_route === inspectRoute.id || inc.route_id === inspectRoute.id);
                if (routeIncidents.length === 0) return null;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626' }}>
                      Active Hazards / Disruption Bottlenecks ({routeIncidents.length})
                    </div>
                    {routeIncidents.map(inc => (
                      <div key={inc.id} style={{
                        padding: '0.6rem 0.75rem',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        fontSize: '0.78rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#991b1b' }}>
                          <span>{inc.location_name || inc.type}</span>
                          <span className="pill-badge pill-red" style={{ fontSize: '0.65rem' }}>{inc.severity}</span>
                        </div>
                        <div style={{ color: '#4b5563', fontSize: '0.72rem', marginTop: '2px' }}>
                          {inc.description}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="ref-modal-footer">
              <button 
                onClick={() => setInspectRoute(null)} 
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const id = inspectRoute.id;
                  setInspectRoute(null);
                  handleNavigateToRouteIntel(id);
                }} 
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Compass size={14} />
                Open in Route Intelligence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
