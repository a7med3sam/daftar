'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api, User } from './api';
import { registerPushSubscription, unregisterPushSubscription } from './push';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on first load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const me = await api.auth.me();
        if (active) setUser(me);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Register for push notifications whenever a session becomes active
  useEffect(() => {
    if (user) {
      registerPushSubscription();
    }
  }, [user]);

  const login = useCallback(async (name: string, password: string) => {
    const { user } = await api.auth.login({ name, password });
    setUser(user);
  }, []);

  const register = useCallback(async (name: string, password: string) => {
    const { user } = await api.auth.register({ name, password });
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } finally {
      unregisterPushSubscription();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
