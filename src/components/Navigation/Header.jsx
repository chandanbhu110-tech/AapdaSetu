import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  ChevronDown, 
  Lock, 
  UserPlus, 
  LogOut, 
  ShieldCheck, 
  BarChart2 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ 
  onNavigate, 
  activeAlertCount = 0,
  isOnline = true,
  isSupabaseConnected = true
}) {
  const displayAlertCount = activeAlertCount;
  const { 
    isAuthenticated, 
    officialProfile, 
    openAuthModal, 
    signOut 
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute official avatar initials
  const initials = officialProfile?.full_name
    ? officialProfile.full_name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(n => n[0].toUpperCase())
        .join('')
    : 'OF';

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

        {/* Official Authentication & Profile Section */}
        {isAuthenticated ? (
          <div className="header-profile-container" ref={dropdownRef}>
            <div 
              className="header-user-profile" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              title="Official Profile & Command Options"
              id="header-user-profile-btn"
            >
              <div className="user-avatar" style={{ background: '#0284c7', color: '#ffffff', fontWeight: 700, fontSize: '0.75rem' }}>
                {initials}
              </div>
              <div className="user-details">
                <span className="user-name">{officialProfile?.full_name || 'Official'}</span>
                <span className="user-role">{officialProfile?.agency || 'NER Logistics Unit'}</span>
              </div>
              <ChevronDown 
                size={14} 
                color="#64748b" 
                style={{ 
                  marginLeft: '4px',
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="header-profile-dropdown">
                <div className="dropdown-user-info">
                  <div className="dropdown-official-badge">
                    <ShieldCheck size={13} />
                    <span>VERIFIED OFFICIAL</span>
                  </div>
                  <div className="dropdown-user-name">{officialProfile?.full_name}</div>
                  <div className="dropdown-user-email">{officialProfile?.email}</div>
                  {officialProfile?.official_id && (
                    <div className="dropdown-badge-id">Badge: {officialProfile.official_id}</div>
                  )}
                </div>

                <div className="dropdown-divider" />

                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigate('authority');
                  }}
                >
                  <BarChart2 size={16} />
                  <span>Authority Command</span>
                </button>

                {/* Officials have options to create/register account for fellow officials */}
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    openAuthModal('register');
                  }}
                >
                  <UserPlus size={16} />
                  <span>Register Fellow Official</span>
                </button>

                <div className="dropdown-divider" />

                <button 
                  className="dropdown-item text-danger" 
                  onClick={() => {
                    setIsDropdownOpen(false);
                    signOut();
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="header-auth-actions">
            <button 
              className="btn-header-signin" 
              onClick={() => openAuthModal('login')}
              title="Official Sign In"
              id="btn-header-signin"
            >
              <Lock size={15} />
              <span>Official Sign In</span>
            </button>

            <button 
              className="btn-header-register" 
              onClick={() => openAuthModal('register')}
              title="Register as an authorized official"
              id="btn-header-register"
            >
              <UserPlus size={15} />
              <span>Official Register</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
