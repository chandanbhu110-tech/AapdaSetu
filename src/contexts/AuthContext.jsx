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
   * Official Sign In via Supabase or Local Registered Credentials
   */
  const signInWithEmail = async (email, password) => {
    setAuthError(null);
    const trimmedEmail = (email || '').trim().toLowerCase();

    // 1. Check if user exists in local registered accounts
    const localAccounts = (() => {
      try {
        return JSON.parse(localStorage.getItem('aapdassetu_registered_officials') || '[]');
      } catch {
        return [];
      }
    })();
    const matchingLocal = localAccounts.find(u => u.email?.toLowerCase() === trimmedEmail);

    if (matchingLocal) {
      if (matchingLocal.password && matchingLocal.password !== password) {
        const err = new Error('Invalid email or password.');
        setAuthError(err.message);
        throw err;
      }
      setUser({ id: matchingLocal.id, email: trimmedEmail, user_metadata: matchingLocal });
      setOfficialProfile(matchingLocal);
      setSession({ access_token: 'local-token', user: matchingLocal });
      localStorage.setItem('aapdassetu_demo_official', JSON.stringify(matchingLocal));
      closeAuthModal();
      return { user: matchingLocal, session: { access_token: 'local-token' } };
    }

    // 2. If Supabase is not configured and no local account matched
    if (!isSupabaseConfigured || !supabase) {
      const err = new Error('Official credentials not recognized. Please register an official account or use One-Click Demo Roles.');
      setAuthError(err.message);
      throw err;
    }

    // 3. Attempt Supabase Auth Sign In
    const { data, error } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
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
   * Official Account Registration (Restricted to Officials with Passcode)
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
      const err = new Error(`Invalid Official Authorization Passcode. Please enter "${OFFICIAL_ACCESS_CODE}" to register.`);
      setAuthError(err.message);
      throw err;
    }

    const trimmedEmail = (email || '').trim().toLowerCase();
    const finalFullName = (fullName || '').trim();
    const finalRole = role || 'authority';
    const finalAgency = agency || 'NER Emergency Logistics Unit';
    const finalDesignation = (designation || '').trim() || (finalRole === 'authority' ? 'Disaster Authority Officer' : 'Field Patrol Officer');
    const finalOfficialId = (officialId || '').trim() || `OFF-${Date.now().toString().slice(-6)}`;

    // Standardized Official Profile
    const localOfficialUser = {
      id: `off-${Date.now()}`,
      email: trimmedEmail,
      full_name: finalFullName,
      role: finalRole,
      agency: finalAgency,
      designation: finalDesignation,
      official_id: finalOfficialId,
      isDemo: false,
      isLocalRegistered: true,
      created_at: new Date().toISOString()
    };

    // Helper to persist in local registered officials pool
    const saveToLocalStorage = (acc, plainPassword) => {
      try {
        const existing = JSON.parse(localStorage.getItem('aapdassetu_registered_officials') || '[]');
        const updated = existing.filter(u => u.email?.toLowerCase() !== trimmedEmail);
        updated.push({ ...acc, password: plainPassword });
        localStorage.setItem('aapdassetu_registered_officials', JSON.stringify(updated));
      } catch (e) {
        console.warn('Error saving local registered official:', e);
      }
    };

    // Case A: Supabase is Configured -> Attempt cloud registration
    if (isSupabaseConfigured && supabase) {
      try {
        const metadata = {
          role: finalRole,
          full_name: finalFullName,
          agency: finalAgency,
          designation: finalDesignation,
          official_id: finalOfficialId
        };

        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: metadata
          }
        });

        if (error) {
          console.warn('Supabase remote sign up error:', error.message);
          // If strictly invalid email format, alert the user
          if (error.status === 400 && error.code === 'email_address_invalid') {
            setAuthError(error.message);
            throw error;
          }
          // For other issues (network, rate-limiting), fall back to local registration seamlessly
          saveToLocalStorage(localOfficialUser, password);
          setUser({ id: localOfficialUser.id, email: trimmedEmail, user_metadata: localOfficialUser });
          setOfficialProfile(localOfficialUser);
          setSession({ access_token: 'local-session', user: localOfficialUser });
          localStorage.setItem('aapdassetu_demo_official', JSON.stringify(localOfficialUser));
          return { user: localOfficialUser, session: { access_token: 'local-session' }, isLocalFallback: true };
        }

        // Successfully created user in Supabase
        if (data?.user) {
          setUser(data.user);
          setSession(data.session);

          // Save local backup for seamless sign-in
          saveToLocalStorage({ ...localOfficialUser, id: data.user.id }, password);

          // Attempt upsert in profiles table
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
          const resolvedProf = {
            ...localOfficialUser,
            id: data.user.id,
            ...prof
          };
          setOfficialProfile(resolvedProf);
          localStorage.setItem('aapdassetu_demo_official', JSON.stringify(resolvedProf));
          return {
            ...data,
            resolvedProfile: resolvedProf,
            needsEmailConfirm: !data.session
          };
        }
      } catch (err) {
        if (err.code === 'email_address_invalid') {
          throw err;
        }
        console.warn('Supabase sign up exception, falling back to local account:', err);
        saveToLocalStorage(localOfficialUser, password);
        setUser({ id: localOfficialUser.id, email: trimmedEmail, user_metadata: localOfficialUser });
        setOfficialProfile(localOfficialUser);
        setSession({ access_token: 'local-session', user: localOfficialUser });
        localStorage.setItem('aapdassetu_demo_official', JSON.stringify(localOfficialUser));
        return { user: localOfficialUser, session: { access_token: 'local-session' }, isLocalFallback: true };
      }
    }

    // Case B: Supabase is NOT configured (e.g. GitHub Pages without secrets)
    // Instant local registration so the user can immediately access command features
    saveToLocalStorage(localOfficialUser, password);
    setUser({ id: localOfficialUser.id, email: trimmedEmail, user_metadata: localOfficialUser });
    setOfficialProfile(localOfficialUser);
    setSession({ access_token: 'local-session', user: localOfficialUser });
    localStorage.setItem('aapdassetu_demo_official', JSON.stringify(localOfficialUser));

    return {
      user: localOfficialUser,
      session: { access_token: 'local-session' },
      isLocalRegistered: true
    };
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
