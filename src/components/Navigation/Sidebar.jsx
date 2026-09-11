import React from 'react';
import { 
  LayoutDashboard, 
  Compass, 
  Map as MapIcon, 
  Truck, 
  Bell, 
  FileSpreadsheet, 
  BarChart2, 
  Settings, 
  LogOut,
  Mountain
} from 'lucide-react';

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  activeAlertCount = 0 
}) {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'route-intel', label: 'Route Intelligence', icon: Compass },
    { id: 'live-map', label: 'Live Map', icon: MapIcon },
    { id: 'vehicles', label: 'Vehicles', icon: Truck },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount > 0 ? activeAlertCount : null },
    { id: 'field-reports', label: 'Field Reports', icon: FileSpreadsheet },
    { id: 'authority', label: 'Analytics', icon: BarChart2 }
  ];

  return (
    <aside className="app-sidebar">
      {/* Sidebar Brand Header */}
      <div className="sidebar-brand" style={{ padding: '0.75rem 1rem 0.5rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={`${import.meta.env.BASE_URL}aapdassetu-logo.png`} 
          alt="AapdaSetu Logo" 
          style={{ maxHeight: '100px', width: 'auto', objectFit: 'contain' }}
        />
      </div>

      {/* Primary Navigation Menu */}
      <nav className="sidebar-nav">
        {mainNavItems.map(item => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              id={`sidebar-btn-${item.id}`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              <span>{item.label}</span>
              {item.badge && (
                <span 
                  style={{
                    marginLeft: 'auto',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    lineHeight: '1.2'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Menu */}
      <div className="sidebar-bottom">
        <button 
          className="sidebar-item" 
          onClick={() => alert('AapdaSetu Platform Settings & Calibration\nConnected to Regional Control Room.')}
          title="System Settings"
        >
          <Settings size={17} strokeWidth={1.8} />
          <span>Settings</span>
        </button>
        <button 
          className="sidebar-item" 
          onClick={() => setActivePage('dashboard')}
          title="Logout / Reset"
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Logout</span>
        </button>

        {/* Promotional Regional Lifeline Card */}
        <div 
          style={{
            margin: '0.75rem 0.5rem 0.25rem 0.5rem',
            padding: '0.65rem 0.75rem',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'default'
          }}
        >
          <div style={{
            background: '#0284c7',
            color: '#ffffff',
            borderRadius: '6px',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Mountain size={15} />
          </div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0369a1', lineHeight: 1.25 }}>
            For a Safer<br />Northeast India
          </div>
        </div>
      </div>
    </aside>
  );
}
