import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, getProfile, upsertProfile } from '../services/supabaseClient';

const AuthContext = createContext(null);

// Official verification code for authorized personnel onboarding
export const OFFICIAL_ACCESS_CODE = 'NER-OFFICIAL-2025';

// Pre-configured Authority Profile (Can verify field reports & command actions)
export const DEMO_AUTHORITY = {
  id: 'demo-authority-001',
  email: 'director.sdma@aapdassetu.gov.in',
  full_name: 'Dr. Anupam Sharma',
  role: 'authority',
  agency: 'State Disaster Management Authority (SDMA)',
  designation: 'Disaster Authority Director',
  official_id: 'SDMA-DIR-101',
  isDemo: true
};

// Pre-configured Field Official Profile (Can report incidents, CANNOT verify)
export const DEMO_FIELD_OFFICIAL = {
  id: 'demo-field-002',
  email: 'officer.das@aapdassetu.gov.in',
  full_name: 'Rajesh Das',
  role: 'field_official',
  agency: 'Highway Patrol Ground Unit',
  designation: 'Field Patrol Officer',
  official_id: 'HP-PATROL-402',
  isDemo: true
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [officialProfile, setOfficialProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Modal UI state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthError(null);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthError(null);
  }, []);

  // Helper to construct normalized official profile
  const extractProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    // First try fetching custom profile row from Supabase profiles table
    let dbProfile = null;
    if (isSupabaseConfigured && supabase) {
      dbProfile = await getProfile(authUser.id);
    }

    const metadata = authUser.user_metadata || {};
    return {
      id: authUser.id,
      email: authUser.email,
      full_name: dbProfile?.full_name || metadata.full_name || 'Emergency Official',
      role: dbProfile?.role || metadata.role || 'official',
      agency: dbProfile?.agency || metadata.agency || 'NER Logistics Command',
      designation: dbProfile?.designation || metadata.designation || 'Operations Officer',
      official_id: dbProfile?.official_id || metadata.official_id || `OFF-${authUser.id.slice(0, 6)}`,
      isDemo: false
    };
  }, []);

  // Initialize auth session on mount
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);

      // 1. Check active Supabase session if configured
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Supabase getSession error:', error.message);
          }

          if (mounted && currentSession?.user) {
            setSession(currentSession);
            setUser(currentSession.user);
            const prof = await extractProfile(currentSession.user);
            if (mounted) setOfficialProfile(prof);
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Error reading Supabase session:', err);
        }
      }

      // 2. Check local storage for persistent demo session
      const savedDemo = localStorage.getItem('aapdassetu_demo_official');
      if (savedDemo) {
        try {
          const parsed = JSON.parse(savedDemo);
          if (mounted) {
            setUser({ id: parsed.id, email: parsed.email, user_metadata: parsed });
            setOfficialProfile(parsed);
          }
        } catch (_e) {
          localStorage.removeItem('aapdassetu_demo_official');
        }
      }

      if (mounted) setIsLoading(false);
    }

    initAuth();

    // Listen to Supabase auth state changes
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          const prof = await extractProfile(newSession.user);
          if (mounted) setOfficialProfile(prof);
          localStorage.removeItem('aapdassetu_demo_official');
        } else if (!localStorage.getItem('aapdassetu_demo_official')) {
          if (mounted) setOfficialProfile(null);
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      mounted = false;
      if (authListener) authListener.unsubscribe();
    };
  }, [extractProfile]);

  /**
   * Official Sign In via Supabase Email & Password
   */
  const signInWithEmail = async (email, password) => {
    setAuthError(null);

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables or use Demo Official Login.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      const prof = await extractProfile(data.user);
      setOfficialProfile(prof);
      localStorage.removeItem('aapdassetu_demo_official');
      closeAuthModal();
      return data;
    }

    return data;
  };

  /**
   * Official Account Registration (Restricted to Officials only)
   */
  const signUpOfficial = async ({
    email,
    password,
    fullName,
    agency,
    designation,
    officialId,
    accessCode,
    role = 'authority'
  }) => {
    setAuthError(null);

    // Enforce official verification passkey
    if (!accessCode || accessCode.trim().toUpperCase() !== OFFICIAL_ACCESS_CODE) {
      const err = new Error(`Invalid Official Authorization Passcode. Please contact the Regional Disaster Logistics Unit for onboarding credentials.`);
      setAuthError(err.message);
      throw err;
    }

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured. Please check your environment variables or use Demo Official Login.');
    }

    const trimmedEmail = email.trim();
    const metadata = {
      role: role || 'authority',
      full_name: fullName.trim(),
      agency: agency || 'NER Logistics Command',
      designation: designation || (role === 'authority' ? 'Disaster Authority Officer' : 'Field Patrol Officer'),
      official_id: officialId || `OFF-${Date.now().toString().slice(-6)}`
    };

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    // If auto-confirmed or user created, attempt profile table insertion
    if (data?.user) {
      setUser(data.user);
      setSession(data.session);

      await upsertProfile({
        id: data.user.id,
        email: trimmedEmail,
        full_name: metadata.full_name,
        role: metadata.role,
        agency: metadata.agency,
        designation: metadata.designation,
        official_id: metadata.official_id
      });

      const prof = await extractProfile(data.user);
      setOfficialProfile(prof);
      localStorage.removeItem('aapdassetu_demo_official');
    }

    return data;
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setOfficialProfile(null);
      localStorage.removeItem('aapdassetu_demo_official');
    }
  };

  /**
   * Instant One-Click Demo Login (Authority vs Field Official)
   */
  const demoLogin = (roleOrProfile = 'authority') => {
    let demoProf;
    if (typeof roleOrProfile === 'string') {
      demoProf = roleOrProfile === 'field_official' ? DEMO_FIELD_OFFICIAL : DEMO_AUTHORITY;
    } else if (roleOrProfile && typeof roleOrProfile === 'object') {
      demoProf = { ...DEMO_AUTHORITY, ...roleOrProfile };
    } else {
      demoProf = DEMO_AUTHORITY;
    }

    setUser({ id: demoProf.id, email: demoProf.email, user_metadata: demoProf });
    setOfficialProfile(demoProf);
    setSession({ access_token: 'demo-token', user: demoProf });
    localStorage.setItem('aapdassetu_demo_official', JSON.stringify(demoProf));
    closeAuthModal();
  };

  const isAuthenticated = Boolean(user || officialProfile);
  const isOfficial = Boolean(
    officialProfile?.role === 'official' || 
    officialProfile?.role === 'field_official' ||
    officialProfile?.role === 'authority' ||
    officialProfile?.role === 'admin' ||
    user?.user_metadata?.role
  );
  const isAuthority = Boolean(
    officialProfile?.role === 'authority' || 
    officialProfile?.role === 'admin' ||
    user?.user_metadata?.role === 'authority' ||
    user?.user_metadata?.role === 'admin'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        officialProfile,
        isAuthenticated,
        isOfficial,
        isAuthority,
        isLoading,
        authError,
        setAuthError,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpOfficial,
        signOut,
        demoLogin,
        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
