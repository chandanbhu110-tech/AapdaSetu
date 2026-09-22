import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  BadgeCheck, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useAuth, OFFICIAL_ACCESS_CODE } from '../../contexts/AuthContext';

const OFFICIAL_AGENCIES = [
  'NER Emergency Logistics Unit',
  'NDMA (National Disaster Management Authority)',
  'SDMA (State Disaster Management Authority)',
  'BRO (Border Roads Organisation)',
  'State Police & Highway Patrol',
  'Health & Medical Emergency Relief',
  'Public Works Department (PWD)',
  'Assam Rifles / Paramilitary Logistics'
];

export default function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    signInWithEmail,
    signUpOfficial,
    demoLogin,
    authError,
    setAuthError
  } = useAuth();

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States (Official Only)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAgency, setRegAgency] = useState(OFFICIAL_AGENCIES[0]);
  const [regDesignation, setRegDesignation] = useState('');
  const [regOfficialId, setRegOfficialId] = useState('');
  const [regRole, setRegRole] = useState('authority'); // 'authority' | 'field_official'
  const [regAccessCode, setRegAccessCode] = useState(OFFICIAL_ACCESS_CODE);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status & Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!authModalOpen) return null;

  // Handle Sign In Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter both official email and password.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      await signInWithEmail(loginEmail, loginPassword);
      setSuccessMessage('Official authenticated successfully!');
      setTimeout(() => closeAuthModal(), 800);
    } catch (err) {
      console.warn('Login attempt failed:', err);
      setAuthError(err.message || 'Official Sign In failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Official Registration Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regFullName.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setAuthError('Please enter your official email address.');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    if (!regAccessCode.trim()) {
      setAuthError('Official Authorization Passcode is required to create an official account.');
      return;
    }

    setIsSubmitting(true);
    setAuthError(null);
    setSuccessMessage(null);

    try {
      const res = await signUpOfficial({
        email: regEmail,
        password: regPassword,
        fullName: regFullName,
        agency: regAgency,
        designation: regDesignation || (regRole === 'authority' ? 'Disaster Authority Officer' : 'Field Patrol Officer'),
        officialId: regOfficialId || `OFF-${Date.now().toString().slice(-5)}`,
        accessCode: regAccessCode,
        role: regRole
      });

      const roleTitle = regRole === 'authority' ? 'Disaster Authority' : 'Field Official';
      setSuccessMessage(`Official account created! Logged in as ${roleTitle} (${regFullName.trim()}).`);
      setTimeout(() => closeAuthModal(), 1000);
    } catch (err) {
      console.warn('Registration attempt failed:', err);
      setAuthError(err.message || 'Official account registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={closeAuthModal}>
      <div 
        className="auth-modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="auth-modal-header">
          <div className="auth-header-brand">
            <div className="auth-logo-badge">
              <ShieldCheck size={22} className="auth-shield-icon" />
            </div>
            <div>
              <h2 className="auth-title">AapdaSetu Command Access</h2>
              <p className="auth-subtitle">Official Emergency Logistics & Incident Monitoring</p>
            </div>
          </div>
          <button 
            className="auth-close-btn" 
            onClick={closeAuthModal} 
            title="Close modal"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Official Only Policy Banner */}
        <div className="auth-official-notice">
          <ShieldAlert size={16} className="notice-icon" />
          <div className="notice-text">
            <strong>Official Access Only:</strong> Only accredited emergency response and logistics personnel have privileges to register operational accounts.
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="auth-tabs-nav">
          <button
            type="button"
            className={`auth-tab-btn ${authModalMode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setAuthError(null);
              setSuccessMessage(null);
              openAuthModal('login');
            }}
          >
            <Lock size={15} />
            <span>Official Sign In</span>
          </button>

          <button
            type="button"
            className={`auth-tab-btn ${authModalMode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setAuthError(null);
              setSuccessMessage(null);
              openAuthModal('register');
            }}
          >
            <BadgeCheck size={15} />
            <span>Register Official Account</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {authError && (
          <div className="auth-alert error">
            <AlertCircle size={16} className="alert-icon" />
            <span>{authError}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Tab 1: Official Sign In */}
        {authModalMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Official Email</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input"
                  placeholder="officer@disaster.gov.in"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label" htmlFor="login-password">Password</label>
              </div>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  title={showLoginPassword ? 'Hide password' : 'Show password'}
                >
                  {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-spinner-wrap">Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Command Center</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Official Shortcut */}
            <div className="auth-divider">
              <span>ONE-CLICK INSTANT DEMO ROLES</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => demoLogin('authority')}
                title="Sign in as Disaster Authority Officer with report verification privileges"
                style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534', padding: '0.65rem 0.85rem' }}
                id="btn-demo-authority"
              >
                <ShieldCheck size={18} color="#16a34a" style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Authority: Dr. Anupam Sharma (SDMA Director)</div>
                  <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Command Authority • Can Verify Hazard Reports</div>
                </div>
              </button>

              <button
                type="button"
                className="auth-demo-btn"
                onClick={() => demoLogin('field_official')}
                title="Sign in as Field Official without report verification privileges"
                style={{ background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155', padding: '0.65rem 0.85rem' }}
                id="btn-demo-field"
              >
                <User size={18} color="#64748b" style={{ flexShrink: 0 }} />
                <div style={{ textAlign: 'left', lineHeight: 1.25 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>Field Official: Rajesh Das (Highway Patrol)</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Ground Operations • Submit Only (Cannot Verify)</div>
                </div>
              </button>
            </div>

            <div className="auth-footer-prompt">
              Authorized official without an account?{' '}
              <button 
                type="button" 
                className="link-btn" 
                onClick={() => openAuthModal('register')}
              >
                Register Official Account
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Official Account Registration */}
        {authModalMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            {/* Operational Role Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-role">Official Operational Role</label>
              <div className="input-with-icon">
                <ShieldCheck size={16} className="input-icon" />
                <select
                  id="reg-role"
                  className="form-input select-input"
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  style={{ fontWeight: 600, color: regRole === 'authority' ? '#0284c7' : '#334155' }}
                >
                  <option value="authority">Disaster Authority (Command Level • Has Report Verification Privileges)</option>
                  <option value="field_official">Field Official / Patrol Officer (Ground Unit • Submit Reports Only)</option>
                </select>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Major R. Das"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Official Email</label>
                <div className="input-with-icon">
                  <Mail size={16} className="input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className="form-input"
                    placeholder="officer@agency.gov.in"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-agency">Department / Agency</label>
                <div className="input-with-icon">
                  <Building2 size={16} className="input-icon" />
                  <select
                    id="reg-agency"
                    className="form-input select-input"
                    value={regAgency}
                    onChange={(e) => setRegAgency(e.target.value)}
                  >
                    {OFFICIAL_AGENCIES.map(agency => (
                      <option key={agency} value={agency}>{agency}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-designation">Designation / Rank</label>
                <div className="input-with-icon">
                  <BadgeCheck size={16} className="input-icon" />
                  <input
                    id="reg-designation"
                    type="text"
                    className="form-input"
                    placeholder={regRole === 'authority' ? 'e.g. Disaster Authority Director' : 'e.g. Highway Patrol Officer'}
                    value={regDesignation}
                    onChange={(e) => setRegDesignation(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-official-id">Official Badge / ID</label>
                <div className="input-with-icon">
                  <ShieldCheck size={16} className="input-icon" />
                  <input
                    id="reg-official-id"
                    type="text"
                    className="form-input"
                    placeholder="NER-LOG-804"
                    value={regOfficialId}
                    onChange={(e) => setRegOfficialId(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="reg-access-code">Official Auth Passcode</label>
                  <span className="helper-badge" title="Verification code ensuring only authorized officials register">Default: NER-OFFICIAL-2025</span>
                </div>
                <div className="input-with-icon">
                  <KeyRound size={16} className="input-icon" />
                  <input
                    id="reg-access-code"
                    type="text"
                    className="form-input"
                    placeholder="NER-OFFICIAL-2025"
                    value={regAccessCode}
                    onChange={(e) => setRegAccessCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Min 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input
                    id="reg-confirm-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-primary-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="btn-spinner-wrap">Creating Official Account...</span>
              ) : (
                <>
                  <span>Create Official Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            <div className="auth-footer-prompt">
              Already an authorized official?{' '}
              <button 
                type="button" 
                className="link-btn" 
                onClick={() => openAuthModal('login')}
              >
                Sign In
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
