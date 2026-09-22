import React, { useState, useEffect } from 'react';
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
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Phone,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { BASE_FIELD_REPORTS } from '../data/baselineReports';
import { useAuth } from '../contexts/AuthContext';

export default function FieldReports({ 
  fieldReports = [], 
  onSubmitReport, 
  onVerifyReport,
  routes = [],
  isOnline = true,
  offlineQueueCount = 0,
  simulatedOffline = false,
  onToggleSimulatedOffline = null,
  onSyncOfflineReports = null
}) {
  const { isAuthority, officialProfile } = useAuth();
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
  const [locationName, setLocationName] = useState('Sonapur, Assam');
  const [photoDataUrl, setPhotoDataUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [geoLocating, setGeoLocating] = useState(false);

  // Submitter Verification & Anti-Malpractice Identification States
  const [reporterName, setReporterName] = useState(() => officialProfile?.full_name || '');
  const [reporterPhone, setReporterPhone] = useState('');
  const [reporterCategory, setReporterCategory] = useState(() => 
    officialProfile?.role === 'authority' ? 'Disaster Authority Officer' : 'Field Officer / Highway Patrol'
  );
  const [reporterAgency, setReporterAgency] = useState(() => officialProfile?.agency || '');
  const [reporterBadgeId, setReporterBadgeId] = useState(() => officialProfile?.official_id || '');
  const [declarationChecked, setDeclarationChecked] = useState(false);

  // Auto-sync submitter details if official logs in
  useEffect(() => {
    if (officialProfile) {
      if (!reporterName) setReporterName(officialProfile.full_name || '');
      if (!reporterAgency) setReporterAgency(officialProfile.agency || '');
      if (!reporterBadgeId) setReporterBadgeId(officialProfile.official_id || '');
      if (!reporterCategory || reporterCategory === 'Field Officer') {
        setReporterCategory(officialProfile.role === 'authority' ? 'Disaster Authority Officer' : 'Field Officer / Highway Patrol');
      }
    }
  }, [officialProfile]);

  // Helper for human-readable time elapsed
  const formatTimeAgo = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} days ago`;
    } catch {
      return 'Recently';
    }
  };

  // Authority-only verification handler
  const handleVerify = async (reportId) => {
    if (!isAuthority) {
      alert('Permission Denied: Only Disaster Management Authority officers can verify field reports. Field officials can submit and view reports only.');
      return;
    }
    if (onVerifyReport) {
      await onVerifyReport(reportId);
    }
    setSelectedReport(prev => prev ? { ...prev, verification_status: 'Verified', status: 'Verified' } : null);
    setFeedbackMsg({
      type: 'success',
      text: `Report ${reportId} successfully verified by Authority and published to live map!`
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Complete combined dataset for both counts and table rendering:
  // Source of truth is fieldReports (with fallback to baseline reports if empty)
  const rawList = fieldReports && fieldReports.length > 0 ? fieldReports : BASE_FIELD_REPORTS;
  const combinedReports = rawList.map((r, idx) => {
    const isOffline = r.is_offline || r.status === 'Pending Sync' || r.sync_status === 'Pending Sync';
    const syncStatus = r.sync_status || (isOffline ? 'Pending Sync' : 'Synced');
    const verificationStatus = r.verification_status || (r.status === 'Verified' ? 'Verified' : isOffline ? 'Pending Sync' : (r.status || 'Pending Verification'));
    
    return {
      id: r.id || r.report_id || `FR0${idx + 1}`,
      incident_type: r.incident_type || 'Road Hazard',
      severity: r.severity || 'Moderate',
      location: r.location || r.location_name || (r.affected_route === 'R001' ? 'Guwahati → Imphal' : 'Assam Sector'),
      affected_route: r.affected_route === 'R001' ? 'Guwahati → Imphal' : r.affected_route === 'R002' ? 'Shillong → Silchar' : (r.affected_route || 'NH27 / NH2'),
      reporter_role: r.reporter_role || r.reporter_id || 'Field Officer',
      reporter_name: r.reporter_name || (r.reporter_id && r.reporter_id.split(' [')[0]) || 'Ground Officer',
      reporter_phone: r.reporter_phone || '',
      reporter_agency: r.reporter_agency || '',
      reporter_badge: r.reporter_badge || '',
      time: r.time || (r.created_at || r.timestamp ? formatTimeAgo(r.created_at || r.timestamp) : 'Recently'),
      sync_status: syncStatus,
      verification_status: verificationStatus,
      description: r.description || '',
      latitude: r.latitude ? String(r.latitude) : '25.0000',
      longitude: r.longitude ? String(r.longitude) : '92.5000',
      photo_url: r.photo_url || null,
      created_at: r.created_at || r.timestamp
    };
  });

  // Dynamic counts derived from the complete reports dataset
  const totalCount = combinedReports.length;
  const pendingSyncCount = offlineQueueCount > 0 
    ? offlineQueueCount 
    : combinedReports.filter(r => r.sync_status === 'Pending Sync').length;
  const pendingVerificationCount = combinedReports.filter(r => r.verification_status === 'Pending Verification').length;
  const verifiedCount = combinedReports.filter(r => r.verification_status === 'Verified').length;

  // Filter logic applied to the complete dataset
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
    if (!reporterName.trim()) {
      alert('Submitter Name is required to prevent anonymous / fraudulent submissions.');
      return;
    }
    const cleanPhone = reporterPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      alert('A valid 10-digit contact mobile number is required to verify this report.');
      return;
    }
    if (!declarationChecked) {
      alert('You must accept the Anti-Malpractice declaration confirming this is a genuine hazard report.');
      return;
    }

    setIsSubmitting(true);
    try {
      let result = null;
      if (onSubmitReport) {
        result = await onSubmitReport({
          incident_type: incidentType,
          description: description.trim(),
          severity,
          latitude,
          longitude,
          affected_route: affectedRoute,
          reporter_name: reporterName.trim(),
          reporter_phone: cleanPhone,
          reporter_role: reporterCategory,
          reporter_agency: reporterAgency.trim(),
          reporter_badge: reporterBadgeId.trim(),
          location_name: locationName || 'Assam Sector',
          photo_url: photoDataUrl
        });
      }

      const isSynced = result?.synced === true;
      const feedbackText = result?.message || (isOnline && isSynced
        ? 'Hazard report successfully broadcast to Operations Center!'
        : 'Report saved locally. It will sync when connection is restored.');

      setFeedbackMsg({
        type: isSynced ? 'success' : 'warning',
        text: feedbackText
      });

      setDescription('');
      setPhotoDataUrl(null);
      setDeclarationChecked(false);
      if (!officialProfile) {
        setReporterPhone('');
      }
      setIsSubmitModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 6000);
    } catch (err) {
      console.error('Failed to submit report:', err);
      setFeedbackMsg({
        type: 'warning',
        text: 'Report saved locally and will sync when connection is restored.'
      });
      setIsSubmitModalOpen(false);
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
          {/* Authority Privilege Indicator */}
          {isAuthority ? (
            <span className="pill-badge pill-green" style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }} title="Authority Privileges Active: You can verify and publish field reports">
              <ShieldCheck size={13} /> Authority: Verification Active
            </span>
          ) : (
            <span className="pill-badge pill-orange" style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }} title="Field Official Mode: Report submission enabled. Verification requires Authority login.">
              <Lock size={13} /> Field Official: Verification Restricted
            </span>
          )}

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
              onClick={async () => {
                if (onSyncOfflineReports) {
                  const res = await onSyncOfflineReports();
                  if (res?.syncedCount > 0) {
                    setFeedbackMsg({
                      type: 'success',
                      text: `Successfully synced ${res.syncedCount} queued report(s) to Supabase!`
                    });
                    setTimeout(() => setFeedbackMsg(null), 5000);
                  }
                }
              }}
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

              {/* Submitter Identification & Verification Contact Details */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={16} color="#0284c7" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                      Submitter Identification &amp; Contact
                    </span>
                  </div>
                  <span className="pill-badge pill-blue" style={{ fontSize: '0.7rem' }}>
                    Anti-Malpractice Traceable
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Submitter Name:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {selectedReport.reporter_name || selectedReport.reporter_role || 'Ground Officer'}
                    </strong>
                  </div>

                  <div>
                    <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Role / Category:</span>
                    <span style={{ color: '#334155', fontWeight: 500 }}>
                      {selectedReport.reporter_role || 'Field Officer'}
                    </span>
                  </div>

                  {selectedReport.reporter_phone && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Contact Phone:</span>
                      <a 
                        href={`tel:${selectedReport.reporter_phone}`}
                        style={{ 
                          color: '#0284c7', 
                          fontWeight: 600, 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '4px',
                          textDecoration: 'none'
                        }}
                        title="Click to call ground reporter for live verification"
                        id="link-call-submitter"
                      >
                        <Phone size={13} /> {selectedReport.reporter_phone}
                      </a>
                    </div>
                  )}

                  {selectedReport.reporter_agency && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Department / Agency:</span>
                      <span style={{ color: '#334155' }}>{selectedReport.reporter_agency}</span>
                    </div>
                  )}

                  {selectedReport.reporter_badge && (
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.72rem', display: 'block' }}>Badge / Govt ID:</span>
                      <span style={{ color: '#334155', fontFamily: 'var(--font-mono)' }}>{selectedReport.reporter_badge}</span>
                    </div>
                  )}
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
                isAuthority ? (
                  <button
                    onClick={() => handleVerify(selectedReport.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0284c7' }}
                    id="btn-verify-report"
                  >
                    <CheckCircle size={14} />
                    <span>Verify &amp; Publish to Map (Authority)</span>
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.73rem',
                      color: '#b45309',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 500
                    }}>
                      <Lock size={12} />
                      <span>Authority Verification Required</span>
                    </div>
                    <button
                      disabled
                      className="btn btn-sm"
                      style={{
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#e2e8f0',
                        color: '#64748b',
                        border: '1px solid #cbd5e1'
                      }}
                      title="Only Disaster Authority personnel can verify field reports. Field officials can submit and view only."
                      id="btn-verify-disabled"
                    >
                      <Lock size={13} />
                      <span>Verify (Authority Only)</span>
                    </button>
                  </div>
                )
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

                {/* Submitter Verification & Accountability Section (Anti-Malpractice) */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={16} color="#0284c7" />
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Submitter Identification (Anti-Malpractice Verification)
                      </span>
                    </div>
                    {officialProfile ? (
                      <span className="pill-badge pill-green" style={{ fontSize: '0.7rem' }}>
                        <ShieldCheck size={11} /> Verified Account
                      </span>
                    ) : (
                      <span className="pill-badge pill-orange" style={{ fontSize: '0.7rem' }}>
                        Identity Validation Required
                      </span>
                    )}
                  </div>
                  
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>
                    To prevent false alarms, traffic diversions, and fraudulent claims, submitter contact details are logged and cross-referenced by authorities.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Full Name <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={reporterName}
                        onChange={(e) => setReporterName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra / Officer Sharma"
                        required
                        id="input-reporter-name"
                      />
                    </div>

                    <div>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Contact Mobile / Phone <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        value={reporterPhone}
                        onChange={(e) => setReporterPhone(e.target.value)}
                        placeholder="e.g. 9876543210 (10 digits)"
                        required
                        id="input-reporter-phone"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label className="form-label">Submitter Role</label>
                      <select
                        className="form-select"
                        value={reporterCategory}
                        onChange={(e) => setReporterCategory(e.target.value)}
                        id="select-reporter-category"
                      >
                        <option value="Field Officer / Highway Patrol">Field Officer / Highway Patrol</option>
                        <option value="Disaster Authority Officer">Disaster Authority Officer</option>
                        <option value="Police / Traffic Warden">Police / Traffic Warden</option>
                        <option value="NDRF / SDRF Personnel">NDRF / SDRF Personnel</option>
                        <option value="Truck Driver / Commercial Fleet">Truck Driver / Commercial Fleet</option>
                        <option value="Local Citizen / Verified Resident">Local Citizen / Verified Resident</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Agency / Department</label>
                      <input
                        type="text"
                        className="form-input"
                        value={reporterAgency}
                        onChange={(e) => setReporterAgency(e.target.value)}
                        placeholder="e.g. NHAI / Assam Police / Citizen"
                        id="input-reporter-agency"
                      />
                    </div>

                    <div>
                      <label className="form-label">Official Badge / Govt ID</label>
                      <input
                        type="text"
                        className="form-input"
                        value={reporterBadgeId}
                        onChange={(e) => setReporterBadgeId(e.target.value)}
                        placeholder="e.g. OFC-7842 / Aadhaar/DL"
                        id="input-reporter-badge"
                      />
                    </div>
                  </div>

                  {/* Statutory Anti-Malpractice Warning & Checkbox */}
                  <div style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '6px',
                    padding: '0.65rem 0.75rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    marginTop: '2px'
                  }}>
                    <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#92400e', fontWeight: 600 }}>
                        Statutory Anti-Malpractice Notice (Section 54, Disaster Management Act, 2005)
                      </span>
                      <span style={{ fontSize: '0.71rem', color: '#b45309', lineHeight: 1.35 }}>
                        Submitting false or malicious disaster warnings to divert traffic or cause panic is punishable by up to 1 year imprisonment and heavy fines.
                      </span>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={declarationChecked}
                          onChange={(e) => setDeclarationChecked(e.target.checked)}
                          required
                          id="chk-anti-malpractice-declaration"
                        />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#78350f' }}>
                          I hereby declare that this report represents an actual, observed ground hazard.
                        </span>
                      </label>
                    </div>
                  </div>
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
