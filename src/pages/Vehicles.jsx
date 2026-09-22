import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Search, 
  Plus, 
  MapPin, 
  MoreVertical, 
  X, 
  Navigation, 
  Thermometer 
} from 'lucide-react';
import { formatRelativeTime, formatExactDateTime } from '../utils/timeFormat';
import { vehicleTracker } from '../services/vehicleService';

export default function Vehicles({ vehicles = [], routes = [], alerts = [], incidents = [], onNavigate = null, onAddVehicle = null }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Helper to cross-reference vehicle route against active alerts & ground hazards
  const getVehicleRouteRisk = (v) => {
    if (!v) return { hasRisk: false, severity: 'Normal', alerts: [], incidents: [] };
    const matchingRoute = routes.find(r => 
      (v.route_id && (r.id === v.route_id || r.route_id === v.route_id)) ||
      (r.origin === v.origin && r.destination === v.destination) ||
      (v.origin && v.destination && r.name && r.name.includes(v.origin) && r.name.includes(v.destination))
    );
    const routeId = matchingRoute?.id || v.route_id || (v.origin === 'Guwahati' && v.destination === 'Imphal' ? 'R001' : null);

    const routeAlerts = alerts.filter(a => 
      !a.is_acknowledged && 
      ((a.route_id && a.route_id === routeId) || (a.vehicle_id && a.vehicle_id === v.id))
    );

    const routeIncidents = incidents.filter(i => 
      i.affected_route && i.affected_route === routeId && (i.severity === 'Critical' || i.severity === 'High')
    );

    const hasCritical = routeAlerts.some(a => a.severity === 'Critical') || routeIncidents.some(i => i.severity === 'Critical');
    const hasHigh = routeAlerts.some(a => a.severity === 'High') || routeIncidents.some(i => i.severity === 'High');

    return {
      routeId,
      matchingRoute,
      hasRisk: hasCritical || hasHigh,
      severity: hasCritical ? 'Critical' : hasHigh ? 'High' : 'Normal',
      alerts: routeAlerts,
      incidents: routeIncidents
    };
  };

  // Live timer ticker to keep relative timestamps current
  const [, setTicker] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => t + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const allVehiclesList = vehicles;

  // Form state for adding vehicle
  const [newVehicle, setNewVehicle] = useState({
    id: 'V007',
    vehicle_number: 'AS-01-BX-4821',
    cargo: 'Medical Supplies',
    priority: 'Critical',
    origin: 'Guwahati',
    destination: 'Imphal',
    current_location: 'Guwahati Logistics Hub',
    current_lat: 26.1445,
    current_lng: 91.7362,
    status: 'On Route',
    speed_kmh: 48,
    eta_hours: 12.5,
    driver_name: 'Rajesh Sharma',
    contact: '+91 98640 12345',
    temp_sensitive: true,
    storage_temp_c: 4.2
  });

  // Calculate dynamic counts directly from fleet data
  const totalCount = allVehiclesList.length;
  const onRouteCount = allVehiclesList.filter(v => v.status === 'On Route' || v.status === 'Moving').length;
  const delayedCount = allVehiclesList.filter(v => v.status === 'Delayed').length;
  const completedCount = allVehiclesList.filter(v => v.status === 'Completed').length;

  // Filter logic
  const filteredVehicles = allVehiclesList.filter(v => {
    // Tab filter
    if (activeTab === 'EN_ROUTE' && v.status !== 'On Route' && v.status !== 'Moving') return false;
    if (activeTab === 'DELAYED' && v.status !== 'Delayed') return false;
    if (activeTab === 'COMPLETED' && v.status !== 'Completed') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (v.id || '').toLowerCase().includes(q);
      const matchPlate = (v.vehicle_number || '').toLowerCase().includes(q);
      const matchCargo = (v.cargo || '').toLowerCase().includes(q);
      const matchLoc = (v.current_location || '').toLowerCase().includes(q);
      const matchRoute = `${v.origin || ''} ${v.destination || ''}`.toLowerCase().includes(q);
      return matchId || matchPlate || matchCargo || matchLoc || matchRoute;
    }

    return true;
  });

  const handleOpenAddModal = () => {
    setNewVehicle(prev => ({
      ...prev,
      id: `V00${allVehiclesList.length + 1}`,
      vehicle_number: `AS-01-BX-${Math.floor(1000 + Math.random() * 9000)}`
    }));
    setIsAddModalOpen(true);
  };

  const handleAddVehicleSubmit = (e) => {
    e.preventDefault();
    const created = {
      ...newVehicle,
      id: newVehicle.id || `V00${allVehiclesList.length + 1}`,
      progress_percent: 5,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    if (onAddVehicle) {
      onAddVehicle(created);
    } else {
      vehicleTracker.addVehicle(created);
    }
    setIsAddModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header matching Reference */}
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
          <Truck size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Critical Fleet &amp; Logistics Tracking
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            Real-time monitoring of essential supply vehicles across the North Eastern Region.
          </p>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="ref-kpi-grid">
        {/* Card 1: Total Fleet */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <Truck size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Total Fleet Units</span>
            <span className="ref-kpi-value">{totalCount}</span>
            <span className="ref-kpi-subtext">Registered vehicles</span>
          </div>
        </div>

        {/* Card 2: Active Vehicles */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Active Vehicles</span>
            <span className="ref-kpi-value">{onRouteCount}</span>
            <span className="ref-kpi-subtext">
              On route ({totalCount > 0 ? Math.round((onRouteCount / totalCount) * 100) : 0}%)
            </span>
          </div>
        </div>

        {/* Card 3: Delayed Vehicles */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Delayed Vehicles</span>
            <span className="ref-kpi-value">{delayedCount}</span>
            <span className="ref-kpi-subtext">Require attention</span>
          </div>
        </div>

        {/* Card 4: Completed Trips */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#f1f5f9', color: '#1e293b' }}>
            <Package size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Completed Trips</span>
            <span className="ref-kpi-value">{completedCount}</span>
            <span className="ref-kpi-subtext">Today</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar: Filter Tabs + Search + Add Button */}
      <div className="ref-toolbar">
        {/* Tabs */}
        <div className="ref-tabs-group">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`ref-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          >
            All Vehicles ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('EN_ROUTE')}
            className={`ref-tab-btn ${activeTab === 'EN_ROUTE' ? 'active' : ''}`}
          >
            En Route ({onRouteCount})
          </button>
          <button
            onClick={() => setActiveTab('DELAYED')}
            className={`ref-tab-btn ${activeTab === 'DELAYED' ? 'active' : ''}`}
          >
            Delayed ({delayedCount})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`ref-tab-btn ${activeTab === 'COMPLETED' ? 'active' : ''}`}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Search & Actions */}
        <div className="ref-actions-group">
          <div className="ref-search-input-wrap">
            <Search size={15} className="ref-search-icon" />
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ref-search-input"
            />
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
          >
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Table Card matching reference */}
      <div className="ref-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>Vehicle ID</th>
                <th>Status</th>
                <th>Current Route</th>
                <th>Current Location</th>
                <th>Speed</th>
                <th>Cargo Type</th>
                <th>Priority</th>
                <th>Last Update</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map((v, idx) => {
                const isDelayed = v.status === 'Delayed';
                const isCompleted = v.status === 'Completed';
                const isCritical = v.priority === 'Critical' || v.priority === 'Highest' || v.priority === '1 Highest';
                const isMedicine = (v.cargo || '').toLowerCase().includes('med') || (v.cargo || '').toLowerCase().includes('blood') || (v.cargo || '').toLowerCase().includes('vaccine');
                const isFood = (v.cargo || '').toLowerCase().includes('food') || (v.cargo || '').toLowerCase().includes('water');
                
                // Sample sub-ID or plate
                const subId = v.vehicle_number || `TR-00${(idx % 9) + 1}`;
                const coordsText = v.current_lat && v.current_lng ? `${Number(v.current_lat).toFixed(4)}, ${Number(v.current_lng).toFixed(4)}` : '26.3520, 92.7006';
                const speedText = v.speed_kmh !== undefined ? `${v.speed_kmh} km/h` : '45 km/h';
                const speedLabel = isDelayed ? 'Slow' : isCompleted ? 'Halted' : 'Normal';
                
                const timestamp = v.updated_at || v.created_at || v.last_ping;
                const relativeTime = formatRelativeTime(timestamp);
                const exactTime = formatExactDateTime(timestamp);

                return (
                  <tr key={v.id || idx}>
                    {/* Vehicle ID */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: isDelayed ? '#ffedd5' : isCompleted ? '#e0f2fe' : '#dcfce7',
                          color: isDelayed ? '#c2410c' : isCompleted ? '#0284c7' : '#15803d',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Truck size={15} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.id}</div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{subId}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td>
                      <span className={`pill-badge ${isDelayed ? 'pill-orange' : isCompleted ? 'pill-blue' : 'pill-green'}`}>
                        {v.status || (isDelayed ? 'Delayed' : 'Moving')}
                      </span>
                    </td>

                    {/* Current Route with Risk Warning Indicator */}
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {v.origin || 'Guwahati'} → {v.destination || 'Imphal'}
                        </span>
                        {(() => {
                          const rk = getVehicleRouteRisk(v);
                          if (!rk.hasRisk) return null;
                          return (
                            <div style={{ marginTop: '3px' }}>
                              <span 
                                className={`pill-badge ${rk.severity === 'Critical' ? 'pill-red' : 'pill-orange'}`}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.67rem', padding: '1px 6px' }}
                                title={`${rk.alerts.length} active alert(s) on corridor`}
                              >
                                <AlertTriangle size={10} />
                                <span>Route at {rk.severity} Risk</span>
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </td>

                    {/* Current Location */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                        <MapPin size={13} color="#0284c7" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {v.current_location || 'Nagaon, Assam'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                            {coordsText}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Speed */}
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{speedText}</span>
                        <div style={{ fontSize: '0.7rem', color: isDelayed ? '#ea580c' : '#16a34a', fontWeight: 500 }}>
                          {speedLabel}
                        </div>
                      </div>
                    </td>

                    {/* Cargo Type */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {v.cargo}
                        </span>
                        <span className={`pill-badge ${isMedicine ? 'pill-red' : isFood ? 'pill-orange' : 'pill-blue'}`} style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                          {isMedicine ? 'Life-saving' : isFood ? 'Essential' : 'Relief'}
                        </span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td>
                      <span className={`pill-badge ${isCritical ? 'pill-red' : 'pill-orange'}`}>
                        {isCritical ? '1 Highest' : '2 High'}
                      </span>
                    </td>

                    {/* Last Update */}
                    <td>
                      <span 
                        style={{ color: '#64748b', fontSize: '0.78rem', cursor: 'help' }}
                        title={exactTime}
                      >
                        {relativeTime}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          className="btn-ref-view"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          className="btn-ref-more"
                          title="More Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                    No vehicles found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vehicle Detail View Modal */}
      {selectedVehicle && (
        <div className="ref-modal-overlay" onClick={() => setSelectedVehicle(null)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ref-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Truck size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedVehicle.id} • {selectedVehicle.vehicle_number}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Telemetry Stream • GPS: Simulated • Ping: {formatRelativeTime(selectedVehicle.updated_at || selectedVehicle.created_at || selectedVehicle.last_ping)}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedVehicle(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ref-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Route & Progress */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span>{selectedVehicle.origin || 'Guwahati'}</span>
                  <span style={{ color: '#0284c7', fontWeight: 600 }}>
                    {selectedVehicle.progress_percent || 45}% En Route
                  </span>
                  <span>{selectedVehicle.destination || 'Imphal'}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${selectedVehicle.progress_percent || 45}%`, height: '100%', background: '#0284c7', borderRadius: 4 }} />
                </div>
              </div>

              {/* Route Risk & Operational Alert Warning Advisory */}
              {(() => {
                const sRisk = getVehicleRouteRisk(selectedVehicle);
                if (!sRisk.hasRisk) return null;
                return (
                  <div style={{
                    background: '#fff1f2',
                    border: '1px solid #fecdd3',
                    borderRadius: 8,
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be123c', fontWeight: 700, fontSize: '0.85rem' }}>
                        <AlertTriangle size={16} />
                        <span>Corridor Warning: Route at {sRisk.severity} Risk</span>
                      </div>
                      <span className="pill-badge pill-red" style={{ fontSize: '0.68rem' }}>
                        Active Route Alert
                      </span>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#881337', lineHeight: 1.4 }}>
                      {selectedVehicle.cargo} unit <strong>{selectedVehicle.id}</strong> is assigned to corridor <strong>{selectedVehicle.origin} → {selectedVehicle.destination}</strong> which currently has {sRisk.alerts.length} active operational alert(s) and {sRisk.incidents.length} ground hazard(s).
                    </p>

                    {onNavigate && (
                      <button
                        onClick={() => {
                          setSelectedVehicle(null);
                          onNavigate('route-intel');
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', marginTop: '2px', background: '#be123c' }}
                      >
                        <Navigation size={13} />
                        <span>Evaluate Safe Alternate Bypass in Route Intelligence →</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {/* Attributes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Cargo Type</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedVehicle.cargo}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Priority</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#dc2626', marginTop: 2 }}>{selectedVehicle.priority}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Sector</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedVehicle.current_location}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Driver Details</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedVehicle.driver_name} ({selectedVehicle.contact})</div>
                </div>
              </div>

              {/* Cold chain telemetry if applicable */}
              {selectedVehicle.temp_sensitive && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 6,
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#047857',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Thermometer size={16} />
                    <span>Cold Chain Monitored Container</span>
                  </div>
                  <strong>{selectedVehicle.storage_temp_c}°C (Nominal)</strong>
                </div>
              )}
            </div>

            <div className="ref-modal-footer">
              <button 
                onClick={() => setSelectedVehicle(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              {onNavigate && (
                <button
                  onClick={() => {
                    setSelectedVehicle(null);
                    onNavigate('live-map');
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Navigation size={13} />
                  Track on GIS Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddModalOpen && (
        <div className="ref-modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ref-modal-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Register &amp; Dispatch New Vehicle
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddVehicleSubmit}>
              <div className="ref-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Vehicle ID</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.id} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, id: e.target.value })}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">License Plate No.</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.vehicle_number} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, vehicle_number: e.target.value })}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Origin</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.origin} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, origin: e.target.value })}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Destination</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.destination} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, destination: e.target.value })}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Cargo Type</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.cargo} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, cargo: e.target.value })}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Dispatch Priority</label>
                    <select 
                      className="form-select"
                      value={newVehicle.priority}
                      onChange={(e) => setNewVehicle({ ...newVehicle, priority: e.target.value })}
                    >
                      <option value="Critical">Critical (Highest 1)</option>
                      <option value="High">High (Priority 2)</option>
                      <option value="Normal">Normal (Priority 3)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Driver Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.driver_name} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, driver_name: e.target.value })}
                      required 
                    />
                  </div>
                  <div>
                    <label className="form-label">Emergency Phone</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={newVehicle.contact} 
                      onChange={(e) => setNewVehicle({ ...newVehicle, contact: e.target.value })}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="ref-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                >
                  Dispatch Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
