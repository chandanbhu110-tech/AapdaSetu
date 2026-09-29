import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import {
  supabase,
  isSupabaseConfigured,
  getProfile,
  upsertProfile
} from '../services/supabaseClient';

const AuthContext = createContext(null);

// Official verification code for authorized personnel onboarding
export const OFFICIAL_ACCESS_CODE = 'NER-OFFICIAL-2025';

// Demo Authority Profile
export const DEMO_AUTHORITY = {
  id: 'demo-authority-001',
  email: 'director.sdma@aapdassetu.gov.in',
  full_name: 'Dr. Anupam Sharma',
  role: 'authority',
  agency: 'State Disaster Management Authority (SDMA)',
  designation: 'Disaster Authority Director',
  official_id: 'SDMA-DIR-101',
  verification_status: 'verified',
  isDemo: true
};

// Demo Field Official Profile
export const DEMO_FIELD_OFFICIAL = {
  id: 'demo-field-002',
  email: 'officer.das@aapdassetu.gov.in',
  full_name: 'Rajesh Das',
  role: 'field_official',
  agency: 'Highway Patrol Ground Unit',
  designation: 'Field Patrol Officer',
  official_id: 'HP-PATROL-402',
  verification_status: 'verified',
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
  const [authModalMode, setAuthModalMode] = useState('login');

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthError(null);
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
    setAuthError(null);
  }, []);

  // ---------------------------------------------------------
  // Get profile from Supabase
  // ---------------------------------------------------------
  const extractProfile = useCallback(async (authUser) => {
    if (!authUser) return null;

    let dbProfile = null;

    if (isSupabaseConfigured && supabase) {
      try {
        dbProfile = await getProfile(authUser.id);
      } catch (error) {
        console.warn('Unable to fetch profile:', error);
      }
    }

    const metadata = authUser.user_metadata || {};

    return {
      id: authUser.id,
      email: authUser.email,

      full_name:
        dbProfile?.full_name ||
        metadata.full_name ||
        'Emergency Official',

      // IMPORTANT:
      // Never trust role from frontend metadata.
      // Prefer the role stored in the database.
      role:
        dbProfile?.role ||
        'field_officer',

      agency:
        dbProfile?.agency ||
        metadata.agency ||
        'NER Logistics Command',

      designation:
        dbProfile?.designation ||
        metadata.designation ||
        'Field Officer',

      official_id:
        dbProfile?.official_id ||
        metadata.official_id ||
        `OFF-${authUser.id.slice(0, 6)}`,

      verification_status:
        dbProfile?.verification_status ||
        'pending',

      verified_by:
        dbProfile?.verified_by ||
        null,

      verified_at:
        dbProfile?.verified_at ||
        null,

      rejection_reason:
        dbProfile?.rejection_reason ||
        null,

      state:
        dbProfile?.state ||
        metadata.state ||
        null,

      district:
        dbProfile?.district ||
        metadata.district ||
        null,

      isDemo: false
    };
  }, []);

  // ---------------------------------------------------------
  // Check whether real account is allowed to enter
  // ---------------------------------------------------------
  const handleVerificationStatus = useCallback(
    async (profile) => {
      if (!profile) return false;

      // Demo accounts are always allowed
      if (profile.isDemo) {
        return true;
      }

      // VERIFIED
      if (profile.verification_status === 'verified') {
        return true;
      }

      // PENDING
      if (profile.verification_status === 'pending') {
        const message =
          'Your official account is awaiting verification by an authorized officer.';

        setAuthError(message);

        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.warn('Error signing out pending user:', error);
          }
        }

        setUser(null);
        setSession(null);
        setOfficialProfile(null);

        return false;
      }

      // REJECTED
      if (profile.verification_status === 'rejected') {
        const reason = profile.rejection_reason
          ? ` Reason: ${profile.rejection_reason}`
          : '';

        const message =
          `Your official account has been rejected.${reason}`;

        setAuthError(message);

        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.warn('Error signing out rejected user:', error);
          }
        }

        setUser(null);
        setSession(null);
        setOfficialProfile(null);

        return false;
      }

      // Unknown status
      const message =
        'Your account verification status is not valid. Please contact the administrator.';

      setAuthError(message);

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.warn('Error signing out invalid user:', error);
        }
      }

      setUser(null);
      setSession(null);
      setOfficialProfile(null);

      return false;
    },
    []
  );

  // ---------------------------------------------------------
  // Initialize authentication
  // ---------------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      setIsLoading(true);

      // Real Supabase session
      if (isSupabaseConfigured && supabase) {
        try {
          const {
            data: { session: currentSession },
            error
          } = await supabase.auth.getSession();

          if (error) {
            console.warn(
              'Supabase getSession error:',
              error.message
            );
          }

          if (mounted && currentSession?.user) {
            const prof = await extractProfile(
              currentSession.user
            );

            if (!mounted) return;

            const allowed =
              await handleVerificationStatus(prof);

            if (allowed) {
              setSession(currentSession);
              setUser(currentSession.user);
              setOfficialProfile(prof);
            }

            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.warn(
            'Error reading Supabase session:',
            error
          );
        }
      }

      // Demo session only
      const savedDemo = localStorage.getItem(
        'aapdassetu_demo_official'
      );

      if (savedDemo && mounted) {
        try {
          const parsed = JSON.parse(savedDemo);

          if (parsed?.isDemo) {
            setUser({
              id: parsed.id,
              email: parsed.email,
              user_metadata: parsed
            });

            setOfficialProfile(parsed);

            setSession({
              access_token: 'demo-token',
              user: parsed
            });
          } else {
            localStorage.removeItem(
              'aapdassetu_demo_official'
            );
          }
        } catch (error) {
          console.warn(
            'Invalid demo session:',
            error
          );

          localStorage.removeItem(
            'aapdassetu_demo_official'
          );
        }
      }

      if (mounted) {
        setIsLoading(false);
      }
    }

    initAuth();

    // -------------------------------------------------------
    // Listen to Supabase auth changes
    // -------------------------------------------------------
    let authListener = null;

    if (isSupabaseConfigured && supabase) {
      const { data } =
        supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;

            if (!newSession?.user) {
              setUser(null);
              setSession(null);

              if (
                !localStorage.getItem(
                  'aapdassetu_demo_official'
                )
              ) {
                setOfficialProfile(null);
              }

              return;
            }

            const prof = await extractProfile(
              newSession.user
            );

            if (!mounted) return;

            const allowed =
              await handleVerificationStatus(prof);

            if (allowed) {
              setSession(newSession);
              setUser(newSession.user);
              setOfficialProfile(prof);

              localStorage.removeItem(
                'aapdassetu_demo_official'
              );
            }
          }
        );

      authListener = data?.subscription;
    }

    return () => {
      mounted = false;

      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [extractProfile, handleVerificationStatus]);

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  const signInWithEmail = async (
    email,
    password
  ) => {
    setAuthError(null);

    const trimmedEmail =
      (email || '').trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      const error = new Error(
        'Authentication service is currently unavailable.'
      );

      setAuthError(error.message);
      throw error;
    }

    try {
      const {
        data,
        error
      } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password
      });

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      if (!data?.user) {
        const error = new Error(
          'Unable to sign in.'
        );

        setAuthError(error.message);
        throw error;
      }

      const prof = await extractProfile(
        data.user
      );

      const allowed =
        await handleVerificationStatus(prof);

      if (!allowed) {
        throw new Error(
          'Your account is not verified.'
        );
      }

      setUser(data.user);
      setSession(data.session);
      setOfficialProfile(prof);

      localStorage.removeItem(
        'aapdassetu_demo_official'
      );

      closeAuthModal();

      return {
        ...data,
        resolvedProfile: prof
      };
    } catch (error) {
      if (
        error?.message !==
        'Your account is not verified.'
      ) {
        setAuthError(
          error?.message ||
          'Unable to sign in.'
        );
      }

      throw error;
    }
  };

  // ---------------------------------------------------------
  // SIGN UP OFFICIAL
  // ---------------------------------------------------------
  const signUpOfficial = async ({
    email,
    password,
    fullName,
    agency,
    designation,
    officialId,
    accessCode,
    role = 'field_officer',
    state = '',
    district = ''
  }) => {
    setAuthError(null);

    // -----------------------------------------------
    // Official authorization code
    // -----------------------------------------------
    if (
      !accessCode ||
      accessCode.trim().toUpperCase() !==
        OFFICIAL_ACCESS_CODE
    ) {
      const error = new Error(
        `Invalid Official Authorization Passcode. Please enter "${OFFICIAL_ACCESS_CODE}" to register.`
      );

      setAuthError(error.message);
      throw error;
    }

    if (!isSupabaseConfigured || !supabase) {
      const error = new Error(
        'Authentication service is currently unavailable. Please configure Supabase before registering an official account.'
      );

      setAuthError(error.message);
      throw error;
    }

    const trimmedEmail =
      (email || '').trim().toLowerCase();

    const finalFullName =
      (fullName || '').trim();

    const finalAgency =
      (agency || '').trim() ||
      'NER Emergency Logistics Unit';

    const finalDesignation =
      (designation || '').trim() ||
      'Field Officer';

    const finalOfficialId =
      (officialId || '').trim() ||
      `OFF-${Date.now()
        .toString()
        .slice(-6)}`;

    const finalState =
      (state || '').trim();

    const finalDistrict =
      (district || '').trim();

    // IMPORTANT:
    // New public registrations are ALWAYS field_officer.
    // They cannot choose admin/authority from frontend.
    const finalRole = 'field_officer';

    const metadata = {
      role: finalRole,
      full_name: finalFullName,
      agency: finalAgency,
      designation: finalDesignation,
      official_id: finalOfficialId,
      state: finalState,
      district: finalDistrict
    };

    try {
      const {
        data,
        error
      } = await supabase.auth.signUp({
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

      if (!data?.user) {
        const error = new Error(
          'Unable to create official account.'
        );

        setAuthError(error.message);
        throw error;
      }

      // -----------------------------------------------
      // Profile is normally created by your Supabase
      // handle_new_user trigger.
      // We only upsert safe fields here.
      // -----------------------------------------------
      try {
        await upsertProfile({
          id: data.user.id,
          email: trimmedEmail,
          full_name: finalFullName,
          role: 'field_officer',
          agency: finalAgency,
          designation: finalDesignation,
          official_id: finalOfficialId,
          state: finalState,
          district: finalDistrict
        });
      } catch (profileError) {
        console.warn(
          'Profile upsert warning:',
          profileError
        );
      }

      const prof =
        await extractProfile(data.user);

      // -----------------------------------------------
      // New accounts MUST remain pending.
      // Never automatically log them into dashboard.
      // -----------------------------------------------
      if (data.session) {
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn(
            'Unable to sign out pending account:',
            signOutError
          );
        }
      }

      setUser(null);
      setSession(null);
      setOfficialProfile(null);

      const pendingProfile = {
        ...prof,
        role: 'field_officer',
        verification_status: 'pending'
      };

      return {
        ...data,

        resolvedProfile:
          pendingProfile,

        needsVerification: true,

        needsEmailConfirm:
          !data.session,

        message:
          'Registration successful. Your account is pending verification by an authorized officer.'
      };
    } catch (error) {
      setAuthError(
        error?.message ||
        'Unable to register official account.'
      );

      throw error;
    }
  };

  // ---------------------------------------------------------
  // SIGN OUT
  // ---------------------------------------------------------
  const signOut = async () => {
    try {
      if (
        isSupabaseConfigured &&
        supabase
      ) {
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.warn(
        'Sign out error:',
        error
      );
    } finally {
      setUser(null);
      setSession(null);
      setOfficialProfile(null);

      localStorage.removeItem(
        'aapdassetu_demo_official'
      );
    }
  };

  // ---------------------------------------------------------
  // DEMO LOGIN
  // ---------------------------------------------------------
  const demoLogin = (
    roleOrProfile = 'authority'
  ) => {
    let demoProf;

    if (
      typeof roleOrProfile === 'string'
    ) {
      demoProf =
        roleOrProfile === 'field_official'
          ? DEMO_FIELD_OFFICIAL
          : DEMO_AUTHORITY;
    } else if (
      roleOrProfile &&
      typeof roleOrProfile === 'object'
    ) {
      demoProf = {
        ...DEMO_AUTHORITY,
        ...roleOrProfile,
        verification_status: 'verified',
        isDemo: true
      };
    } else {
      demoProf = DEMO_AUTHORITY;
    }

    setUser({
      id: demoProf.id,
      email: demoProf.email,
      user_metadata: demoProf
    });

    setOfficialProfile(demoProf);

    setSession({
      access_token: 'demo-token',
      user: demoProf
    });

    localStorage.setItem(
      'aapdassetu_demo_official',
      JSON.stringify(demoProf)
    );

    closeAuthModal();
  };

  // ---------------------------------------------------------
  // AUTH STATUS
  // ---------------------------------------------------------
  const isAuthenticated =
    Boolean(
      user &&
      officialProfile
    );

  const isOfficial =
    Boolean(
      officialProfile?.role === 'official' ||
      officialProfile?.role === 'field_officer' ||
      officialProfile?.role === 'field_official' ||
      officialProfile?.role === 'authority' ||
      officialProfile?.role === 'admin'
    );

  const isAuthority =
    Boolean(
      officialProfile?.role === 'authority' ||
      officialProfile?.role === 'admin'
    );

  const isAdmin =
    officialProfile?.role === 'admin';

  const isVerified =
    officialProfile?.isDemo ||
    officialProfile?.verification_status ===
      'verified';

  const isPending =
    !officialProfile?.isDemo &&
    officialProfile?.verification_status ===
      'pending';

  const isRejected =
    !officialProfile?.isDemo &&
    officialProfile?.verification_status ===
      'rejected';

  // ---------------------------------------------------------
  // CONTEXT
  // ---------------------------------------------------------
  return (
    <AuthContext.Provider
      value={{
        user,
        session,

        officialProfile,

        isAuthenticated,
        isOfficial,
        isAuthority,
        isAdmin,
        isVerified,
        isPending,
        isRejected,

        isLoading,

        authError,
        setAuthError,

        authModalOpen,
        authModalMode,

        openAuthModal,
        closeAuthModal,

        signInWithEmail,
        signUpOfficial,
        signUpNormalUser,
        signOut,

        demoLogin,

        isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const signUpNormalUser = async ({
  email,
  password,
  fullName
}) => {
  setAuthError(null);

  const trimmedEmail = (email || '').trim().toLowerCase();
  const trimmedName = (fullName || '').trim();

  if (!trimmedEmail || !password || !trimmedName) {
    const error = new Error(
      'Name, email and password are required.'
    );

    setAuthError(error.message);
    throw error;
  }

  if (!isSupabaseConfigured || !supabase) {
    const error = new Error(
      'Authentication service is not configured.'
    );

    setAuthError(error.message);
    throw error;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          role: 'public_user'
        }
      }
    });

    if (error) {
      throw error;
    }

    if (data?.user) {
      setUser(data.user);
      setSession(data.session || null);

      const profile = {
        id: data.user.id,
        email: trimmedEmail,
        full_name: trimmedName,
        role: 'public_user'
      };

      setOfficialProfile(profile);

      return {
        ...data,
        profile,
        needsEmailConfirm: !data.session
      };
    }

    return data;

  } catch (error) {
    console.error(
      'Normal user registration error:',
      error
    );

    setAuthError(
      error.message ||
      'Unable to create account.'
    );

    throw error;
  }
};

// ---------------------------------------------------------
// useAuth Hook
// ---------------------------------------------------------
export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}