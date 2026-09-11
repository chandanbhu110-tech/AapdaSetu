import React from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Compass, 
  Map as MapIcon, 
  Truck, 
  Bell, 
  FileSpreadsheet, 
  Activity,
  Radio,
  Wifi,
  WifiOff,
  Database
} from 'lucide-react';

export default function Navbar({ 
  activePage, 
  setActivePage, 
  activeAlertCount = 0,
  isOnline = true,
  isSupabaseConnected = true
}) {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard },
    { id: 'authority', label: 'Authority Command', icon: ShieldAlert },
    { id: 'route-intel', label: 'Route Intelligence', icon: Compass },
    { id: 'live-map', label: 'Live Map', icon: MapIcon },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount },
    { id: 'field-reports', label: 'Field Reports', icon: FileSpreadsheet }
  ];

  return (
    <header className="navbar">
      <div className="nav-inner">
        {/* Brand */}
        <div className="nav-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => setActivePage('dashboard')}>
          <div style={{
            height: '42px',
            display: 'flex',
            alignItems: 'center',
            background: '#ffffff',
            padding: '3px 8px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.25)'
          }}>
            <img 
              src={`${import.meta.env.BASE_URL}aapdassetu-logo.png`} 
              alt="AapdaSetu Logo" 
              style={{ 
                height: '36px', 
                width: 'auto',
                objectFit: 'contain',
                display: 'block'
              }} 
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <h1 className="brand-title" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                AapdaSetu
              </h1>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                SIH NER
              </span>
            </div>
            <p className="brand-subtitle" style={{ fontSize: '0.72rem', color: '#94a3b8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Connect • Respond • Rescue
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
                id={`nav-btn-${item.id}`}
              >
                <Icon size={15} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="nav-alert-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Global Operational Indicators (Clean Pills) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isSupabaseConnected ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              color: '#38bdf8'
            }} title="Connected to remote Supabase database">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#38bdf8', boxShadow: '0 0 6px #38bdf8' }} />
              Cloud Active
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              color: '#facc15'
            }}>
              Demo Mode
            </span>
          )}

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.3rem 0.65rem',
            borderRadius: '999px',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            color: '#c084fc'
          }} title="Simulated GPS coordinate telemetry">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#c084fc', boxShadow: '0 0 6px #c084fc' }} className="vehicle-marker-pulse" />
            GPS: Simulated
          </span>

          {isOnline ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#34d399'
            }} title="Network connection active">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Online
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.3rem 0.65rem',
              borderRadius: '999px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#f87171'
            }} title="Browser is offline or simulated offline mode is active">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
              Offline
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
