import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser } from '../types';
import { supabase, isSupabaseConfigured, getSupabaseConfig } from '../supabase/client';
import { storage } from '../services/storage';

interface AuthContextType {
  currentUser: AppUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  isSupabaseActive: boolean;
  showSetupModal: boolean;
  setShowSetupModal: (val: boolean) => void;
  signUpWithEmail: (email: string, password: string, name?: string, phone?: string) => Promise<{ success: boolean; message?: string; needsConfirmation?: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string; isAdmin?: boolean }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone?: string) => Promise<void>;
  verifyBackendAdminRole: (email: string) => Promise<{ authorized: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('homemaid_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('homemaid_active_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.role === 'admin';
      }
    } catch {
      // ignore
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const isSupabaseActive = isSupabaseConfigured();

  // Securely verify admin access against the Express server's ADMIN_EMAIL variable
  const verifyBackendAdminRole = async (email: string): Promise<{ authorized: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.authorized) {
        return { authorized: true, message: data.message };
      } else {
        return { authorized: false, message: data.message || data.error };
      }
    } catch (err: any) {
      console.warn('Backend admin role check failed:', err);
      return {
        authorized: false,
        message: 'Could not contact backend security service to verify ADMIN_EMAIL.',
      };
    }
  };

  useEffect(() => {
    const client = supabase;
    if (!isSupabaseActive || !client) {
      setIsLoading(false);
      return;
    }

    // Initialize session and sync with state
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await client.auth.getSession();
        if (error) {
          console.warn('Supabase getSession error:', error.message);
        } else if (session?.user?.email) {
          const userEmail = session.user.email;
          const adminCheck = await verifyBackendAdminRole(userEmail);
          const isUserAdmin = adminCheck.authorized;

          const existingProfile = await storage.getUser(session.user.id);
          const appUser: AppUser = {
            uid: session.user.id,
            email: userEmail,
            name: existingProfile?.name || session.user.user_metadata?.full_name || userEmail.split('@')[0],
            phone: existingProfile?.phone || session.user.user_metadata?.phone || '',
            role: isUserAdmin ? 'admin' : 'customer',
            createdAt: existingProfile?.createdAt || session.user.created_at,
          };

          setCurrentUser(appUser);
          setIsAdmin(isUserAdmin);
          localStorage.setItem('homemaid_active_user', JSON.stringify(appUser));
        } else {
          // If no session found in supabase, check if we should clear local
          if (currentUser && !localStorage.getItem('homemaid_custom_supabase_config')) {
            // Keep if demo or clear
          }
        }
      } catch (err) {
        console.error('Auth initialization error', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state transitions
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user?.email) {
        const userEmail = session.user.email;
        const adminCheck = await verifyBackendAdminRole(userEmail);
        const isUserAdmin = adminCheck.authorized;

        const existingProfile = await storage.getUser(session.user.id);
        const appUser: AppUser = {
          uid: session.user.id,
          email: userEmail,
          name: existingProfile?.name || session.user.user_metadata?.full_name || userEmail.split('@')[0],
          phone: existingProfile?.phone || session.user.user_metadata?.phone || '',
          role: isUserAdmin ? 'admin' : 'customer',
          createdAt: existingProfile?.createdAt || session.user.created_at,
        };

        setCurrentUser(appUser);
        setIsAdmin(isUserAdmin);
        localStorage.setItem('homemaid_active_user', JSON.stringify(appUser));
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setIsAdmin(false);
        localStorage.removeItem('homemaid_active_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseActive]);

  const signUpWithEmail = async (
    email: string,
    password: string,
    name?: string,
    phone?: string
  ) => {
    if (!isSupabaseActive || !supabase) {
      return {
        success: false,
        message: 'Supabase Auth is not configured. Please add your Supabase URL & Anon Key.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name?.trim() || '',
            phone: phone?.trim() || '',
          },
        },
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        // Save initial user profile
        const userProfile: AppUser = {
          uid: data.user.id,
          email: data.user.email || email,
          name: name?.trim() || '',
          phone: phone?.trim() || '',
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        await storage.saveUser(userProfile);

        // Check if confirmation is required
        if (data.session) {
          setCurrentUser(userProfile);
          setIsAdmin(false);
          localStorage.setItem('homemaid_active_user', JSON.stringify(userProfile));
          return { success: true };
        } else {
          return {
            success: true,
            needsConfirmation: true,
            message: 'Registration successful! Please check your email inbox to confirm your account.',
          };
        }
      }

      return { success: false, message: 'Could not create user account.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Sign up failed.' };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseActive || !supabase) {
      return {
        success: false,
        message: 'Supabase Auth is not configured. Please configure credentials to sign in.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user && data.user.email) {
        // Backend check for admin role
        const adminCheck = await verifyBackendAdminRole(data.user.email);
        const isUserAdmin = adminCheck.authorized;

        const existingProfile = await storage.getUser(data.user.id);
        const userProfile: AppUser = {
          uid: data.user.id,
          email: data.user.email,
          name: existingProfile?.name || data.user.user_metadata?.full_name || data.user.email.split('@')[0],
          phone: existingProfile?.phone || data.user.user_metadata?.phone || '',
          role: isUserAdmin ? 'admin' : 'customer',
          createdAt: existingProfile?.createdAt || data.user.created_at,
        };

        await storage.saveUser(userProfile);
        setCurrentUser(userProfile);
        setIsAdmin(isUserAdmin);
        localStorage.setItem('homemaid_active_user', JSON.stringify(userProfile));

        return { success: true, isAdmin: isUserAdmin };
      }

      return { success: false, message: 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Sign in failed.' };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseActive || !supabase) {
      return {
        success: false,
        message: 'Supabase Auth is not configured. Please configure credentials first.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin,
      });

      if (error) {
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: 'Password reset link has been dispatched to your email address.',
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Password reset request failed.' };
    }
  };

  const logout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Signout notice:', err);
      }
    }
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('homemaid_active_user');
  };

  const updateProfile = async (name: string, phone?: string) => {
    if (!currentUser) return;
    const updated: AppUser = {
      ...currentUser,
      name,
      phone: phone !== undefined ? phone : currentUser.phone,
    };
    await storage.saveUser(updated);
    setCurrentUser(updated);
    localStorage.setItem('homemaid_active_user', JSON.stringify(updated));

    if (supabase) {
      try {
        await supabase.auth.updateUser({
          data: { full_name: name, phone: phone || '' },
        });
      } catch (err) {
        console.warn('Supabase updateUser metadata notice:', err);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isLoading,
        isSupabaseActive,
        showSetupModal,
        setShowSetupModal,
        signUpWithEmail,
        signInWithEmail,
        resetPassword,
        logout,
        updateProfile,
        verifyBackendAdminRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
