"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { account } from './config';
import type { Models } from 'appwrite';

interface AuthContextValue {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const u = await account.get();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  async function logout() {
    try { await account.deleteSession('current'); } catch {}
    setUser(null);
  }

  const value: AuthContextValue = { user, loading, refresh: fetchUser, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}