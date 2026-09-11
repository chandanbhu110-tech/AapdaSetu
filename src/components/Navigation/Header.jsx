import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';

export default function Header({ 
  onNavigate, 
  activeAlertCount = 0,
  isOnline = true,
  isSupabaseConnected = true
}) {
  const displayAlertCount = activeAlertCount;

  return (
    <header className="app-header">
      {/* Left: AapdaSetu Logo + Title */}
      <div className="header-left">
        <div className="header-brand" onClick={() => onNavigate('dashboard')}>
          <div className="header-logo-container">
            <img 
              src={`${import.meta.env.BASE_URL}aapdassetu-logo.png`} 
              alt="AapdaSetu Logo" 
              className="header-logo"
            />
          </div>
          <div className="header-title-wrap">
            <h1 className="header-main-title">AapdaSetu</h1>
            <p className="header-subtitle">Northeast India Logistics Monitoring</p>
          </div>
        </div>
      </div>

      {/* Right: Status Indicators + Notifications + Admin Profile */}
      <div className="header-right">
        {/* Subtle Operational Status Indicators */}
        <div className="status-indicators-group">
          {isSupabaseConnected ? (
            <span className="status-pill" title="Connected to remote Supabase database">
              <span className="status-pill-dot active" />
              Cloud Active
            </span>
          ) : (
            <span className="status-pill" title="Local in-memory demo data">
              <span className="status-pill-dot warning" />
              Demo Mode
            </span>
          )}

          <span className="status-pill" title="Simulated GPS coordinate telemetry">
            <span className="status-pill-dot simulated vehicle-marker-pulse" />
            GPS: Simulated
          </span>

          {isOnline ? (
            <span className="status-pill" title="System is online">
              <span className="status-pill-dot active" />
              Online
            </span>
          ) : (
            <span className="status-pill" title="Offline mode active - reports will queue locally">
              <span className="status-pill-dot danger" />
              Offline
            </span>
          )}
        </div>

        {/* Notification Bell */}
        <button 
          className="header-icon-btn" 
          onClick={() => onNavigate('alerts')}
          title="View Active Dispatch Alerts"
          id="btn-header-alerts"
        >
          <Bell size={18} />
          {displayAlertCount > 0 && (
            <span className="header-notification-badge">{displayAlertCount}</span>
          )}
        </button>

        {/* Admin Profile Section */}
        <div 
          className="header-user-profile" 
          onClick={() => onNavigate('authority')}
          title="Operations Command Center"
        >
          <div className="user-avatar" style={{ background: '#0284c7', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem' }}>
            AD
          </div>
          <div className="user-details">
            <span className="user-name">Control Officer</span>
            <span className="user-role">NER Logistics Unit</span>
          </div>
          <ChevronDown size={14} color="#64748b" style={{ marginLeft: '4px' }} />
        </div>
      </div>
    </header>
  );
}
