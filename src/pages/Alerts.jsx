import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle, 
  Check, 
  Search, 
  MoreVertical, 
  X, 
  MapPin, 
  Calendar
} from 'lucide-react';
import { formatRelativeTime, formatExactDateTime } from '../utils/timeFormat';

export default function Alerts({ alerts = [], onAcknowledgeAlert = null }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Live ticker to update relative timestamps every 30 seconds
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker(t => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Directly normalize real alerts from alertService / Supabase
  const normalizedAlerts = (alerts || []).map((a, i) => {
    const ts = a.timestamp || a.created_at || new Date().toISOString();
    const isResolved = a.status === 'Resolved' || a.severity === 'Resolved';
    const isAck = a.is_acknowledged || a.status === 'Acknowledged' || isResolved;
    const statusText = isResolved ? 'Resolved' : isAck ? 'Acknowledged' : 'Active';

    return {
      alert_id: a.alert_id || `ALT-${String(i + 1).padStart(3, '0')}`,
      severity: a.severity || 'Critical',
      title: a.title || 'Transit Alert',
      location: a.location || (a.route_id === 'R001' ? 'Jiribam, Manipur' : a.route_id === 'R002' ? 'Sonapur, Assam' : (a.route_id || 'NER Regional Corridor')),
      route_id: a.route_id || 'NH2 / NH27',
      vehicle_id: a.vehicle_id || (i === 0 ? 'V001' : '—'),
      timestamp: ts,
      time: formatRelativeTime(ts),
      exact_time: formatExactDateTime(ts),
      status: statusText,
      is_acknowledged: isAck,
      description: a.description || 'Monitored hazard on freight transit corridor.',
      action_required: a.action_required || 'Follow standard regional emergency protocol.'
    };
  });

  // Dynamically derived KPI and Tab counts from actual alerts
  const totalCount = normalizedAlerts.length;
  const criticalCount = normalizedAlerts.filter(a => a.severity === 'Critical').length;
  const highCount = normalizedAlerts.filter(a => a.severity === 'High').length;
  const warningCount = normalizedAlerts.filter(a => a.severity === 'Warning' || a.severity === 'Moderate').length;
  const acknowledgedCount = normalizedAlerts.filter(a => a.status === 'Acknowledged').length;
  const resolvedCount = normalizedAlerts.filter(a => a.status === 'Resolved' || a.severity === 'Resolved').length;

  // Filtering
  const filteredAlerts = normalizedAlerts.filter(a => {
    // Tab filter
    if (activeTab === 'CRITICAL' && a.severity !== 'Critical') return false;
    if (activeTab === 'HIGH' && a.severity !== 'High') return false;
    if (activeTab === 'WARNING' && a.severity !== 'Warning' && a.severity !== 'Moderate') return false;
    if (activeTab === 'RESOLVED' && a.status !== 'Resolved' && a.severity !== 'Resolved') return false;

    // Severity Dropdown Filter
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (a.alert_id || '').toLowerCase().includes(q);
      const matchTitle = (a.title || '').toLowerCase().includes(q);
      const matchLoc = (a.location || '').toLowerCase().includes(q);
      const matchVehicle = (a.vehicle_id || '').toLowerCase().includes(q);
      const matchDesc = (a.description || '').toLowerCase().includes(q);
      return matchId || matchTitle || matchLoc || matchVehicle || matchDesc;
    }

    return true;
  });

  const handleAcknowledge = (alertId) => {
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(alertId);
    }
    if (selectedAlert && selectedAlert.alert_id === alertId) {
      setSelectedAlert({ ...selectedAlert, status: 'Acknowledged', is_acknowledged: true });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header matching Reference */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 42,
          height: 42,
          borderRadius: 10,
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Bell size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Operations Alert Dispatch
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
            Monitor critical logistics, route, weather and transit alerts.
          </p>
        </div>
      </div>

      {/* 5 Summary KPI Cards across top */}
      <div className="ref-kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {/* Card 1: Critical Alerts */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <AlertOctagon size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Critical Alerts</span>
            <span className="ref-kpi-value">{criticalCount}</span>
            <span className="ref-kpi-subtext" style={{ color: '#dc2626', fontWeight: 600 }}>Immediate action</span>
          </div>
        </div>

        {/* Card 2: High Severity */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}>
            <AlertTriangle size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">High Severity</span>
            <span className="ref-kpi-value">{highCount}</span>
            <span className="ref-kpi-subtext">Requires attention</span>
          </div>
        </div>

        {/* Card 3: Active Warnings */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            <Bell size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Active Warnings</span>
            <span className="ref-kpi-value">{warningCount}</span>
            <span className="ref-kpi-subtext">Monitor closely</span>
          </div>
        </div>

        {/* Card 4: Acknowledged */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Acknowledged</span>
            <span className="ref-kpi-value">{acknowledgedCount}</span>
            <span className="ref-kpi-subtext">Under review</span>
          </div>
        </div>

        {/* Card 5: Resolved */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#f1f5f9', color: '#1e293b' }}>
            <CheckCircle size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Resolved</span>
            <span className="ref-kpi-value">{resolvedCount}</span>
            <span className="ref-kpi-subtext">Today</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar: Filter Tabs + Search + Severity Dropdown */}
      <div className="ref-toolbar">
        {/* Tabs */}
        <div className="ref-tabs-group">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`ref-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('CRITICAL')}
            className={`ref-tab-btn ${activeTab === 'CRITICAL' ? 'active' : ''}`}
          >
            Critical ({criticalCount})
          </button>
          <button
            onClick={() => setActiveTab('HIGH')}
            className={`ref-tab-btn ${activeTab === 'HIGH' ? 'active' : ''}`}
          >
            High ({highCount})
          </button>
          <button
            onClick={() => setActiveTab('WARNING')}
            className={`ref-tab-btn ${activeTab === 'WARNING' ? 'active' : ''}`}
          >
            Warning ({warningCount})
          </button>
          <button
            onClick={() => setActiveTab('RESOLVED')}
            className={`ref-tab-btn ${activeTab === 'RESOLVED' ? 'active' : ''}`}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        {/* Search & Severity Filter */}
        <div className="ref-actions-group">
          <div className="ref-search-input-wrap">
            <Search size={15} className="ref-search-icon" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ref-search-input"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="ref-select"
          >
            <option value="ALL">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Warning">Warning</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            className="btn btn-outline"
            style={{ padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Filter by date"
          >
            <Calendar size={16} />
          </button>
        </div>
      </div>

      {/* Table Card matching reference */}
      <div className="ref-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Severity</th>
                <th>Alert</th>
                <th>Location / Route</th>
                <th>Affected Vehicle</th>
                <th>Time</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#64748b' }}>
                    <Bell size={32} style={{ opacity: 0.4, margin: '0 auto 8px auto', display: 'block' }} />
                    <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)' }}>No alerts match the selected filters</strong>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                      Try adjusting your search query, severity dropdown, or category tab.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((a, idx) => {
                  const isCrit = a.severity === 'Critical';
                  const isHigh = a.severity === 'High';
                  const isWarn = a.severity === 'Warning' || a.severity === 'Moderate';
                  const isResolved = a.status === 'Resolved' || a.severity === 'Resolved';
                  const isAck = a.status === 'Acknowledged';

                  return (
                    <tr key={a.alert_id || idx}>
                      {/* Alert ID */}
                      <td>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                          {a.alert_id}
                        </strong>
                      </td>

                      {/* Severity */}
                      <td>
                        <span className={`pill-badge ${
                          isCrit ? 'pill-red' : isHigh ? 'pill-orange' : isWarn ? 'pill-yellow' : 'pill-green'
                        }`}>
                          {a.severity}
                        </span>
                      </td>

                      {/* Alert Title */}
                      <td>
                        <strong style={{ color: 'var(--text-primary)' }}>{a.title}</strong>
                      </td>

                      {/* Location / Route */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="#0284c7" />
                          <span>{a.location || a.route_id}</span>
                        </div>
                      </td>

                      {/* Affected Vehicle */}
                      <td>
                        {a.vehicle_id && a.vehicle_id !== '—' ? (
                          <span style={{ color: '#0284c7', fontWeight: 600 }}>{a.vehicle_id}</span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      {/* Time */}
                      <td title={a.exact_time}>
                        <span style={{ color: '#64748b', fontSize: '0.8rem', cursor: 'default' }}>{a.time}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`pill-badge ${
                          isAck ? 'pill-blue' : isResolved ? 'pill-green' : 'pill-red'
                        }`}>
                          {a.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={() => setSelectedAlert(a)}
                            className="btn-ref-view"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setSelectedAlert(a)}
                            className="btn-ref-more"
                            title="Options"
                          >
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alert Details & Action Modal */}
      {selectedAlert && (
        <div className="ref-modal-overlay" onClick={() => setSelectedAlert(null)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ref-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: selectedAlert.severity === 'Critical' ? '#fee2e2' : '#ffedd5',
                  color: selectedAlert.severity === 'Critical' ? '#dc2626' : '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedAlert.alert_id} • {selectedAlert.title}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {selectedAlert.time} ({selectedAlert.exact_time}) • Status: {selectedAlert.status}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlert(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ref-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Alert Description */}
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  Incident Description
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {selectedAlert.description}
                </p>
              </div>

              {/* Recommended Protocol */}
              {selectedAlert.action_required && (
                <div style={{
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.25)',
                  borderRadius: 8,
                  padding: '0.85rem'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#0369a1', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                    Recommended Operations Protocol
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#0369a1', fontWeight: 600 }}>
                    {selectedAlert.action_required}
                  </p>
                </div>
              )}

              {/* Attributes Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Location Sector</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedAlert.location}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Affected Convoy</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginTop: 2 }}>{selectedAlert.vehicle_id || 'All Traffic'}</div>
                </div>
              </div>
            </div>

            <div className="ref-modal-footer">
              <button 
                onClick={() => setSelectedAlert(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              {selectedAlert.status !== 'Acknowledged' && selectedAlert.status !== 'Resolved' && (
                <button
                  onClick={() => handleAcknowledge(selectedAlert.alert_id)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={14} />
                  Acknowledge &amp; Dispatch Protocol
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
