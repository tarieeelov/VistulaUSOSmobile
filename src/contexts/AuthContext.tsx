import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import * as usosApi from '../services/usosApi';
import { cacheClearAll } from '../services/cache';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'demo';

export interface AuthContextType {
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDemo: boolean;
  login: () => Promise<void>;
  enterDemoMode: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Check stored tokens on mount
  useEffect(() => {
    let isMounted = true;

    async function checkExistingAuth() {
      try {
        const redirected = await usosApi.handleRedirectCallbackIfPresent();
        if (!isMounted) return;
        if (redirected) {
          setStatus('authenticated');
          return;
        }

        const tokens = await usosApi.getStoredTokens();
        if (!isMounted) return;

        if (tokens?.session_token) {
          setStatus('authenticated');
        } else {
          setStatus('idle');
        }
      } catch (error) {
        console.warn('[AuthContext] Error checking stored tokens:', error);
        if (isMounted) {
          setStatus('idle');
        }
      }
    }

    checkExistingAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async () => {
    setStatus('loading');
    try {
      await usosApi.login();
      setStatus('authenticated');
    } catch (error) {
      console.warn('[AuthContext] Login failed:', error);
      setStatus('idle');
      throw error;
    }
  }, []);

  const enterDemoMode = useCallback(() => {
    setStatus('demo');
  }, []);

  const logout = useCallback(async () => {
    setStatus('loading');
    try {
      await usosApi.logout();
    } catch (error) {
      console.warn('[AuthContext] Logout error from USOS API:', error);
    }

    try {
      await cacheClearAll();
    } catch (error) {
      console.warn('[AuthContext] Error clearing cache during logout:', error);
    }

    setStatus('idle');
  }, []);

  const isDemo = status === 'demo';
  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

  const value = useMemo(
    () => ({
      status,
      isLoading,
      isAuthenticated,
      isDemo,
      login,
      enterDemoMode,
      logout,
    }),
    [status, isLoading, isAuthenticated, isDemo, login, enterDemoMode, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
