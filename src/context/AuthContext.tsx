import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createAdminAccount,
  validateAdminLogin,
  updateAdminPasswordInDb,
  getAdminAccount,
  getAdminDocId,
} from '../lib/adminAuth';

export interface AdminUserSession {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'superadmin';
}

interface AuthContextType {
  user: AdminUserSession | null;
  userName: string;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, pass: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUserPassword: (newPass: string) => Promise<{ success: boolean; error?: string }>;
  sendResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'maestro_admin_session_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on startup and verify against Firestore
  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = localStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as AdminUserSession;
          if (parsed && parsed.email) {
            // Set immediate session from cache so UI doesn't flicker
            setUser(parsed);
            
            // Verify account in background
            try {
              const record = await getAdminAccount(parsed.email);
              if (record) {
                setUser({
                  uid: getAdminDocId(parsed.email),
                  email: record.email,
                  displayName: record.name,
                  role: record.role || 'admin',
                });
              }
            } catch {
              // Retain cached session
            }
          }
        }
      } catch (err) {
        console.error('Failed to restore admin session:', err);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const userName = user?.displayName || (user?.email ? user.email.split('@')[0] : 'Artist Manager');

  const signIn = async (email: string, pass: string) => {
    try {
      const result = await validateAdminLogin(email, pass);
      if (!result.success || !result.account) {
        return {
          success: false,
          error: result.error || 'Authentication failed. Please verify your credentials.',
        };
      }

      const sessionUser: AdminUserSession = {
        uid: getAdminDocId(result.account.email),
        email: result.account.email,
        displayName: result.account.name,
        role: result.account.role || 'admin',
      };

      setUser(sessionUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Authentication failed. Please try again.',
      };
    }
  };

  const signUp = async (email: string, pass: string, displayName: string) => {
    try {
      const result = await createAdminAccount(email, pass, displayName);
      if (!result.success) {
        return { success: false, error: result.error || 'Failed to create admin ID.' };
      }

      const sessionUser: AdminUserSession = {
        uid: getAdminDocId(email),
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || 'Bharath Kannan',
        role: 'admin',
      };

      setUser(sessionUser);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to register admin ID in Firebase.',
      };
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('Error during sign out:', err);
    }
  };

  const updateUserPassword = async (newPass: string) => {
    if (!user || !user.email) {
      return { success: false, error: 'No active authenticated admin session found.' };
    }
    return await updateAdminPasswordInDb(user.email, newPass);
  };

  const sendResetEmail = async (email: string) => {
    const existing = await getAdminAccount(email);
    if (!existing) {
      return {
        success: false,
        error: 'No admin account found with this email in the database.',
      };
    }
    return {
      success: true,
      error: undefined,
    };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userName,
        loading,
        signIn,
        signUp,
        signOut,
        updateUserPassword,
        sendResetEmail,
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
