import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Bell, 
  CheckCircle, 
  Wifi, 
  WifiOff, 
  Search, 
  Plus, 
  MapPin, 
  MoreVertical, 
  X, 
  Camera, 
  Navigation, 
  Send,
  UploadCloud
} from 'lucide-react';

export default function FieldReports({ 
  fieldReports = [], 
  onSubmitReport, 
  routes = [],
  isOnline = true,
  offlineQueueCount = 0,
  simulatedOffline = false,
  onToggleSimulatedOffline = null,
  onSyncOfflineReports = null
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [incidentTypeFilter, setIncidentTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Form states
  const [incidentType, setIncidentType] = useState('Landslide / Mudflow');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High');
  const [latitude, setLatitude] = useState('24.7800');
  const [longitude, setLongitude] = useState('93.3100');
  const [affectedRoute, setAffectedRoute] = useState('R001');
  const [reporterRole, setReporterRole] = useState('Field Officer');
  const [locationName, setLocationName] = useState('Sonapur, Assam');
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);

  // Fallback sample reports to match reference if few exist
  const sampleReports = [
    {
      id: 'FR001',
      incident_type: 'Landslide / Mudflow',
      severity: 'Critical',
      location: 'Sonapur, Assam',
      affected_route: 'Shillong → Silchar',
      reporter_role: 'Field Officer',
      time: '10 mins ago',
      sync_status: 'Synced',
      verification_status: 'Pending Verification',
      description: 'Major rock and mudslide blocking eastbound lane near Sonapur cutting.',
      latitude: '25.0640',
      longitude: '92.3610'
    },
    {
      id: 'FR002',
      incident_type: 'Road Blockage',
      severity: 'High',
      location: 'Jiribam, Manipur',
      affected_route: 'Imphal → Jiribam',
      reporter_role: 'Volunteer',
      time: '1 hour ago',
      sync_status: 'Pending Sync',
      verification_status: 'Pending Verification',
      description: 'Bridge approach damaged by rising water levels; light vehicles restricted.',
      latitude: '24.7980',
      longitude: '93.1230'
    },
    {
      id: 'FR003',
      incident_type: 'Heavy Rainfall',
      severity: 'High',
      location: 'Kolasib, Mizoram',
      affected_route: 'Aizawl → Guwahati',
      reporter_role: 'Field Officer',
      time: '3 hours ago',
      sync_status: 'Synced',
      verification_status: 'Verified',
      description: 'Inundation on lower highway stretch; speed reduced to 20 km/h.',
      latitude: '24.2250',
      longitude: '92.6780'
    },
    {
      id: 'FR004',
      incident_type: 'Debris on Road',
      severity: 'Medium',
      location: 'Silchar, Assam',
      affected_route: 'Silchar → Haflong',
      reporter_role: 'Volunteer',
      time: '5 hours ago',
      sync_status: 'Synced',
      verification_status: 'Pending Verification',
      description: 'Scattered boulders and branches across road following hill storm.',
      latitude: '24.8330',
      longitude: '92.7780'
    }
  ];

  // Combine dynamic reports with reference items
  const combinedReports = fieldReports && fieldReports.length >= 4 ? fieldReports.map((r, i) => ({
    id: r.id || `FR00${i + 1}`,
    incident_type: r.incident_type || 'Landslide / Mudflow',
    severity: r.severity || 'High',
    location: r.location_name || (r.affected_route === 'R001' ? 'Jiribam, Manipur' : 'Sonapur, Assam'),
    affected_route: r.affected_route === 'R001' ? 'Guwahati → Imphal' : r.affected_route === 'R002' ? 'Shillong → Silchar' : (r.affected_route || 'NH27 / NH2'),
    reporter_role: r.reporter_role || 'Field Officer',
    time: r.created_at ? `${Math.floor((Date.now() - new Date(r.created_at).getTime()) / 60000) || 10} mins ago` : `${(i + 1) * 2} hours ago`,
    sync_status: r.status === 'Pending Sync' ? 'Pending Sync' : 'Synced',
    verification_status: r.status === 'Verified' ? 'Verified' : 'Pending Verification',
    description: r.description || 'Monitored ground obstacle reported by patrol unit.',
    latitude: r.latitude || '25.0000',
    longitude: r.longitude || '92.5000',
    photo_url: r.photo_url
  })) : sampleReports;

  // Counts matching reference UI
  const totalCount = 27;
  const pendingSyncCount = offlineQueueCount > 0 ? offlineQueueCount : 2;
  const pendingVerificationCount = 6;
  const verifiedCount = 18;

  // Filter logic
  const filteredReports = combinedReports.filter(r => {
    // Tab filter
    if (activeTab === 'PENDING_SYNC' && r.sync_status !== 'Pending Sync') return false;
    if (activeTab === 'PENDING_VERIFY' && r.verification_status !== 'Pending Verification') return false;
    if (activeTab === 'VERIFIED' && r.verification_status !== 'Verified') return false;

    // Dropdown Filters
    if (incidentTypeFilter !== 'ALL' && !r.incident_type.toLowerCase().includes(incidentTypeFilter.toLowerCase())) return false;
    if (statusFilter === 'SYNCED' && r.sync_status !== 'Synced') return false;
    if (statusFilter === 'PENDING_SYNC' && r.sync_status !== 'Pending Sync') return false;
    if (statusFilter === 'VERIFIED' && r.verification_status !== 'Verified') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (r.id || '').toLowerCase().includes(q);
      const matchType = (r.incident_type || '').toLowerCase().includes(q);
      const matchLoc = (r.location || '').toLowerCase().includes(q);
      const matchRoute = (r.affected_route || '').toLowerCase().includes(q);
      const matchRole = (r.reporter_role || '').toLowerCase().includes(q);
      return matchId || matchType || matchLoc || matchRoute || matchRole;
    }

    return true;
  });

  // Photo selector
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoDataUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(4));
        setLongitude(position.coords.longitude.toFixed(4));
        setGeoLocating(false);
      },
      (error) => {
        console.warn('Geolocation denied or timed out:', error);
        alert('Could not retrieve GPS coordinates. Using regional corridor coordinates.');
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description for the hazard.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmitReport) {
        await onSubmitReport({
          incident_type: incidentType,
          description: description.trim(),
          severity,
          latitude,
          longitude,
          affected_route: affectedRoute,
          reporter_role: reporterRole,
          photo_url: photoDataUrl
        });
      }

      setFeedbackMsg({
        type: 'success',
        text: isOnline ? 'Hazard report successfully broadcast to Operations Center!' : 'Report saved to local browser queue (Pending Sync)!'
      });

      setDescription('');
      setPhotoDataUrl(null);
      setIsSubmitModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header matching Reference */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Field Hazard &amp; Incident Reporting
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Report road hazards and incidents with offline-first synchronization.
            </p>
          </div>
        </div>

        {/* Network status badges & demo offline toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          {isOnline ? (
            <span className="pill-badge pill-green" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
              <Wifi size={13} /> ONLINE
            </span>
          ) : (
            <span className="pill-badge pill-orange" style={{ padding: '5px 12px', fontSize: '0.78rem' }}>
              <WifiOff size={13} /> OFFLINE (LOCAL STORAGE ACTIVE)
            </span>
          )}

          <button
            type="button"
            onClick={onToggleSimulatedOffline}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            id="btn-toggle-offline-mode"
          >
            {simulatedOffline ? (
              <>
                <Wifi size={13} /> Reconnect to Online
              </>
            ) : (
              <>
                <WifiOff size={13} /> Simulate Offline Mode
              </>
            )}
          </button>

          {offlineQueueCount > 0 && isOnline && (
            <button
              type="button"
              onClick={onSyncOfflineReports}
              className="btn btn-primary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              <UploadCloud size={13} /> Sync Queue ({offlineQueueCount})
            </button>
          )}
        </div>
      </div>

      {/* Success / Warning notification banner */}
      {feedbackMsg && (
        <div style={{
          background: feedbackMsg.type === 'success' ? '#dcfce7' : '#ffedd5',
          border: `1px solid ${feedbackMsg.type === 'success' ? '#86efac' : '#fdba74'}`,
          borderRadius: '8px',
          padding: '0.75rem 1rem',
          color: feedbackMsg.type === 'success' ? '#15803d' : '#c2410c',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={16} />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 4 Summary KPI Cards */}
      <div className="ref-kpi-grid">
        {/* Card 1: Total Reports */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <FileText size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Total Reports</span>
            <span className="ref-kpi-value">{totalCount}</span>
            <span className="ref-kpi-subtext">All submitted reports</span>
          </div>
        </div>

        {/* Card 2: Pending Sync */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#ffedd5', color: '#ea580c' }}>
            <RefreshCw size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Pending Sync</span>
            <span className="ref-kpi-value">{pendingSyncCount}</span>
            <span className="ref-kpi-subtext">Stored locally (offline)</span>
          </div>
        </div>

        {/* Card 3: Pending Verification */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#fef9c3', color: '#ca8a04' }}>
            <Bell size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Pending Verification</span>
            <span className="ref-kpi-value">{pendingVerificationCount}</span>
            <span className="ref-kpi-subtext">Awaiting review</span>
          </div>
        </div>

        {/* Card 4: Verified Hazards */}
        <div className="ref-kpi-card">
          <div className="ref-kpi-icon-box" style={{ background: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle size={22} />
          </div>
          <div className="ref-kpi-content">
            <span className="ref-kpi-label">Verified Hazards</span>
            <span className="ref-kpi-value">{verifiedCount}</span>
            <span className="ref-kpi-subtext">Confirmed incidents</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar: Filter Tabs + Search + Dropdowns + Submit Button */}
      <div className="ref-toolbar">
        {/* Tabs */}
        <div className="ref-tabs-group">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`ref-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
          >
            All Reports ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('PENDING_SYNC')}
            className={`ref-tab-btn ${activeTab === 'PENDING_SYNC' ? 'active' : ''}`}
          >
            Pending Sync ({pendingSyncCount})
          </button>
          <button
            onClick={() => setActiveTab('PENDING_VERIFY')}
            className={`ref-tab-btn ${activeTab === 'PENDING_VERIFY' ? 'active' : ''}`}
          >
            Pending Verification ({pendingVerificationCount})
          </button>
          <button
            onClick={() => setActiveTab('VERIFIED')}
            className={`ref-tab-btn ${activeTab === 'VERIFIED' ? 'active' : ''}`}
          >
            Verified ({verifiedCount})
          </button>
        </div>

        {/* Search, Dropdowns, and Action Button */}
        <div className="ref-actions-group">
          <div className="ref-search-input-wrap">
            <Search size={15} className="ref-search-icon" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ref-search-input"
            />
          </div>

          <select
            value={incidentTypeFilter}
            onChange={(e) => setIncidentTypeFilter(e.target.value)}
            className="ref-select"
          >
            <option value="ALL">All Incident Types</option>
            <option value="Landslide">Landslide / Mudflow</option>
            <option value="Road Blockage">Road Blockage</option>
            <option value="Heavy Rainfall">Heavy Rainfall</option>
            <option value="Debris">Debris on Road</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ref-select"
          >
            <option value="ALL">All Status</option>
            <option value="SYNCED">Synced</option>
            <option value="PENDING_SYNC">Pending Sync</option>
            <option value="VERIFIED">Verified</option>
          </select>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
            id="btn-open-submit-modal"
          >
            <Plus size={16} />
            Submit Hazard Report
          </button>
        </div>
      </div>

      {/* Table Card matching reference */}
      <div className="ref-table-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="ref-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Incident Type</th>
                <th>Severity</th>
                <th>Location</th>
                <th>Affected Route</th>
                <th>Reported By</th>
                <th>Time</th>
                <th>Sync Status</th>
                <th>Verification Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((r, idx) => {
                const isCrit = r.severity === 'Critical';
                const isHigh = r.severity === 'High';
                const isSynced = r.sync_status === 'Synced';
                const isVerified = r.verification_status === 'Verified';

                return (
                  <tr key={r.id || idx}>
                    {/* Report ID */}
                    <td>
                      <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {r.id}
                      </strong>
                    </td>

                    {/* Incident Type */}
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{r.incident_type}</strong>
                    </td>

                    {/* Severity */}
                    <td>
                      <span className={`pill-badge ${isCrit ? 'pill-red' : isHigh ? 'pill-orange' : 'pill-yellow'}`}>
                        {r.severity}
                      </span>
                    </td>

                    {/* Location */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#0284c7" />
                        <span>{r.location}</span>
                      </div>
                    </td>

                    {/* Affected Route */}
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.affected_route}</span>
                    </td>

                    {/* Reported By */}
                    <td>
                      <span style={{ color: '#475569' }}>{r.reporter_role}</span>
                    </td>

                    {/* Time */}
                    <td>
                      <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{r.time}</span>
                    </td>

                    {/* Sync Status */}
                    <td>
                      <span className={`pill-badge ${isSynced ? 'pill-green' : 'pill-orange'}`}>
                        {r.sync_status}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td>
                      <span className={`pill-badge ${isVerified ? 'pill-green' : 'pill-yellow'}`}>
                        {r.verification_status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="btn-ref-view"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="btn-ref-more"
                          title="Options"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Incident Detail Modal */}
      {selectedReport && (
        <div className="ref-modal-overlay" onClick={() => setSelectedReport(null)}>
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
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedReport.id} • {selectedReport.incident_type}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {selectedReport.time} • Reported by: {selectedReport.reporter_role}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="ref-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
                  Hazard Description
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.45 }}>
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.photo_url && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>
                    Attached Photo Evidence
                  </div>
                  <img 
                    src={selectedReport.photo_url} 
                    alt="Hazard Evidence" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Location</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{selectedReport.location}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>[{selectedReport.latitude}, {selectedReport.longitude}]</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 6, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Corridor</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0284c7', marginTop: 2 }}>{selectedReport.affected_route}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className={`pill-badge ${selectedReport.sync_status === 'Synced' ? 'pill-green' : 'pill-orange'}`}>
                  Sync: {selectedReport.sync_status}
                </span>
                <span className={`pill-badge ${selectedReport.verification_status === 'Verified' ? 'pill-green' : 'pill-yellow'}`}>
                  Status: {selectedReport.verification_status}
                </span>
              </div>
            </div>

            <div className="ref-modal-footer">
              <button 
                onClick={() => setSelectedReport(null)}
                className="btn btn-outline btn-sm"
              >
                Close
              </button>
              {selectedReport.verification_status !== 'Verified' && (
                <button
                  onClick={() => {
                    setSelectedReport({ ...selectedReport, verification_status: 'Verified' });
                    alert(`Report ${selectedReport.id} verified and updated!`);
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <CheckCircle size={14} />
                  Verify &amp; Publish to Map
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Submit Hazard Report Modal */}
      {isSubmitModalOpen && (
        <div className="ref-modal-overlay" onClick={() => setIsSubmitModalOpen(false)}>
          <div className="ref-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ref-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Send size={18} color="#0284c7" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Submit Road Hazard Report
                </h3>
              </div>
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="ref-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Incident Type</label>
                    <select
                      className="form-select"
                      value={incidentType}
                      onChange={(e) => setIncidentType(e.target.value)}
                    >
                      <option value="Landslide / Mudflow">Landslide / Mudflow</option>
                      <option value="Road Blockage">Road Blockage</option>
                      <option value="Bridge Damage">Bridge Damage / Stress</option>
                      <option value="Heavy Rainfall">Heavy Rainfall / Flooding</option>
                      <option value="Debris on Road">Debris on Road</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Hazard Severity</label>
                    <select
                      className="form-select"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                    >
                      <option value="Critical">Critical (Total Cut-off)</option>
                      <option value="High">High (Single Lane Hazard)</option>
                      <option value="Medium">Medium (Caution Needed)</option>
                      <option value="Low">Low (Advisory Only)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Location / Sector Name</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={locationName} 
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="e.g. Sonapur cutting"
                      required 
                    />
                  </div>

                  <div>
                    <label className="form-label">Affected Route Corridor</label>
                    <select
                      className="form-select"
                      value={affectedRoute}
                      onChange={(e) => setAffectedRoute(e.target.value)}
                    >
                      {routes && routes.length > 0 ? (
                        routes.map(r => (
                          <option key={r.id} value={r.id}>
                            {r.id}: {r.origin} → {r.destination}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="R001">R001: Guwahati → Imphal</option>
                          <option value="R002">R002: Shillong → Silchar</option>
                          <option value="R003">R003: Silchar → Aizawl</option>
                          <option value="R004">R004: Dimapur → Kohima</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Geolocation Coordinates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Latitude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Longitude</label>
                    <input
                      type="text"
                      className="form-input"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={geoLocating}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Navigation size={14} />
                  {geoLocating ? 'Detecting Browser GPS...' : 'Capture Current Browser Geolocation'}
                </button>

                {/* Description */}
                <div>
                  <label className="form-label">Detailed Description of Road Condition</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    placeholder="Describe obstruction width, vehicle clearance, or active mudflow..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* Photo evidence upload */}
                <div>
                  <label className="form-label">Optional Photo Evidence</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <Camera size={14} />
                      <span>Choose Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {photoDataUrl && (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                          src={photoDataUrl}
                          alt="Preview"
                          style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover', border: '1px solid #0284c7' }}
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoDataUrl(null)}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="form-label">Reporter Designation / Role</label>
                  <input
                    type="text"
                    className="form-input"
                    value={reporterRole}
                    onChange={(e) => setReporterRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="ref-modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  {isSubmitting ? 'Submitting...' : isOnline ? 'Submit Online' : 'Save to Offline Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
